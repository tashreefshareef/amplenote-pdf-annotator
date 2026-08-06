(() => {
  // lib/plugin-constants.js
  var DEFAULT_BRANCH = "main";
  var CODE_HEADING = "Code block";
  var MAX_REPLACE_CONTENT_LENGTH = 1e5;
  var ENTRY_LOCATIONS = [
    "lib/plugin.js",
    "plugin.js",
    "index.js"
  ];
  var TEST_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";

  // lib/plugin-import-inliner.js
  function mainBlockFromEntryContent(content) {
    if (content) {
      console.log("Found", content.length, "sized content to parse into block");
    } else {
      console.error("No content found in block to import");
      return {};
    }
    content = content.trim();
    if (content.split("\n")[0].includes("(() => {") && /}\)\(\);$/.test(content)) {
      console.debug("Content matches esbuildBlock");
      const esbuildBlock = content.replace(/}\)\(\);$/, "  return plugin;\n})()");
      return { esbuildBlock };
    } else {
      console.debug("No esbuildBlock match found. Parsing content as standard block");
      const mainPluginBlock = content.match(/=[\s]*(\{\n[\S\s]*\n\})/)?.at(1);
      return { mainPluginBlock };
    }
  }
  async function inlineImportsFromGithub(plugin2, entryPoint, codeBlockString, functionTranslations, constantTranslations) {
    const { content, url } = entryPoint;
    if (!content)
      return null;
    const extension = url.split(".").pop();
    const importUrls = importUrlsFromContent(plugin2, content, extension, url);
    if (!importUrls.length) {
      console.log("No import URLs found in", url);
      return codeBlockString;
    }
    await constantDeclarationsFromFileContent(plugin2, content, constantTranslations);
    const codeWithoutFinalBrace = codeBlockString.substring(0, codeBlockString.lastIndexOf("}"));
    const finalBrace = codeWithoutFinalBrace.lastIndexOf("}");
    if (finalBrace === -1)
      throw new Error("Could not find any functions in code block");
    if (codeBlockString[finalBrace + 1] !== ",") {
      codeBlockString = codeBlockString.substring(0, finalBrace + 1) + "," + codeBlockString.substring(finalBrace + 1);
    }
    for (const importUrl of importUrls) {
      if (functionTranslations.find((translation) => translation.importUrl === importUrl)) {
        console.log("Skipping", importUrl, "because it was already inlined");
        continue;
      }
      const importFileContent = await fileContentFromUrl(importUrl);
      if (importFileContent) {
        console.info("Received", importFileContent.length, "bytes from", importUrl, " Now processing its constants & functions...");
      } else {
        plugin2.processingError = "No file content found";
        console.error("No file content found for", importUrl, "in", url);
        continue;
      }
      const functionBlocks = await functionBlocksFromFileContent(plugin2, importFileContent);
      if (functionBlocks) {
        codeBlockString = codeBlockFromFunctionBlocks(plugin2, codeBlockString, functionBlocks, functionTranslations, importUrl);
      }
      functionTranslations.forEach((translation) => {
        const replaceIndependentFunctionRegex = new RegExp(`(?<![\\_\\.])\\b${translation.functionName}\\b`, "g");
        codeBlockString = codeBlockString.replace(replaceIndependentFunctionRegex, `this.${translation.newFunctionName}`);
      });
      await constantDeclarationsFromFileContent(plugin2, importFileContent, constantTranslations);
      constantTranslations.forEach((translation) => {
        const replaceConstantRegex = new RegExp(`(?<![\\_\\.])\\b${translation.constantName}`, "g");
        const formattedConstantValue = translation.constantValue.replace(/\n/g, " ").replace(/\s{2,1000}/g, " ");
        codeBlockString = codeBlockString.replace(replaceConstantRegex, formattedConstantValue);
      });
      const newEntryPoint = { url: importUrl, content: importFileContent };
      codeBlockString = await inlineImportsFromGithub(plugin2, newEntryPoint, codeBlockString, functionTranslations, constantTranslations);
      console.debug("Successfully finished processing", importUrl);
    }
    return codeBlockString;
  }
  async function fetchWithRetry(url, { retries = 2, gracefulFail = false } = {}) {
    const timeoutSeconds = 30;
    let error;
    const apiURL = new URL(`https://plugins.amplenote.com/cors-proxy`);
    url = url.replace("/github.com", "/raw.githubusercontent.com");
    apiURL.searchParams.set("apiurl", url);
    for (let i = 0; i < retries; i++) {
      try {
        let timeoutId;
        const controller = new AbortController();
        const signal = controller.signal;
        let headers = { "Content-Type": "text/plain", "Cache-Control": "max-age=0" };
        if (typeof global === "object") {
          headers["User-Agent"] = TEST_USER_AGENT;
          headers["Origin"] = "https://plugins.amplenote.com";
          console.log("Detected test environment. Off to fetch", apiURL.toString(), "with headers", headers);
        }
        const fetchPromise = fetch(apiURL, {
          cache: "no-store",
          method: "GET",
          headers
        });
        const timeoutPromise = new Promise(
          (_, reject) => timeoutId = setTimeout(() => {
            controller.abort();
            reject(new Error("Timeout"));
          }, timeoutSeconds * 1e3)
        );
        let result = await Promise.race([fetchPromise, timeoutPromise]);
        clearTimeout(timeoutId);
        return result;
      } catch (e) {
        if (gracefulFail) {
          console.log(`Failed to grab ${url}`, e, `at ${/* @__PURE__ */ new Date()}. Oh well, moving on...`);
        } else {
          error = e;
          console.error(`Fetch attempt ${i + 1} failed with`, e, `at ${/* @__PURE__ */ new Date()}. Retrying...`);
        }
      }
    }
    return null;
  }
  async function functionBlocksFromFileContent(plugin2, fileContent) {
    let result = {};
    const functionRegex = /^(?:export\s+)?((?:async\s+)?function\s*(\*)?\s*(?<functionName>[^\s\(]+)\s*\(|(?:const|let)\s+(?<variableName>[^\s=]+)\s*=\s*(?:async)?\s*(?:\(\)|\((?<variableParams>[^)]+)\))\s*=>)/gm;
    const functionCodeDeclarations = Array.from(fileContent.matchAll(functionRegex));
    for (const functionDeclarationMatch of functionCodeDeclarations) {
      try {
        if (Number.isInteger(functionDeclarationMatch?.index)) {
          const functionStartIndex = functionDeclarationMatch.index;
          const remainingContent = fileContent.substring(functionStartIndex);
          const blockEndMatch = remainingContent.match(/^}\)?;?\s*(\n|$)/m);
          if (blockEndMatch?.index) {
            const functionEndIndex = functionStartIndex + blockEndMatch.index + 1;
            const functionBlock = fileContent.substring(functionStartIndex, functionEndIndex);
            const functionName = functionDeclarationMatch.groups?.functionName || functionDeclarationMatch.groups?.variableName;
            const newFunctionBlock = functionBlock.replace(/export\s+/, "");
            result[functionName] = newFunctionBlock;
          }
        }
      } catch (e) {
        plugin2.processingError = "Failed to process function declaration";
        console.error("Failed to process function declaration", functionDeclarationMatch, "with", e);
      }
    }
    return result;
  }
  var fileContentFromUrl = async (url) => {
    let fileContent;
    const moduleFetchResponse = await fetchWithRetry(url, { retries: 1, gracefulFail: true });
    if (moduleFetchResponse?.ok && (fileContent = await moduleFetchResponse.text())) {
      return fileContent;
    } else {
      console.log("Failed to fetch", url, "with", moduleFetchResponse);
      return null;
    }
  };
  function importUrlsFromContent(plugin2, content, extension, contentFileUrl) {
    let match;
    const importUrls = [];
    const importRegex = /import\s+\{\s*([^}]+)\s*}\s+from\s+['"]([^'"]+)['"]/mg;
    while ((match = importRegex.exec(content)) !== null) {
      let importUrl = "";
      try {
        importUrl = match[2];
        if (importUrl.startsWith("./")) {
          importUrl = `${contentFileUrl.split("/").slice(0, -1).join("/")}/${importUrl.replace("./", "")}`;
        } else {
          const baseUrl = contentFileUrl.split("/").slice(0, 7).join("/");
          importUrl = `${baseUrl}/${importUrl}`;
        }
        if (!/\.[jt]s$/.test(importUrl)) {
          importUrl += `.${extension}`;
        }
        importUrls.push(importUrl);
      } catch (e) {
        plugin2.processingError = "Failed to parse importUrl: " + importUrl;
        console.error("Failed to parse import URL", importUrl, "from", contentFileUrl, "with", e, "Match had been", match);
      }
    }
    return importUrls;
  }
  function codeBlockFromFunctionBlocks(plugin2, codeBlockString, functionBlocks, functionTranslations, importUrl) {
    for (let [functionName, functionBlock] of Object.entries(functionBlocks)) {
      try {
        const functionLines = functionBlock.split("\n");
        const firstLine = functionLines[0];
        const paramStartPos = firstLine.indexOf("(");
        let paramsTraversePos = paramStartPos + 1;
        let paramEndPos = null, paramCount = 1;
        while (paramsTraversePos < functionBlock.length) {
          const char = functionBlock[paramsTraversePos];
          if (char === "(") {
            paramCount += 1;
          } else if (char === ")") {
            paramCount -= 1;
            if (paramCount === 0) {
              paramEndPos = paramsTraversePos;
              break;
            }
          }
          paramsTraversePos += 1;
        }
        const definition = functionBlock.substring(0, paramEndPos + 1);
        const isAsync = /\basync\b/.test(definition);
        const isGenerator = /function\s*\*\s*/.test(definition);
        const params = functionBlock.substring(paramStartPos + 1, paramEndPos).replace(/\n/g, " ").replace(/\s+/g, " ").trim();
        const urlSegments = importUrl.split("/");
        const newFunctionName = `_inlined_${urlSegments[urlSegments.length - 1].replace(/[^\w]/g, "_")}_${functionName}`;
        functionTranslations.push({ functionName, newFunctionName, importUrl });
        const newDefinition = `${isAsync ? "async " : ""}${isGenerator ? "*" : ""}${newFunctionName}(${params})`;
        let newFunctionBlock = functionBlock.replace(definition, newDefinition).split("\n").map((line) => `  ${line}`).join("\n");
        newFunctionBlock = `
  // --------------------------------------------------------------------------------------
  ${newFunctionBlock.trim()}${newFunctionBlock.trim().endsWith(",") ? "" : ","}
`;
        const endBracket = codeBlockString.lastIndexOf("}");
        codeBlockString = codeBlockString.substring(0, endBracket) + newFunctionBlock + codeBlockString.substring(endBracket);
      } catch (e) {
        plugin2.processingError = "Function import failed for " + functionName;
        console.error("Failed to process function ", functionName, "block", functionBlock, "with", e);
      }
    }
    return codeBlockString;
  }
  async function constantDeclarationsFromFileContent(plugin2, fileContent, constantTranslations) {
    const constantRegex = /^(?:export\s+)?\s*(?:const|let|var)\s+(?<constantName>[A-Z][A-Z0-9_]*)\s*=[\s\b]+(?<constantValueStart>[\[{("'0-9])/gm;
    const constantDeclarations = Array.from(fileContent.matchAll(constantRegex));
    for (const constantDeclarationMatch of constantDeclarations) {
      try {
        if (Number.isInteger(constantDeclarationMatch?.index) && constantDeclarationMatch.groups?.constantValueStart) {
          const constantStartIndex = constantDeclarationMatch.index;
          const constantAdjacentText = fileContent.substring(constantStartIndex);
          const startIndex = constantAdjacentText.indexOf(constantDeclarationMatch.groups?.constantValueStart);
          let endIndex;
          if (/[0-9]/.test(constantDeclarationMatch.groups?.constantValueStart)) {
            endIndex = startIndex + constantAdjacentText.substring(startIndex).search(/[^0-9]/) - 1;
          } else {
            const endCharacter = { "(": ")", "{": "}", '"': '"', "'": "'", "[": "]" }[constantDeclarationMatch.groups?.constantValueStart];
            const endOffset = constantAdjacentText.substring(startIndex + 1).indexOf(endCharacter);
            endIndex = startIndex + endOffset + 1;
          }
          if (endIndex !== -1 && startIndex !== -1) {
            const constantValue = constantAdjacentText.substring(startIndex, endIndex + 1);
            const constantName = constantDeclarationMatch.groups?.constantName;
            constantTranslations.push({ constantName, constantValue });
          }
        }
      } catch (e) {
        plugin2.processingError = "Constant import failed";
        console.error("Failed to process constant declaration", constantDeclarationMatch, "with", e);
      }
    }
  }

  // lib/plugin.js
  var plugin = {
    //----------------------------------------------------------------------
    _constants: {
      defaultBranch: DEFAULT_BRANCH,
      codeHeading: CODE_HEADING,
      entryLocations: ENTRY_LOCATIONS,
      maxReplaceContentLength: MAX_REPLACE_CONTENT_LENGTH
    },
    processingError: false,
    //----------------------------------------------------------------------
    insertText: {
      "Refresh": {
        check: async function(app) {
          return !!await this._githubRepoUrl(app, { quietFail: true });
        },
        run: async function(app, stripConsoleDebug = false) {
          this.processingError = false;
          const githubUrl = await this._githubRepoUrl(app);
          if (githubUrl) {
            await this._syncUrlToNote(app, githubUrl, stripConsoleDebug);
          } else {
            await app.alert(`Could not find a line beginning in "repo:" or "entry:" in the note.`);
          }
        }
      },
      "Sync": {
        check: async function(app) {
          const boundCheck = this.insertText["Refresh"].check.bind(this);
          return await boundCheck(app);
        },
        run: async function(app) {
          const boundRun = this.insertText["Refresh"].run.bind(this);
          return await boundRun(app);
        }
      }
    },
    //----------------------------------------------------------------------
    noteOption: {
      "Refresh": {
        check: async function(app) {
          const boundCheck = this.insertText["Refresh"].check.bind(this);
          return await boundCheck(app);
        },
        run: async function(app) {
          const boundRun = this.insertText["Refresh"].run.bind(this);
          return await boundRun(app);
        }
      },
      "Refresh minus debug": {
        check: async function(app) {
          const boundCheck = this.insertText["Refresh"].check.bind(this);
          return await boundCheck(app);
        },
        run: async function(app) {
          const boundRun = this.insertText["Refresh"].run.bind(this);
          return await boundRun(app, true);
        }
      }
    },
    //----------------------------------------------------------------------
    async _syncUrlToNote(app, repoUrl, stripConsoleDebug = false) {
      const entryPoint = await this._entryPointFromUrl(app, repoUrl);
      if (entryPoint.url) {
        // PATCH (not upstream): `app.notes.find(uuid)` returning a Note object with
        // .content()/.replaceContent()/.insertContent() is not part of the real
        // Amplenote app interface - verified directly against a live plugin action
        // today. Real app has getNoteContent/replaceNoteContent/insertNoteContent
        // taking a { uuid } handle. Every call in this function is rewritten to that
        // surface; see docs/api-notes.md in tashreefshareef/amplenote-pdf-annotator.
        const noteHandle = { uuid: app.context.noteUUID };
        let noteContent = await app.getNoteContent(noteHandle);
        if (!await this._isAbleToSync(app, noteContent)) {
          return null;
        }
        if (!entryPoint.content) {
          console.error("Could not find a valid entry point in repo", repoUrl, "at", entryPoint.url);
          return null;
        }
        const { esbuildBlock, mainPluginBlock } = mainBlockFromEntryContent(entryPoint.content);
        let newPluginBlock;
        if (esbuildBlock) {
          newPluginBlock = esbuildBlock;
        } else {
          const constantTranslations = [];
          const functionTranslations = [];
          newPluginBlock = await inlineImportsFromGithub(this, entryPoint, mainPluginBlock, functionTranslations, constantTranslations);
        }
        if (newPluginBlock) {
          if (stripConsoleDebug) {
            newPluginBlock = newPluginBlock.replace(/^\s*(console\.debug)/gm, `// $1`);
          }
          if (newPluginBlock.length > this._constants.maxReplaceContentLength) {
            await app.alert(`The code block (length ${newPluginBlock.length}) is too long to replace (max size ${this._constants.maxReplaceContentLength}).Please manually replace the code block in the note, or email support@amplenote.com to request an increase in the size of replaceContent.`);
          } else {
            newPluginBlock = `\`\`\`
// Javascript updated ${(/* @__PURE__ */ new Date()).toLocaleString()} by Amplenote Plugin Builder from source code within "${repoUrl}"
${newPluginBlock}
\`\`\``;
            noteContent = await app.getNoteContent(noteHandle);
            const replaceTarget = this._sectionFromHeadingText(this._constants.codeHeading, noteContent);
            if (replaceTarget) {
              await app.replaceNoteContent(noteHandle, newPluginBlock, replaceTarget);
            }
            if (!replaceTarget || this.processingError) {
              if (replaceTarget) {
                await app.alert(`\u26A0\uFE0F Plugin refresh from "${repoUrl}" completed, but errors were encountered:

` + this.processingError + `

Please check your console for more details.`);
              } else {
                await app.alert(`\u26A0\uFE0F Plugin refresh from "${repoUrl}" failed. Could not find "${this._constants.codeHeading}" within note content.`);
              }
            } else {
              await app.alert(`\u{1F389} Plugin refresh from "${repoUrl}" succeeded at ${(/* @__PURE__ */ new Date()).toLocaleString()}`);
            }
          }
        } else {
          await app.alert("Could not construct a code block from the entry point URL. There may be more details in the console.");
          return null;
        }
      }
    },
    //----------------------------------------------------------------------
    _sectionFromHeadingText(headingText, noteContent, { level = 1 } = {}) {
      let headingTextInNote;
      if (noteContent.includes(headingText)) {
        headingTextInNote = headingText;
      } else {
        const headingIndex = noteContent.toLowerCase().indexOf(headingText.toLowerCase());
        if (headingIndex > 0) {
          headingTextInNote = noteContent.substring(headingIndex, headingIndex + headingText.length);
        } else {
          return null;
        }
      }
      if (headingTextInNote) {
        return { section: { heading: { text: headingTextInNote, level } } };
      } else {
        return null;
      }
    },
    //----------------------------------------------------------------------
    async _isAbleToSync(app, noteContent) {
      if (noteContent.toLowerCase().includes(this._constants.codeHeading.toLowerCase())) {
        return true;
      } else {
        if (/^```/m.test(noteContent)) {
          await app.alert(this._noSyncMessage());
          return false;
        } else {
          console.log("Adding code block heading to note");
          // PATCH (not upstream): see the note on the same fix above.
          await app.insertNoteContent({ uuid: app.context.noteUUID }, `

# ${this._constants.codeHeading}

`, { atEnd: true });
          return true;
        }
      }
    },
    //----------------------------------------------------------------------
    _noSyncMessage() {
      return `Could not sync plugin because the note already contains code but no code block heading. Please add an h1 heading labeled "${this._constants.codeHeading}" above your code block and try again.

Or you can just deletethe code block and run the plugin again to re-create it with a heading.`;
    },
    //----------------------------------------------------------------------
    async _githubRepoUrl(app, { quietFail = false } = {}) {
      const noteContent = await app.getNoteContent({ uuid: app.context.noteUUID });
      const urlRegex = /^\s*(entry|repo)\s*[=:]\s*(https:\/\/github.com\/)?(?<organizationSlug>[\w\-_.]+)\/(?<repoSlug>[\w\-_.]+)\/?(?<entryFile>[\w\-_.\/]+\.(ts|js))?(?:$|\n|\r)/im;
      const match = noteContent.match(urlRegex);
      if (match?.groups?.organizationSlug && match?.groups?.repoSlug) {
        return `https://github.com/${match.groups.organizationSlug}/${match.groups.repoSlug}${match.groups.entryFile ? `/${match.groups.entryFile}` : ""}`;
      } else {
        if (!quietFail) {
          await app.alert("Could not find a repo URL in the note. Please include a line that begins with 'repo:' and has the URL of repo to sync");
        }
        return null;
      }
    },
    //----------------------------------------------------------------------
    /** Details about the entry point for this repo
     * @param {string} app
     * @param {string} repoOrFileUrl - URL to a Github repo or a file in a Github repo
     * @returns {object} - { content: string, url: string }
     */
    async _entryPointFromUrl(app, repoOrFileUrl) {
      if (!repoOrFileUrl) {
        throw new Error("Missing repoUrl");
      }
      let content, url;
      if (/\.(js|ts)$/.test(repoOrFileUrl)) {
        let path = repoOrFileUrl.replace("https://github.com/", "");
        const components = path.split("/");
        if (components.length >= 3) {
          url = `https://github.com/${components[0]}/${components[1]}/${this._constants.defaultBranch}/${components.slice(2).join("/")}`;
          content = await fileContentFromUrl(url);
          if (!content) {
            await app.alert(`Could not find a valid Github file at the entry point URL "${url}" (derived from "${repoOrFileUrl}")`);
            url = null;
          }
        } else {
          await app.alert(`Could not parse a valid Github file at "${repoOrFileUrl}"`);
        }
      } else {
        for (const entryLocation of this._constants.entryLocations) {
          url = `${repoOrFileUrl}/${this._constants.defaultBranch}/${entryLocation}`;
          content = await fileContentFromUrl(url);
          if (content) {
            break;
          } else {
            url = null;
          }
        }
        if (!url) {
          await app.alert(`Could not find any entry point file in the given repo "${repoOrFileUrl}". Please add a "plugin.js" file to the repo, or specify the location of your entry file with the "entry:" directive. 

See plugin instructions for more detail.`);
        }
      }
      return { content, url };
    }
  };

  // PATCH (not upstream): real Amplenote's noteOption dispatcher expects
  // noteOption[label] to be directly callable as async function(app, noteUUID).
  // This build's noteOption entries are { check, run } objects instead - a shape the
  // production AI plugin (alloy-org/ai-plugin, the bounty T&C's own reference
  // implementation) never uses for noteOption. Verified empirically: with this
  // note active as a plugin and a "repo:" line present, no "Plugin Builder: Refresh"
  // entry appeared in the note options menu at all - not disabled, absent.
  // Fix: rebind each entry's .run to a plain function bound to `plugin`, since the
  // internal code depends on `this` referring to the plugin object (this._constants,
  // this._githubRepoUrl, etc.), not the { check, run } wrapper. .check is dropped;
  // its only purpose was menu visibility, and run() already alerts the user if no
  // "repo:"/"entry:" line is found, so nothing upstream breaks by making it unconditional.
  for (const label of Object.keys(plugin.noteOption)) {
    const entry = plugin.noteOption[label];
    if (entry && typeof entry.run === "function") {
      plugin.noteOption[label] = entry.run.bind(plugin);
    }
  }

  var plugin_default = plugin;
  return plugin;
})()

# Working in this repo

## Never add Claude as a co-author

Do not put a `Co-Authored-By: Claude ... <noreply@anthropic.com>` trailer — or any
variant naming Claude or Anthropic — on a commit in this repo. Omit it even though the
default commit workflow describes adding one; this overrides that default.

GitHub reads that trailer as co-authorship and lists the co-author on the repo's
contributor list. This project credits one person, and the trailer had to be rewritten
out of 126 commits once already.

The `commit-msg` hook in `.githooks/` strips the line if it appears anyway. It is a
backstop, not permission to rely on it — write the message without the trailer. After a
fresh clone the hook needs enabling once:

```sh
git config core.hooksPath .githooks
```

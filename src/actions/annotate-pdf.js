/**
 * The "Annotate PDF" note option.
 *
 * Deliberately a standalone function taking `app` as a parameter rather than a method
 * on the plugin object (spec §8): this is what makes it testable against a mock app
 * outside the Amplenote sandbox, which the bounty T&C requires for every action that
 * modifies note data.
 *
 * Phase 0 scope: prove the menu option fires. Attachment listing and opening the
 * annotator embed arrive in Phase 1.
 */
export async function annotatePdf(app, noteUUID) {
  await app.alert(
    "PDF Annotator is installed and wired up.\n\n" +
      "Phase 0: this confirms the note option fires. " +
      "PDF selection and the annotator embed land in Phase 1."
  );
  return noteUUID;
}

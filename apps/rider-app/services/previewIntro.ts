/**
 * One-shot flag set by LoginScreen's "Preview App" button (skip
 * registration/login, jump straight into the app to look around) and read
 * once by MainTabNavigator to decide whether to show the mandatory
 * FlashCardIntro overlay on top of Home. Deliberately not persisted --
 * this is a same-session "just to see" entry point, not a real feature.
 */
let pendingIntro = false;

export function markPreviewIntro(): void {
  pendingIntro = true;
}

export function consumePreviewIntro(): boolean {
  const value = pendingIntro;
  pendingIntro = false;
  return value;
}

/** Slide changes replace history without the page wipe or global focus reset. */
export function sameDeck(a: string, b: string) {
  const match = /^\/(en|fr|ar)\/common-grounds(?:\/[^/]+)?$/;
  return match.test(a) && match.test(b) && a.split('/')[1] === b.split('/')[1];
}

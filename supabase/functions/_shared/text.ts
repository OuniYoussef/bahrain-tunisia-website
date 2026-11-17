export function normalize(value: string) {
  return (
    value
      .normalize('NFC')
      // eslint-disable-next-line no-control-regex -- Intentionally remove controls from untrusted text.
      .replace(/[\u0000-\u0009\u000b-\u001f\u007f-\u009f]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}
export const countUrls = (value: string) => (value.match(/(?:https?:\/\/|www\.)\S+/gi) ?? []).length;
export function isBot(website: unknown, startedAt: unknown, now = Date.now()) {
  const start = Number(startedAt);
  return (
    typeof website !== 'string' ||
    website.length !== 0 ||
    !Number.isFinite(start) ||
    start <= 0 ||
    now - start < 4000
  );
}

import { ApiError } from './respond.ts';
export function webp(bytes: Uint8Array, maxBytes: number, maxEdge: number) {
  const invalid = () => {
    throw new ApiError('invalid_input');
  };
  if (bytes.length > maxBytes) throw new ApiError('payload_too_large');
  if (bytes.length < 20) return invalid();
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tag = (i: number) => String.fromCharCode(...bytes.subarray(i, i + 4));
  if (tag(0) !== 'RIFF' || tag(8) !== 'WEBP' || view.getUint32(4, true) + 8 !== bytes.length)
    return invalid();
  let width = 0;
  let height = 0;
  let image = false;
  let i = 12;
  for (; i + 8 <= bytes.length;) {
    const type = tag(i),
      length = view.getUint32(i + 4, true),
      p = i + 8;
    if (p + length > bytes.length) return invalid();
    // Canvas uploads must not retain personal metadata or animated frames.
    if (['EXIF', 'XMP ', 'ANIM', 'ANMF'].includes(type)) return invalid();
    if (type === 'VP8X') {
      if (length !== 10 || bytes[p] & 0x0e) return invalid();
      width = 1 + bytes[p + 4] + (bytes[p + 5] << 8) + (bytes[p + 6] << 16);
      height = 1 + bytes[p + 7] + (bytes[p + 8] << 8) + (bytes[p + 9] << 16);
    }
    if (type === 'VP8 ' || type === 'VP8L') {
      let w: number, h: number;
      if (type === 'VP8 ') {
        if (
          length < 10 ||
          bytes[p] & 1 ||
          bytes[p + 3] !== 0x9d ||
          bytes[p + 4] !== 1 ||
          bytes[p + 5] !== 0x2a
        )
          return invalid();
        w = view.getUint16(p + 6, true) & 0x3fff;
        h = view.getUint16(p + 8, true) & 0x3fff;
      } else {
        if (length < 5 || bytes[p] !== 0x2f || bytes[p + 4] >> 5) return invalid();
        const bits = view.getUint32(p + 1, true);
        w = (bits & 0x3fff) + 1;
        h = ((bits >>> 14) & 0x3fff) + 1;
      }
      if (image || (width && (width !== w || height !== h))) return invalid();
      width = w;
      height = h;
      image = true;
    }
    i = p + length + (length % 2);
    if (i > bytes.length) return invalid();
  }
  if (i !== bytes.length || !image || width < 1 || height < 1 || Math.max(width, height) > maxEdge)
    return invalid();
  return { width, height };
}

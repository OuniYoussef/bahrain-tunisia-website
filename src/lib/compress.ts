export function fitSize(width: number, height: number, max: number) {
  if (!Number.isFinite(width + height + max) || width <= 0 || height <= 0 || max <= 0)
    throw new Error('upload');
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}
export type CompressedPhoto = {
  id: string;
  full: Blob;
  thumb: Blob;
  width: number;
  height: number;
  alt: string;
  preview: string;
};
async function encode(bitmap: ImageBitmap, max: number, quality: number) {
  const size = fitSize(bitmap.width, bitmap.height, max);
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(size.width, size.height);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('upload');
    context.drawImage(bitmap, 0, 0, size.width, size.height);
    const blob = await canvas.convertToBlob({ type: 'image/webp', quality });
    if (blob.type !== 'image/webp') throw new Error('upload');
    return { blob, ...size };
  }
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('upload');
  ctx.drawImage(bitmap, 0, 0, size.width, size.height);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('upload'))), 'image/webp', quality),
  );
  if (blob.type !== 'image/webp') throw new Error('upload');
  return { blob, ...size };
}
export async function compress(file: File): Promise<CompressedPhoto> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 15 * 1024 * 1024)
    throw new Error('upload');
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    let full = await encode(bitmap, 1600, 0.82);
    if (full.blob.size > 900 * 1024) full = await encode(bitmap, 1600, 0.72);
    const thumb = await encode(bitmap, 480, 0.75);
    if (full.blob.size > 900 * 1024 || thumb.blob.size > 150 * 1024) throw new Error('upload');
    return {
      id: crypto.randomUUID(),
      full: full.blob,
      thumb: thumb.blob,
      width: full.width,
      height: full.height,
      alt: '',
      preview: URL.createObjectURL(thumb.blob),
    };
  } finally {
    bitmap.close();
  }
}

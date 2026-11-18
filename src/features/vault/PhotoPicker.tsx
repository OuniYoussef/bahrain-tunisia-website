import { useEffect, useRef, useState } from 'react';
import { useContent } from '@/i18n/content';
import { t } from '@/i18n/format';
import { compress, type CompressedPhoto } from '@/lib/compress';
export function PhotoPicker({
  photos,
  onChange,
  onBusy,
}: {
  photos: CompressedPhoto[];
  onChange: (photos: CompressedPhoto[]) => void;
  onBusy: (busy: boolean) => void;
}) {
  const { form } = useContent('vault');
  const labels = form.fields.photos;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const current = useRef(photos);
  useEffect(() => {
    current.current = photos;
  }, [photos]);
  const alive = useRef(true);
  const lock = useRef(false);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      current.current.forEach((p) => URL.revokeObjectURL(p.preview));
    };
  }, []);
  async function add(files: File[]) {
    if (lock.current) return;
    setError('');
    if (files.length + current.current.length > 5) {
      setError(form.errors.tooManyPhotos);
      return;
    }
    lock.current = true;
    setBusy(true);
    onBusy(true);
    const added: CompressedPhoto[] = [];
    try {
      for (const file of files) added.push(await compress(file));
      if (alive.current) onChange([...current.current, ...added]);
      else added.forEach((p) => URL.revokeObjectURL(p.preview));
    } catch {
      added.forEach((p) => URL.revokeObjectURL(p.preview));
      if (alive.current) setError(form.errors.upload);
    } finally {
      lock.current = false;
      if (alive.current) {
        setBusy(false);
        onBusy(false);
      }
    }
  }
  function move(index: number, delta: number) {
    const next = [...photos];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    onChange(next);
  }
  return (
    <fieldset disabled={busy} className="photo-picker">
      <legend>{labels.label}</legend>
      <p>{labels.hint}</p>
      <div className="photo-drop">
        <label>
          {labels.add} {labels.drop}
          <input
            type="file"
            name="photos"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              void add(Array.from(e.target.files ?? []));
              e.target.value = '';
            }}
          />
        </label>
      </div>
      <ol>
        {photos.map((photo, i) => (
          <li key={photo.id}>
            <img src={photo.preview} alt="" width={photo.width} height={photo.height} />
            <label>
              {t(labels.altLabel, { n: i + 1 })}
              <input
                name={`photo-alt-${i}`}
                autoComplete="off"
                maxLength={200}
                value={photo.alt}
                onChange={(e) =>
                  onChange(photos.map((p) => (p.id === photo.id ? { ...p, alt: e.target.value } : p)))
                }
              />
            </label>
            <div className="vault-carousel">
              <button
                type="button"
                disabled={i === 0}
                onClick={() => move(i, -1)}
                aria-label={labels.movePrevious}
              >
                ↑
              </button>
              <button
                type="button"
                disabled={i === photos.length - 1}
                onClick={() => move(i, 1)}
                aria-label={labels.moveNext}
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(photo.preview);
                  onChange(photos.filter((p) => p.id !== photo.id));
                }}
              >
                {t(labels.remove, { n: i + 1 })}
              </button>
            </div>
          </li>
        ))}
      </ol>
      <output>{busy ? labels.processing : error}</output>
    </fieldset>
  );
}

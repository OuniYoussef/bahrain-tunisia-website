import { ShareFields } from './ShareFields';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sheet } from '@/components/ui/Dialog';
import { useContent, useLocale } from '@/i18n/content';
import { t } from '@/i18n/format';
import { vaultAvailable } from './api';
import { errorKey, type Category } from './api/types';
import { storySchema, type StoryFields } from './schemas';
import { Captcha } from './Captcha';
import { PhotoPicker } from './PhotoPicker';
import type { CompressedPhoto } from '@/lib/compress';
import { useSubmitStory } from './hooks';
const empty: StoryFields = {
  name: '',
  country: 'both',
  category: 'story',
  title: '',
  body: '',
  placeYear: '',
  consent: false,
  website: '',
  photoCount: 0,
};
function draft(category?: Category): StoryFields {
  try {
    const saved = JSON.parse(sessionStorage.getItem('bt.vault.draft.v1') ?? '{}') as Partial<StoryFields>;
    return {
      ...empty,
      ...saved,
      category: category ?? saved.category ?? 'story',
      photoCount: 0,
      consent: false,
      website: '',
    };
  } catch {
    return { ...empty, category: category ?? 'story' };
  }
}
export function ShareStoryForm({ category, onClose }: { category?: Category; onClose: () => void }) {
  const { form, guidelines, privacy, unavailable } = useContent('vault');
  const locale = useLocale();
  const [photos, setPhotos] = useState<CompressedPhoto[]>([]);
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [startedAt, setStartedAt] = useState(Date.now);
  const mutation = useSubmitStory();
  const [initial] = useState(() => draft(category));
  const {
    register,
    handleSubmit,
    control,
    subscribe,
    setValue,
    reset,
    formState: { errors },
  } = useForm<StoryFields>({ resolver: zodResolver(storySchema), defaultValues: initial });
  const values = { ...empty, ...useWatch({ control }) };
  useEffect(() => {
    const unsubscribe = subscribe({
      formState: { values: true },
      callback: ({ values: value }) => {
        try {
          const { name, country, category, title, body, placeYear } = value;
          sessionStorage.setItem(
            'bt.vault.draft.v1',
            JSON.stringify({ name, country, category, title, body, placeYear }),
          );
        } catch {
          /* Optional draft storage. */
        }
      },
    });
    return unsubscribe;
  }, [subscribe]);
  const changePhotos = (next: CompressedPhoto[]) => {
    setPhotos(next);
    setValue('photoCount', next.length, { shouldValidate: true });
  };
  async function submit(fields: StoryFields) {
    if (!token) return;
    const data = new FormData();
    for (const [key, value] of Object.entries(fields)) if (key !== 'photoCount') data.set(key, String(value));
    data.set('locale', locale);
    data.set('startedAt', String(startedAt));
    data.set('turnstileToken', token);
    photos.forEach((photo, i) => {
      data.set('photo_' + i + '_full', photo.full, i + '-full.webp');
      data.set('photo_' + i + '_thumb', photo.thumb, i + '-thumb.webp');
      data.set('photo_' + i + '_alt', photo.alt);
    });
    try {
      await mutation.mutateAsync(data);
      try {
        sessionStorage.removeItem('bt.vault.draft.v1');
      } catch {
        /* Optional storage. */
      }
    } catch {
      setToken('');
      setAttempt((v) => v + 1);
    }
  }
  function fieldError(name: keyof StoryFields) {
    const error = errors[name];
    if (!error) return '';
    if (name === 'consent') return form.errors.consent;
    if (name === 'photoCount')
      return values.category === 'photo' && !photos.length
        ? form.errors.photoRequired
        : form.errors.tooManyPhotos;
    const min = name === 'title' ? 3 : name === 'body' ? 20 : 1;
    const max = name === 'name' ? 60 : name === 'body' ? 1500 : 80;
    return error.type === 'too_small'
      ? t(form.errors.tooShort, { min })
      : error.type === 'too_big'
        ? t(form.errors.tooLong, { max })
        : form.errors.required;
  }
  return (
    <Sheet open onOpenChange={onClose} title={form.title} description={form.intro} className="vault-sheet">
      {!vaultAvailable ? (
        <div>
          <h3>{unavailable.title}</h3>
          <p>{unavailable.text}</p>
        </div>
      ) : mutation.isSuccess ? (
        <div className="vault-success" aria-live="polite">
          <h3 className="text-h2">{form.success.title}</h3>
          <p>{form.success.text}</p>
          <button
            onClick={() => {
              mutation.reset();
              reset(empty);
              photos.forEach((p) => URL.revokeObjectURL(p.preview));
              setPhotos([]);
              setToken('');
              setAttempt((v) => v + 1);
              setStartedAt(Date.now());
            }}
          >
            {form.success.another}
          </button>
          <button onClick={onClose}>{form.success.back}</button>
        </div>
      ) : (
        <div className="vault-share-layout">
          <form className="vault-form" noValidate onSubmit={handleSubmit(submit)}>
            <fieldset disabled={mutation.isPending}>
              <legend className="sr-only">{form.title}</legend>
              <ShareFields register={register} errors={errors} values={values} fieldError={fieldError} />{' '}
              <PhotoPicker photos={photos} onChange={changePhotos} onBusy={setBusy} />
              <output>{fieldError('photoCount')}</output>
              <label className="vault-radio">
                <input
                  type="checkbox"
                  {...register('consent')}
                  aria-invalid={Boolean(errors.consent)}
                  aria-describedby="consent-error"
                />
                {form.fields.consent.label}
              </label>
              <p id="consent-error">{fieldError('consent')}</p>
              <div className="sr-only" aria-hidden="true">
                <label>
                  {form.fields.honeypot.label}
                  <input {...register('website')} tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              <Captcha key={attempt} onToken={setToken} label={form.captchaLabel} />
              <output aria-live="polite">
                {Object.keys(errors).length
                  ? Object.keys(errors)
                      .map((k) => fieldError(k as keyof StoryFields))
                      .filter(Boolean)
                      .join(' ')
                  : mutation.isError
                    ? form.errors[errorKey(mutation.error)]
                    : !token
                      ? form.errors.captcha
                      : ''}
              </output>
              <button type="submit" disabled={mutation.isPending || busy}>
                {mutation.isPending ? form.submitting : form.submit}
              </button>
            </fieldset>
          </form>
          <aside>
            <h3 className="text-h3">{guidelines.title}</h3>
            <ul>
              {guidelines.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>{privacy.note}</p>
            <a href="https://www.ieee.org/security-privacy.html">{privacy.policyLink}</a>
          </aside>
        </div>
      )}
    </Sheet>
  );
}

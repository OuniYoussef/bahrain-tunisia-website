import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { useContent } from '@/i18n/content';
import { t } from '@/i18n/format';
import type { StoryFields } from './schemas';
export function ShareFields({
  register,
  errors,
  values,
  fieldError,
}: {
  register: UseFormRegister<StoryFields>;
  errors: FieldErrors<StoryFields>;
  values: StoryFields;
  fieldError: (name: keyof StoryFields) => string;
}) {
  const { form } = useContent('vault');
  return (
    <>
      {' '}
      {(['name', 'title', 'body', 'placeYear'] as const).map((name) => (
        <div key={name}>
          <label htmlFor={'share-' + name}>{form.fields[name].label}</label>
          {name === 'body' ? (
            <textarea
              id={'share-' + name}
              {...register(name)}
              maxLength={1500}
              rows={7}
              aria-invalid={Boolean(errors[name])}
              aria-describedby={'share-' + name + '-help'}
              dir="auto"
            />
          ) : (
            <input
              id={'share-' + name}
              {...register(name)}
              maxLength={name === 'name' ? 60 : 80}
              aria-invalid={Boolean(errors[name])}
              aria-describedby={'share-' + name + '-help'}
              dir="auto"
            />
          )}
          <p id={'share-' + name + '-help'}>
            {fieldError(name) || form.fields[name].hint}{' '}
            {['title', 'body'].includes(name) &&
              t(form.counter, { count: values[name].length, max: name === 'body' ? 1500 : 80 })}
          </p>
        </div>
      ))}
      {(['country', 'category'] as const).map((name) => (
        <fieldset key={name} className="radio-cards">
          <legend>{form.fields[name].label}</legend>
          {Object.entries(form.fields[name].options).map(([value, label]) => (
            <label key={value}>
              <input type="radio" {...register(name)} value={value} />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>
      ))}
    </>
  );
}

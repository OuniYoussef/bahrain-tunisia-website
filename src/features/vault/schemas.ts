import { z } from 'zod';
const normalize = (value: string) =>
  value
    .normalize('NFC')
    // eslint-disable-next-line no-control-regex -- Match the backend's removal of untrusted control characters.
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f-\u009f]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
const text = (min: number, max: number) => z.string().transform(normalize).pipe(z.string().min(min).max(max));
export const storySchema = z
  .object({
    name: text(1, 60),
    country: z.enum(['tunisia', 'bahrain', 'both', 'other']),
    category: z.enum(['story', 'photo', 'diary', 'anecdote']),
    title: text(3, 80),
    body: text(20, 1500).refine((v) => (v.match(/(?:https?:\/\/|www\.)\S+/gi) ?? []).length <= 2),
    placeYear: text(0, 80),
    consent: z.boolean().refine(Boolean),
    website: z.literal(''),
    photoCount: z.number().int().min(0).max(5),
  })
  .refine((v) => v.category !== 'photo' || v.photoCount > 0, {
    path: ['photoCount'],
    message: 'photoRequired',
  });
export type StoryFields = z.infer<typeof storySchema>;
export const reportSchema = z.object({
  storyId: z.uuid(),
  reason: z.enum(['not-owner', 'offensive', 'private', 'spam', 'other']),
  details: text(0, 500).optional(),
  turnstileToken: z.string().min(1).max(2048),
});
export const subscribeSchema = z.object({
  email: z.email().max(254),
  locale: z.enum(['en', 'fr', 'ar']),
  consent: z.literal(true),
  turnstileToken: z.string().min(1).max(2048),
});

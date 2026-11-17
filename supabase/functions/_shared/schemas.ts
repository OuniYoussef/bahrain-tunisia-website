import { z } from 'zod';
import { normalize, countUrls } from './text.ts';
import { ApiError } from './respond.ts';
const text = (min: number, max: number) => z.string().transform(normalize).pipe(z.string().min(min).max(max));
const locale = z.enum(['en', 'fr', 'ar']);
const token = z.string().min(1).max(2048);
export const storySchema = z.object({
  name: text(1, 60),
  country: z.enum(['tunisia', 'bahrain', 'both', 'other']),
  category: z.enum(['story', 'photo', 'diary', 'anecdote']),
  title: text(3, 80),
  body: text(20, 1500).refine((v) => countUrls(v) <= 2),
  placeYear: text(0, 80).optional(),
  locale,
  consent: z.literal('true'),
  startedAt: z.string(),
  website: z.literal(''),
  turnstileToken: token,
});
export const reactSchema = z.object({ storyId: z.uuid(), deviceId: z.uuid() }).strict();
export const reportSchema = z
  .object({
    storyId: z.uuid(),
    reason: z.enum(['not-owner', 'offensive', 'private', 'spam', 'other']),
    details: text(0, 500).optional(),
    turnstileToken: token,
  })
  .strict();
export const subscribeSchema = z
  .object({
    email: text(1, 254)
      .pipe(z.email())
      .transform((s) => s.toLowerCase()),
    locale,
    consent: z.literal(true),
    turnstileToken: token,
  })
  .strict();
export const moderateSchema = z
  .object({
    action: z.enum(['approve', 'reject', 'hide', 'restore', 'delete', 'resolve-report']),
    storyId: z.uuid().optional(),
    reportId: z.uuid().optional(),
    note: text(0, 500)
      .refine((v) => !v.startsWith('[vault-operation:'))
      .optional(),
  })
  .strict()
  .refine((v) => (v.action === 'resolve-report' ? Boolean(v.reportId) : Boolean(v.storyId)));
export const altSchema = text(0, 200);
export function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new ApiError('invalid_input');
  return result.data;
}

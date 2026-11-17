import { z } from 'zod';
import type { Row } from '../data';
export const schema = z.object({
  message_en: z.string().trim().min(1).max(280),
  message_fr: z.string().trim().min(1).max(280),
  message_ar: z.string().trim().min(1).max(280),
  level: z.enum(['info', 'warning', 'critical']),
  link_url: z.union([z.literal(''), z.url().startsWith('https://')]),
  expires_at: z.string().refine((v) => !v || Number.isFinite(Date.parse(v))),
  active: z.boolean(),
});
export const empty = {
  message_en: '',
  message_fr: '',
  message_ar: '',
  level: 'info' as Row<'site_alerts'>['level'],
  link_url: '',
  expires_at: '',
  active: true,
};

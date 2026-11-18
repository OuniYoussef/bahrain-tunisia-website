import * as z from 'zod/mini';
const optional = <T extends z.ZodMiniType>(schema: T) =>
  z.pipe(
    z.transform((value: unknown) => (typeof value === 'string' ? value.trim() || undefined : value)),
    z.catch(z.optional(schema), undefined),
  );
const url = optional(z.url({ protocol: /^https?$/ }));
export const envSchema = z.object({
  VITE_SITE_URL: url,
  VITE_BASE_PATH: optional(z.string().check(z.regex(/^\/(?:[\w.-]+\/)*[\w.-]*\/?$/))),
  VITE_CONTACT_EMAIL: optional(z.email()),
  VITE_SOCIAL_INSTAGRAM: url,
  VITE_SOCIAL_FACEBOOK: url,
  VITE_SOCIAL_LINKEDIN: url,
  VITE_SOCIAL_YOUTUBE: url,
  VITE_IEEE_COOKIE_SCRIPT_URL: url,
});
export function parseEnv(input: Record<string, unknown>) {
  const values = envSchema.parse(input);
  return {
    ...values,
    basePath: `/${(values.VITE_BASE_PATH ?? '/').replace(/^\/+|\/+$/g, '')}`.replace(/\/?$/, '/'),
  };
}

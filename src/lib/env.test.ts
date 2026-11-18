import { describe, expect, it } from 'vitest';
import { parseEnv } from './env-schema';
describe('optional environment configuration', () => {
  it('accepts an empty environment and disables unavailable features', () => {
    expect(parseEnv({})).toMatchObject({ basePath: '/' });
    expect(
      parseEnv({
        VITE_CONTACT_EMAIL: 'bad',
        VITE_SOCIAL_INSTAGRAM: 'javascript:alert(1)',
        VITE_SITE_URL: ' ',
        VITE_BASE_PATH: '//outside.example/',
      }),
    ).toMatchObject({
      VITE_CONTACT_EMAIL: undefined,
      VITE_SOCIAL_INSTAGRAM: undefined,
      VITE_SITE_URL: undefined,
      basePath: '/',
    });
  });
});

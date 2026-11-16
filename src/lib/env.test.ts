import { describe, expect, it } from 'vitest';
import { parseEnv } from './env';
describe('optional environment configuration', () => {
  it('accepts an empty environment and disables unavailable features', () => {
    expect(parseEnv({})).toMatchObject({ basePath: '/', vaultMode: 'mock' });
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
  it.each(['auto', 'supabase', 'mock'])('resolves %s without credentials safely', (mode) => {
    expect(parseEnv({ VITE_VAULT_MODE: mode }).vaultMode).toBe('mock');
  });
  it('resolves auto and explicit modes with a complete backend configuration', () => {
    const input = {
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example',
      VITE_BASE_PATH: '/exchange',
    };
    expect(parseEnv(input)).toMatchObject({ vaultMode: 'supabase', basePath: '/exchange/' });
    expect(parseEnv({ ...input, VITE_VAULT_MODE: 'supabase' }).vaultMode).toBe('supabase');
    expect(parseEnv({ ...input, VITE_VAULT_MODE: 'mock' }).vaultMode).toBe('mock');
    expect(parseEnv({ VITE_VAULT_MODE: 'auto', VITE_SUPABASE_URL: input.VITE_SUPABASE_URL }).vaultMode).toBe(
      'mock',
    );
  });
});

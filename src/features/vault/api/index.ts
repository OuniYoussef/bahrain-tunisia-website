import { env } from '@/lib/env';
import type { VaultApi } from './types';
export const vaultAvailable =
  env.vaultMode === 'mock' || Boolean(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_PUBLISHABLE_KEY);
let api: Promise<VaultApi> | undefined;
const get = () =>
  (api ??=
    env.vaultMode === 'mock'
      ? import('./mockApi').then((m) => m.mockApi)
      : import('./supabaseApi').then((m) => m.supabaseApi));
export const vaultApi: VaultApi = {
  listStories: async (v) => (await get()).listStories(v),
  getStory: async (v) => (await get()).getStory(v),
  submitStory: async (v) => (await get()).submitStory(v),
  react: async (id, device) => (await get()).react(id, device),
  report: async (v) => (await get()).report(v),
  subscribe: async (v) => (await get()).subscribe(v),
  getAlerts: async () => (env.vaultMode === 'mock' ? [] : (await get()).getAlerts()),
};
let cached: { expires: number; promise: ReturnType<VaultApi['getAlerts']> } | undefined;
export function loadAlerts() {
  if (!cached || cached.expires <= Date.now())
    cached = {
      expires: Date.now() + 300000,
      promise: vaultApi.getAlerts().catch((e) => {
        cached = undefined;
        throw e;
      }),
    };
  return cached.promise;
}

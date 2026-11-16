import { mockAlertsApi } from './mockApi';
export const vaultApi = mockAlertsApi;
let cached: { expires: number; promise: ReturnType<typeof vaultApi.getAlerts> } | undefined;
/** Replaced by the shared TanStack Query hooks when the P9 API is connected. */
export function loadAlerts() {
  if (!cached || cached.expires <= Date.now()) {
    cached = { expires: Date.now() + 300_000, promise: vaultApi.getAlerts() };
  }
  return cached.promise;
}

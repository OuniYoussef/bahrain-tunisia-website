import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { VaultError, type VaultApi, type Story } from './types';
function client() {
  if (!supabase) throw new VaultError('unavailable');
  return supabase;
}
async function invoke<T>(name: string, body: FormData | object): Promise<T> {
  const { data, error } = await client().functions.invoke<T>(name, { body });
  if (error) {
    if (error instanceof FunctionsHttpError) {
      const payload: unknown = await error.context.json().catch(() => null);
      if (payload && typeof payload === 'object' && 'error' in payload)
        throw new VaultError(String(payload.error));
    }
    throw new VaultError(navigator.onLine ? 'server_error' : 'offline');
  }
  if (!data) throw new VaultError('server_error');
  return data;
}
export const supabaseApi: VaultApi = {
  async listStories({ country, category, cursor, limit = 12 }) {
    const { data, error } = await client().rpc('get_stories', {
      p_country: country,
      p_category: category,
      p_before_approved_at: cursor?.approved_at,
      p_before_id: cursor?.id,
      p_limit: limit,
    });
    if (error) throw new VaultError('server_error');
    const items = (data ?? []).map((s) => ({
      ...s,
      photos: s.cover_path
        ? [
            {
              path_full: s.cover_path,
              path_thumb: s.cover_path,
              width: s.cover_width,
              height: s.cover_height,
              alt: s.cover_alt,
            },
          ]
        : [],
    }));
    return { items, cursor: items.length === limit ? items.at(-1) : undefined };
  },
  async getStory(id) {
    const { data, error } = await client().rpc('get_story', { p_id: id });
    if (error) throw new VaultError('server_error');
    return data as Story | null;
  },
  submitStory: (data) => invoke('submit-story', data),
  react: (storyId, deviceId) => invoke('react', { storyId, deviceId }),
  report: (input) => invoke('report-post', input),
  subscribe: (input) => invoke('subscribe', input),
  async getAlerts() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('site_alerts')
      .select('id,level,message_en,message_fr,message_ar,link_url,starts_at')
      .order('starts_at', { ascending: false })
      .limit(3);
    if (error) throw error;
    return (data ?? []).map((a) => ({
      id: a.id,
      level: a.level,
      message: { en: a.message_en, fr: a.message_fr, ar: a.message_ar },
      createdAt: a.starts_at,
      ...(a.link_url
        ? { link: { href: a.link_url, label: { en: a.message_en, fr: a.message_fr, ar: a.message_ar } } }
        : {}),
    }));
  },
};

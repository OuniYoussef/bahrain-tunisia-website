import data from '@/content/alerts.json';
export type SiteAlert = {
  id: string;
  level: 'info' | 'warning' | 'critical';
  message_en: string;
  message_fr: string;
  message_ar: string;
  link_url?: string;
  starts_at?: string;
  expires_at?: string;
};
export function activeAlerts(now = Date.now()): SiteAlert[] {
  return (data as SiteAlert[]).filter(
    (alert) =>
      (!alert.starts_at || Date.parse(alert.starts_at) <= now) &&
      (!alert.expires_at || Date.parse(alert.expires_at) > now),
  );
}

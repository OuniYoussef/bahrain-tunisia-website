import type { Locale } from '@/i18n/config';
export type SiteAlert = {
  id: string;
  level: 'info' | 'warning' | 'critical';
  message: Record<Locale, string>;
  createdAt: string;
  link?: { href: string; label: Record<Locale, string> };
};
export interface AlertsApi {
  getAlerts(): Promise<SiteAlert[]>;
}

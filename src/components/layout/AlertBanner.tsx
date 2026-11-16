import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useContent, useLocale } from '@/i18n/content';
import { t } from '@/i18n/format';
import { loadAlerts } from '@/features/vault/api';
import type { SiteAlert } from '@/features/vault/api/types';
function wasDismissed(id: string) {
  try {
    return sessionStorage.getItem(`bt.alert.${id}`) === 'dismissed';
  } catch {
    return false;
  }
}
export function AlertBanner() {
  const { alerts } = useContent('common');
  const locale = useLocale();
  const [data, setData] = useState<SiteAlert[]>([]);
  useEffect(() => {
    let active = true;
    void loadAlerts()
      .then((alerts) => {
        if (active) setData(alerts);
      })
      .catch(() => {
        /* The shell remains usable if announcements are unavailable. */
      });
    return () => {
      active = false;
    };
  }, []);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const visible = data
    .filter((alert) => !dismissed.includes(alert.id) && !wasDismissed(alert.id))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (!visible.length) return null;
  return (
    <section aria-label={alerts.regionLabel} className="alerts">
      {(expanded ? visible : visible.slice(0, 1)).map((alert) => (
        <div
          key={alert.id}
          className={`alert alert-${alert.level}`}
          role={alert.level === 'critical' ? 'alert' : undefined}
        >
          <p>
            {alert.message[locale]}{' '}
            {alert.link && /^(https?:\/\/|\/(?!\/))/.test(alert.link.href) && (
              <a href={alert.link.href}>{alert.link.label[locale]}</a>
            )}
          </p>
          <button
            type="button"
            aria-label={alerts.dismiss}
            onClick={() => {
              setDismissed((ids) => [...ids, alert.id]);
              try {
                sessionStorage.setItem(`bt.alert.${alert.id}`, 'dismissed');
              } catch {
                /* Optional storage. */
              }
            }}
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>
      ))}
      {visible.length > 1 && (
        <button type="button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          {expanded ? alerts.less : t(alerts.more, { count: visible.length - 1 })}
        </button>
      )}
    </section>
  );
}

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useContent, useLocale } from '@/i18n/content';
import { t } from '@/i18n/format';
import { activeAlerts } from '@/lib/alerts';
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
  const [data, setData] = useState(activeAlerts);
  useEffect(() => {
    const refresh = () => setData(activeAlerts());
    refresh();
    const interval = window.setInterval(refresh, 300_000);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
    };
  }, []);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const visible = data
    .filter((alert) => !dismissed.includes(alert.id) && !wasDismissed(alert.id))
    .sort((a, b) => (b.starts_at ?? '').localeCompare(a.starts_at ?? ''));
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
            {alert.link_url && /^(https?:\/\/|\/(?!\/))/.test(alert.link_url) ? (
              <a href={alert.link_url}>{alert[`message_${locale}`]}</a>
            ) : (
              alert[`message_${locale}`]
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

import { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { useContent } from '@/i18n/content';
import { Captcha } from './Captcha';
import { useReport } from './hooks';
import type { ReportInput } from './api/types';
export function ReportDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const { report, form } = useContent('vault');
  const [token, setToken] = useState('');
  const [attempt, setAttempt] = useState(0);
  const mutation = useReport();
  return (
    <Dialog open onOpenChange={onClose} title={report.title} description={report.intro}>
      {mutation.isSuccess ? (
        <output>{report.thanks}</output>
      ) : (
        <form
          className="vault-form"
          onSubmit={async (e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            try {
              await mutation.mutateAsync({
                storyId: id,
                reason: data.get('reason') as ReportInput['reason'],
                details: String(data.get('details') ?? ''),
                turnstileToken: token,
              });
            } catch {
              setToken('');
              setAttempt((v) => v + 1);
            }
          }}
        >
          <fieldset>
            <legend>{report.reasonLabel}</legend>
            {Object.entries(report.reasons).map(([value, label]) => (
              <label className="vault-radio" key={value}>
                <input type="radio" required name="reason" value={value} />
                {label}
              </label>
            ))}
          </fieldset>
          <label>
            {report.detailsLabel}
            <textarea name="details" maxLength={500} />
          </label>
          <Captcha key={attempt} onToken={setToken} label={form.captchaLabel} />
          <button disabled={mutation.isPending || !token}>{report.submit}</button>
          <output>{mutation.isError ? report.error : ''}</output>
        </form>
      )}
    </Dialog>
  );
}

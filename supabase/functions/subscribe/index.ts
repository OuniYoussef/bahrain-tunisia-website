import { handler, limit, readJson } from '../_shared/handler.ts';
import { parse, subscribeSchema } from '../_shared/schemas.ts';
import { z } from 'zod';
import { clientIp, hash } from '../_shared/ip.ts';
import { captcha } from '../_shared/turnstile.ts';
import { checked, json } from '../_shared/respond.ts';
import { unsubscribeConfirmation } from '../_shared/confirmation.ts';
export default {
  fetch: handler(
    'none',
    async (req, { supabaseAdmin: db }) => {
      if (req.method === 'GET') {
        const token = parse(z.uuid(), new URL(req.url).searchParams.get('unsubscribe'));
        checked(
          await db
            .from('newsletter_subscribers')
            .update({ status: 'unsubscribed', ip_hash: null })
            .eq('unsubscribe_token', token),
        );
        // Fixed multilingual confirmation; no reflected token/email and no existence disclosure.
        return new Response(unsubscribeConfirmation(), {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store',
            'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
            'Referrer-Policy': 'no-referrer',
          },
        });
      }
      const data = parse(subscribeSchema, await readJson(req));
      const ip = clientIp(req),
        ipHash = await hash(ip);
      await captcha(data.turnstileToken, ip, 'subscribe');
      await limit(db, ipHash, 'subscribe', 5, '1 hour');
      const existing = checked(
        await db.from('newsletter_subscribers').select('status').eq('email', data.email).maybeSingle(),
      );
      if (existing?.status === 'active') return json({ status: 'already' });
      checked(
        await db.from('newsletter_subscribers').upsert(
          {
            email: data.email,
            locale: data.locale,
            status: 'active',
            consent_version: 'v1',
            consented_at: new Date().toISOString(),
            ip_hash: ipHash,
            unsubscribe_token: crypto.randomUUID(),
          },
          { onConflict: 'email' },
        ),
      );
      return json({ status: 'subscribed' });
    },
    true,
  ),
};

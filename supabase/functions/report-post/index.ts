import { handler, limit, readJson } from '../_shared/handler.ts';
import { parse, reportSchema } from '../_shared/schemas.ts';
import { clientIp, hash } from '../_shared/ip.ts';
import { captcha } from '../_shared/turnstile.ts';
import { ApiError, checked, json } from '../_shared/respond.ts';
import { moderateStory } from '../_shared/moderation.ts';
export default {
  fetch: handler('none', async (req, { supabaseAdmin: db }) => {
    const data = parse(reportSchema, await readJson(req));
    const ip = clientIp(req),
      ipHash = await hash(ip);
    await captcha(data.turnstileToken, ip, 'report-post');
    await limit(db, ipHash, 'report', 10, '1 hour');
    if (
      !checked(
        await db.from('stories').select('id').eq('id', data.storyId).eq('status', 'approved').maybeSingle(),
      )
    )
      throw new ApiError('not_found');
    checked(
      await db.from('reports').upsert(
        {
          story_id: data.storyId,
          reason: data.reason,
          details: data.details ?? null,
          reporter_hash: ipHash,
        },
        { onConflict: 'story_id,reporter_hash', ignoreDuplicates: true },
      ),
    );
    const result = await db
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('story_id', data.storyId)
      .eq('status', 'open');
    checked(result);
    const threshold = Number(Deno.env.get('AUTO_HIDE_THRESHOLD') ?? 3);
    if (!Number.isInteger(threshold) || threshold < 3) throw new ApiError('server_error');
    if ((result.count ?? 0) >= threshold) await moderateStory(db, 'auto-hide', data.storyId, null);
    return json({ ok: true });
  }),
};

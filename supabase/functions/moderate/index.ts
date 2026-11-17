import { handler, readJson } from '../_shared/handler.ts';
import { parse, moderateSchema } from '../_shared/schemas.ts';
import { ApiError, checked, json } from '../_shared/respond.ts';
import { moderateStory } from '../_shared/moderation.ts';
export default {
  fetch: handler('user', async (req, { supabase, supabaseAdmin: db }) => {
    if (!checked(await supabase.rpc('is_admin'))) throw new ApiError('forbidden');
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) throw new ApiError('forbidden');
    const data = parse(moderateSchema, await readJson(req));
    if (data.action === 'resolve-report') {
      if (!data.reportId) throw new ApiError('invalid_input');
      const report = checked(
        await db.from('reports').select('id,story_id').eq('id', data.reportId).maybeSingle(),
      );
      if (!report) throw new ApiError('not_found');
      checked(
        await db.from('moderation_log').insert({
          action: data.action,
          report_id: report.id,
          story_id: report.story_id,
          admin_id: user.id,
          note: data.note ?? null,
        }),
      );
      return json(
        checked(
          await db
            .from('reports')
            .update({ status: 'resolved', resolved_by: user.id, resolved_at: new Date().toISOString() })
            .eq('id', report.id)
            .select('*')
            .single(),
        ),
      );
    }
    if (!data.storyId) throw new ApiError('invalid_input');
    return json(await moderateStory(db, data.action, data.storyId, user.id, data.note));
  }),
};

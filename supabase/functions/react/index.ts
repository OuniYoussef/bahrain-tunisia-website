import { handler, limit, readJson } from '../_shared/handler.ts';
import { parse, reactSchema } from '../_shared/schemas.ts';
import { clientIp, hash } from '../_shared/ip.ts';
import { ApiError, checked, json } from '../_shared/respond.ts';
export default {
  fetch: handler('none', async (req, { supabaseAdmin: db }) => {
    const data = parse(reactSchema, await readJson(req));
    const ipHash = await hash(clientIp(req));
    await limit(db, ipHash, 'react', 60, '1 hour');
    const story = checked(
      await db.from('stories').select('id').eq('id', data.storyId).eq('status', 'approved').maybeSingle(),
    );
    if (!story) throw new ApiError('not_found');
    checked(
      await db
        .from('story_reactions')
        .upsert(
          { story_id: data.storyId, voter_hash: await hash(data.deviceId + ipHash) },
          { onConflict: 'story_id,voter_hash', ignoreDuplicates: true },
        ),
    );
    const current = checked(
      await db
        .from('stories')
        .select('heart_count')
        .eq('id', data.storyId)
        .eq('status', 'approved')
        .maybeSingle(),
    );
    if (!current) throw new ApiError('not_found');
    return json({ hearts: current.heart_count, reacted: true });
  }),
};

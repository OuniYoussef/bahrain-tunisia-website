import type { Client } from './handler.ts';
import { ApiError, checked } from './respond.ts';
type Action = 'approve' | 'reject' | 'hide' | 'restore' | 'delete' | 'auto-hide';
export async function moderateStory(
  db: Client,
  action: Action,
  id: string,
  adminId: string | null,
  note?: string,
) {
  const story = checked(await db.from('stories').select('*').eq('id', id).maybeSingle());
  if (!story) throw new ApiError('not_found');
  // A durable reservation survives worker crashes. Only an operator may clear a failed reservation
  // after reconciling Storage; never expire it while another worker might still be copying files.
  if (story.moderation_note?.startsWith('[vault-operation:')) throw new ApiError('invalid_input');
  const allowed: Record<Action, string[]> = {
    approve: ['pending'],
    reject: ['pending', 'hidden'],
    hide: ['approved'],
    'auto-hide': ['approved'],
    restore: ['hidden'],
    delete: ['pending', 'approved', 'hidden', 'rejected'],
  };
  if (!allowed[action].includes(story.status)) throw new ApiError('invalid_input');
  const photos = checked(await db.from('story_photos').select('*').eq('story_id', id));
  if (!photos) throw new ApiError('server_error');
  const publish = action === 'approve' || action === 'restore';
  const remove = action === 'reject' || action === 'delete';
  const destination = publish ? 'vault-public' : 'vault-pending';
  const paths = photos.flatMap((p) => [p.path_full as string, p.path_thumb as string]);
  const copied: string[] = [];
  let committed = false;
  // Reserve the record using an optimistic compare-and-swap. Hidden status removes it from the feed
  // during Storage work. A second moderator holding an older version cannot commit this transition.
  const reservation = `[vault-operation:${crypto.randomUUID()}] ${action}`;
  const reserved = checked(
    await db
      .from('stories')
      .update({ status: 'hidden', moderation_note: reservation })
      .eq('id', id)
      .eq('updated_at', story.updated_at)
      .select('updated_at')
      .maybeSingle(),
  );
  if (!reserved) throw new ApiError('invalid_input');
  try {
    // Audit the reserved attempt before touching Storage or changing final visibility.
    checked(
      await db.from('moderation_log').insert({ action, story_id: id, admin_id: adminId, note: note ?? null }),
    );
    if (!remove) {
      for (const photo of photos) {
        if (photo.bucket === destination) continue;
        for (const path of [photo.path_full, photo.path_thumb]) {
          const blob = checked(await db.storage.from(photo.bucket).download(path));
          if (!blob) throw new ApiError('server_error');
          copied.push(path); // Include uncertain upload outcomes in cleanup.
          checked(
            await db.storage.from(destination).upload(path, blob, {
              contentType: 'image/webp',
              cacheControl: publish ? '31536000' : '0',
              upsert: false,
            }),
          );
        }
      }
    }
    for (const bucket of ['vault-public', 'vault-pending']) {
      // For publishing retain the pending originals until all DB writes and public cleanup succeed.
      if (publish || (!remove && bucket === destination)) continue;
      if (paths.length) checked(await db.storage.from(bucket).remove(paths));
    }
    if (remove) checked(await db.from('story_photos').delete().eq('story_id', id));
    else checked(await db.from('story_photos').update({ bucket: destination }).eq('story_id', id));
    if (action === 'delete') {
      checked(await db.from('stories').delete().eq('id', id));
      return { id, deleted: true };
    }
    const updated = checked(
      await db
        .from('stories')
        .update({
          status: publish ? 'approved' : remove ? 'rejected' : 'hidden',
          approved_at: publish ? new Date().toISOString() : story.approved_at,
          moderated_by: adminId,
          moderation_note: reservation,
          ...(remove ? { photo_count: 0 } : {}),
        })
        .eq('id', id)
        .select('*')
        .single(),
    );
    checked(
      await db
        .from('stories')
        .update({ moderation_note: note ?? null })
        .eq('id', id),
    );
    committed = true;
    if (publish && paths.length) checked(await db.storage.from('vault-pending').remove(paths));
    return { ...updated, moderation_note: note ?? null };
  } catch (error) {
    if (committed) throw error; // Only private duplicate cleanup failed; the logged public result is valid.
    // Never restore public visibility after a partial failure. Private copies remain recoverable.
    checked(await db.from('stories').update({ status: 'hidden', moderation_note: reservation }).eq('id', id));
    if (publish && copied.length) checked(await db.storage.from('vault-public').remove(copied));
    throw error;
  }
}

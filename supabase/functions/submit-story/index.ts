import { handler, limit } from '../_shared/handler.ts';
import { parse, storySchema, altSchema } from '../_shared/schemas.ts';
import { isBot } from '../_shared/text.ts';
import { clientIp, hash } from '../_shared/ip.ts';
import { captcha } from '../_shared/turnstile.ts';
import { webp } from '../_shared/webp.ts';
import { ApiError, checked, json } from '../_shared/respond.ts';
export default {
  fetch: handler('none', async (req, { supabaseAdmin: db }) => {
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      throw new ApiError('invalid_input');
    }
    if (isBot(form.get('website'), form.get('startedAt'))) return json({ ok: true });
    const fields = Object.fromEntries([...form].filter(([key]) => !key.startsWith('photo_')));
    const data = parse(storySchema, fields);
    const photos: { full: Uint8Array; thumb: Uint8Array; width: number; height: number; alt: string }[] = [];
    for (const key of form.keys()) {
      if (
        form.getAll(key).length !== 1 ||
        (key.startsWith('photo_') && !/^photo_[0-4]_(full|thumb|alt)$/.test(key))
      )
        throw new ApiError('invalid_input');
    }
    for (let i = 0; i < 5; i++) {
      const full = form.get(`photo_${i}_full`),
        thumb = form.get(`photo_${i}_thumb`),
        alt = form.get(`photo_${i}_alt`);
      if (!full && !thumb && !alt) continue;
      if (
        i !== photos.length ||
        !(full instanceof File) ||
        !(thumb instanceof File) ||
        full.type !== 'image/webp' ||
        thumb.type !== 'image/webp'
      )
        throw new ApiError('invalid_input');
      const fullBytes = new Uint8Array(await full.arrayBuffer()),
        thumbBytes = new Uint8Array(await thumb.arrayBuffer());
      const dimensions = webp(fullBytes, 900 * 1024, 1600);
      webp(thumbBytes, 150 * 1024, 480);
      photos.push({ full: fullBytes, thumb: thumbBytes, ...dimensions, alt: parse(altSchema, alt ?? '') });
    }
    if (data.category === 'photo' && !photos.length) throw new ApiError('invalid_input');
    const ip = clientIp(req),
      ipHash = await hash(ip);
    await captcha(data.turnstileToken, ip, 'submit-story');
    // Separate counters avoid counting each accepted submission twice in the daily window.
    await limit(db, ipHash, 'submit-hour', 3, '1 hour');
    await limit(db, ipHash, 'submit-day', 10, '1 day');
    const id = crypto.randomUUID(),
      paths: string[] = [];
    checked(
      await db.from('stories').insert({
        id,
        author_name: data.name,
        country: data.country,
        category: data.category,
        title: data.title,
        body: data.body,
        place_year: data.placeYear || null,
        locale: data.locale,
        ip_hash: ipHash,
      }),
    );
    try {
      for (const [i, photo] of photos.entries()) {
        for (const variant of ['full', 'thumb'] as const) {
          const path = `${id}/${i}-${variant}.webp`;
          paths.push(path);
          checked(
            await db.storage
              .from('vault-pending')
              .upload(path, photo[variant], { contentType: 'image/webp', upsert: false }),
          );
        }
        checked(
          await db.from('story_photos').insert({
            story_id: id,
            position: i,
            bucket: 'vault-pending',
            path_full: `${id}/${i}-full.webp`,
            path_thumb: `${id}/${i}-thumb.webp`,
            width: photo.width,
            height: photo.height,
            alt: photo.alt || null,
          }),
        );
      }
      checked(await db.from('stories').update({ photo_count: photos.length }).eq('id', id));
    } catch (error) {
      if (paths.length) checked(await db.storage.from('vault-pending').remove(paths));
      checked(await db.from('stories').delete().eq('id', id));
      throw error;
    }
    return json({ ok: true }, 201);
  }),
};

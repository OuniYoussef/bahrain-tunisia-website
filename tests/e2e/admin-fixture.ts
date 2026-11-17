import type { Page } from '@playwright/test';
export async function adminFixture(page: Page, enrolled = true, authorised = true) {
  const id = '11111111-1111-4111-8111-111111111111';
  const factor = {
    id,
    factor_type: 'totp',
    status: 'verified',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const user = () => ({
    id,
    email: 'mod@example.test',
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: {},
    user_metadata: {},
    created_at: new Date().toISOString(),
    factors: enrolled ? [factor] : [],
  });
  function session(aal: string) {
    const encode = (v: object) => Buffer.from(JSON.stringify(v)).toString('base64url');
    return {
      access_token: `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: id, exp: Math.floor(Date.now() / 1000) + 7200, aal, role: 'authenticated' })}.${Buffer.from('test-signature').toString('base64url')}`,
      refresh_token: 'test-refresh',
      token_type: 'bearer',
      expires_in: 7200,
      user: user(),
    };
  }
  const story = {
    id,
    title: 'A shared afternoon',
    author_name: 'A visitor',
    body: 'We shared tea and stories during a memorable afternoon with our hosts.',
    country: 'both',
    category: 'story',
    locale: 'en',
    created_at: new Date().toISOString(),
    status: 'pending',
    is_sample: false,
    moderation_note: null,
    photo_count: 0,
  };
  const actions: Record<string, unknown>[] = [];
  let reads = 0;
  await page.route('https://admin-test.supabase.co/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const json = (value: unknown) => route.fulfill({ json: value });
    if (path.endsWith('/token')) return json(session('aal1'));
    if (path.endsWith('/user')) return json(user());
    if (path.endsWith('/factors'))
      return json({
        id,
        type: 'totp',
        totp: {
          qr_code:
            'data:image/svg+xml,' +
            encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100"/></svg>',
            ),
          secret: 'TESTONLYSECRET',
          uri: 'otpauth://totp/test',
        },
      });
    if (path.endsWith('/challenge')) return json({ id, expires_at: Math.floor(Date.now() / 1000) + 300 });
    if (path.endsWith('/verify')) {
      enrolled = true;
      return json(session('aal2'));
    }
    if (path.endsWith('/logout')) return route.fulfill({ status: 204 });
    if (path.endsWith('/rpc/is_admin')) return json(authorised);
    if (path.endsWith('/stories')) {
      reads++;
      const status = url.searchParams.get('status')?.replace('eq.', '');
      return route.fulfill({
        json: status === story.status ? [story] : [],
        headers: { 'content-range': `0-0/${status === story.status ? 1 : 0}` },
      });
    }
    if (path.endsWith('/moderate')) {
      const action = route.request().postDataJSON() as Record<string, unknown>;
      actions.push(action);
      story.status = action.action === 'approve' ? 'approved' : 'rejected';
      return json(story);
    }
    if (path.endsWith('/moderation_log'))
      return json(
        actions.map((a, i) => ({
          ...a,
          id: i,
          story_id: id,
          created_at: new Date().toISOString(),
          note: a.note ?? null,
        })),
      );
    if (path.endsWith('/site_alerts') && route.request().method() === 'POST') {
      actions.push(route.request().postDataJSON() as Record<string, unknown>);
      return json({ id });
    }
    return json([]);
  });
  return { actions, reads: () => reads };
}

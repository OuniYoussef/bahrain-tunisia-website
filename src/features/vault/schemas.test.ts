import { describe, it, expect } from 'vitest';
import { storySchema, reportSchema, subscribeSchema } from './schemas';
const valid = {
  name: 'A',
  country: 'both',
  category: 'story',
  title: 'A day',
  body: 'A shared memory of a beautiful afternoon.',
  placeYear: '',
  consent: true,
  website: '',
  photoCount: 0,
};
describe('visitor validation', () => {
  it('accepts a text story and photo story', () => {
    expect(storySchema.safeParse(valid).success).toBe(true);
    expect(storySchema.safeParse({ ...valid, category: 'photo', photoCount: 2 }).success).toBe(true);
  });
  it.each([
    { name: '' },
    { name: 'x'.repeat(61) },
    { title: 'ab' },
    { title: 'x'.repeat(81) },
    { body: 'short' },
    { body: 'x'.repeat(1501) },
    { placeYear: 'x'.repeat(81) },
    { consent: false },
    { website: 'bot' },
    { photoCount: 6 },
    { category: 'photo' },
    { country: 'unknown' },
    { body: 'https://a.example https://b.example https://c.example' },
  ])('rejects invalid story %j', (change) =>
    expect(storySchema.safeParse({ ...valid, ...change }).success).toBe(false),
  );
  it('validates reports and subscriptions', () => {
    expect(
      reportSchema.safeParse({
        storyId: crypto.randomUUID(),
        reason: 'spam',
        details: 'x'.repeat(501),
        turnstileToken: 'token',
      }).success,
    ).toBe(false);
    expect(
      subscribeSchema.safeParse({ email: 'invalid', locale: 'en', consent: true, turnstileToken: 'token' })
        .success,
    ).toBe(false);
    expect(
      subscribeSchema.safeParse({
        email: 'a@example.com',
        locale: 'ar',
        consent: true,
        turnstileToken: 'token',
      }).success,
    ).toBe(true);
  });
});

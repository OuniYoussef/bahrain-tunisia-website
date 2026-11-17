import { describe, expect, it, vi } from 'vitest';
import { checkGuard } from './guard';
describe('admin guard fails closed before any privileged reads', () => {
  it.each([
    [false, null, true, 'login', 0, 0],
    [true, 'aal1', true, 'mfa', 1, 0],
    [true, null, true, 'mfa', 1, 0],
    [true, 'aal2', false, 'denied', 1, 1],
    [true, 'aal2', true, 'ready', 1, 1],
  ] as const)(
    'session %s, assurance %s, membership %s → %s',
    async (session, assurance, membership, expected, aalCalls, memberCalls) => {
      const checks = {
        session: vi.fn(async () => session),
        assurance: vi.fn(async () => assurance),
        membership: vi.fn(async () => membership),
      };
      expect(await checkGuard(checks)).toBe(expected);
      expect(checks.assurance).toHaveBeenCalledTimes(aalCalls);
      expect(checks.membership).toHaveBeenCalledTimes(memberCalls);
    },
  );
  it('propagates service errors without granting access', async () => {
    const membership = vi.fn(async () => true);
    await expect(
      checkGuard({
        session: async () => true,
        assurance: async () => {
          throw new Error('offline');
        },
        membership,
      }),
    ).rejects.toThrow('offline');
    expect(membership).not.toHaveBeenCalled();
  });
});

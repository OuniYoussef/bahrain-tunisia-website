export type GuardState = 'login' | 'mfa' | 'denied' | 'ready';
export async function checkGuard(checks: {
  session: () => Promise<boolean>;
  assurance: () => Promise<string | null>;
  membership: () => Promise<boolean>;
}): Promise<GuardState> {
  if (!(await checks.session())) return 'login';
  if ((await checks.assurance()) !== 'aal2') return 'mfa';
  return (await checks.membership()) ? 'ready' : 'denied';
}

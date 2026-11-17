import { createContext, use } from 'react';
export const AuthContext = createContext<(() => void) | null>(null);
export function useSignOut() {
  const value = use(AuthContext);
  if (!value) throw new Error('Missing auth provider');
  return value;
}

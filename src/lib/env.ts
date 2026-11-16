import type { parseEnv } from './env-schema';
// Vite validates and injects only the explicit public schema at build/dev startup.
declare const __PUBLIC_ENV__: ReturnType<typeof parseEnv>;
export const env = __PUBLIC_ENV__;

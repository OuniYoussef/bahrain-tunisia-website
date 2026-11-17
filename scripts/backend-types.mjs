import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const args = ['node_modules/supabase/dist/supabase.js', 'gen', 'types', '--lang', 'typescript', '--schema', 'public'];
if (process.argv.includes('--remote')) args.push('--remote');
const source = execFileSync(process.execPath, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
if (!source.includes('export type Database')) throw new Error('No database types returned; existing file preserved');
writeFileSync('src/lib/database.types.ts', source);

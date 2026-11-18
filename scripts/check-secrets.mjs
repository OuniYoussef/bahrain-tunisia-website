import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

// Report filenames only: never print matching credential values.
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const findings = [];
for (const file of files) {
  if (/(?:^|\/)\.env(?:\.|$)/.test(file) && !file.endsWith('.env.example')) findings.push(file);
  if (!/\.(?:[cm]?[jt]sx?|json|md|ya?ml|toml|sql|html|example|py)$/.test(file)) continue;
  const text = await readFile(file, 'utf8');
  if (/sb_secret_[A-Za-z0-9_-]{24,}|sk-proj-[A-Za-z0-9_-]{24,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text)) findings.push(file);
  // Legacy service-role JWTs can be recognized without printing their payload or signature.
  for (const token of text.matchAll(/\beyJ[A-Za-z0-9_-]+\.([A-Za-z0-9_-]+)\.[A-Za-z0-9_-]{20,}/g)) {
    try { if (JSON.parse(Buffer.from(token[1], 'base64url').toString()).role === 'service_role') findings.push(file); }
    catch { /* Non-JWT test data is not a credential. */ }
  }
}
if (findings.length) throw new Error(`Potential secrets require review: ${[...new Set(findings)].join(', ')}`);
console.log(`No recognized private credentials or tracked environment files in ${files.length} tracked paths. Variable names and documented placeholders are not secrets.`);

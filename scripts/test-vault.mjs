import {spawnSync} from 'node:child_process';
const env={...process.env,VITE_VAULT_MODE:'mock'};
for(const args of [[process.env.npm_execpath,'run','build'],['node_modules/@playwright/test/cli.js','test','tests/e2e/vault-mock.spec.ts',...process.argv.slice(2)]]) {
 const result=spawnSync(process.execPath,args,{stdio:'inherit',env});
 if(result.status!==0)process.exit(result.status??1);
}

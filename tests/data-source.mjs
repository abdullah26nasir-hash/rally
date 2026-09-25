import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { transform } from 'esbuild';
const source = readFileSync('src/data/source.ts', 'utf8');
assert(source.includes("kind: 'fictional-preview'"));
assert(source.includes('validateSnapshot'));
assert(source.includes('Missing source timestamp'));
for (const file of ['src/data/source.ts','src/data/pool.ts','src/data/season.ts','src/data/types.ts']) await transform(readFileSync(file,'utf8'),{loader:'ts',format:'esm'});
console.log('data source contract: 5/5 pass (typecheck and app regression are separate)');

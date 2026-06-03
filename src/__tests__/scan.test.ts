import { mkdtemp, writeFile, mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { runScan } from '../commands/scan.js';

async function makeNextProject(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'nextsec-'));
  await writeFile(path.join(root, 'package.json'), JSON.stringify({ dependencies: { next: '14.0.0' } }));
  await writeFile(path.join(root, 'next.config.js'), 'module.exports = {};');
  await mkdir(path.join(root, 'src/app'), { recursive: true });
  await writeFile(path.join(root, 'src/app/page.tsx'), `export default function Page() {\n  return <div dangerouslySetInnerHTML={{ __html: process.env.NEXT_PUBLIC_SECRET_TOKEN ?? '' }} />;\n}\n`);
  await writeFile(path.join(root, 'src/app/actions.ts'), `'use server';\nexport async function save(formData: FormData) {\n  return formData.get('name');\n}\n`);
  return root;
}

test('scan returns failing exit code for high findings at threshold', async () => {
  const root = await makeNextProject();
  const exitCode = await runScan(root, { format: 'json', failOn: 'high', ignoreRules: [] }, true);
  assert.equal(exitCode, 1);
});

test('ignore-rules suppresses static rule failures', async () => {
  const root = await makeNextProject();
  const exitCode = await runScan(root, { format: 'json', failOn: 'critical', ignoreRules: ['NS-012'] }, true);
  assert.equal(exitCode, 0);
});

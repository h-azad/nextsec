import path from 'node:path';
import { findFirstExisting, pathExists } from '../utils/fs.js';

export interface VerificationResult {
  valid: boolean;
  missing: string[];
}

export async function verifyNextProject(root: string): Promise<VerificationResult> {
  const missing: string[] = [];
  if (!(await pathExists(path.join(root, 'package.json')))) missing.push('package.json');
  if (!(await findFirstExisting(root, ['next.config.js', 'next.config.mjs', 'next.config.ts']))) {
    missing.push('next.config.js or next.config.mjs');
  }
  if (!(await findFirstExisting(root, ['src/app', 'app', 'pages', 'src/pages']))) {
    missing.push('src/app, app, pages, or src/pages directory');
  }
  return { valid: missing.length === 0, missing };
}

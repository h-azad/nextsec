import path from 'node:path';
import { findFirstExisting, pathExists } from '../utils/fs.js';
export async function verifyNextProject(root) {
    const missing = [];
    if (!(await pathExists(path.join(root, 'package.json'))))
        missing.push('package.json');
    if (!(await findFirstExisting(root, ['next.config.js', 'next.config.mjs', 'next.config.ts']))) {
        missing.push('next.config.js or next.config.mjs');
    }
    if (!(await findFirstExisting(root, ['src/app', 'app', 'pages', 'src/pages']))) {
        missing.push('src/app, app, pages, or src/pages directory');
    }
    return { valid: missing.length === 0, missing };
}
//# sourceMappingURL=verify.js.map
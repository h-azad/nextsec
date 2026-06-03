import { promises as fs } from 'node:fs';
import path from 'node:path';

export async function collectSourceFiles(root: string, exclude: string[] = []): Promise<string[]> {
  const files: string[] = [];
  await walk(root, files, root, exclude);
  return files;
}

function isSource(file: string): boolean {
  return /\.(js|jsx|ts|tsx)$/.test(file);
}

async function walk(current: string, files: string[], root: string, exclude: string[]): Promise<void> {
  const entries = await fs.readdir(current, { withFileTypes: true });
  for (const entry of entries) {
    const absolute = path.join(current, entry.name);
    const relative = path.relative(root, absolute).split(path.sep).join('/');
    if (entry.isDirectory()) {
      if (['node_modules', '.next', 'dist', '.git'].includes(entry.name) || isExcluded(relative, exclude)) continue;
      await walk(absolute, files, root, exclude);
    } else if (entry.isFile() && isSource(entry.name) && !isExcluded(relative, exclude)) {
      files.push(absolute);
    }
  }
}

export function isExcluded(relativePath: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*');
    return new RegExp(`^${escaped}$`).test(relativePath);
  });
}

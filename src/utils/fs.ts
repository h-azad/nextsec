import { promises as fs } from 'node:fs';
import path from 'node:path';

export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readJsonFile<T>(filePath: string): Promise<T | undefined> {
  if (!(await pathExists(filePath))) return undefined;
  return JSON.parse(await fs.readFile(filePath, 'utf8')) as T;
}

export async function findFirstExisting(root: string, candidates: string[]): Promise<string | undefined> {
  for (const candidate of candidates) {
    const resolved = path.join(root, candidate);
    if (await pathExists(resolved)) return resolved;
  }
  return undefined;
}

export async function readSnippet(filePath: string, line?: number): Promise<string | undefined> {
  if (!line) return undefined;
  const contents = await fs.readFile(filePath, 'utf8');
  return contents.split(/\r?\n/)[line - 1]?.trim();
}

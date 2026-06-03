import path from 'node:path';
import { readJsonFile } from '../utils/fs.js';
import type { CliOptions, NextsecConfig } from '../types.js';

export async function loadConfig(root: string): Promise<NextsecConfig> {
  const candidates = ['.nextsecrc', 'nextsec.json'];
  for (const candidate of candidates) {
    const config = await readJsonFile<NextsecConfig>(path.join(root, candidate));
    if (config) return config;
  }
  return {};
}

export function mergeOptions(cli: Partial<CliOptions>, config: NextsecConfig): CliOptions {
  return {
    format: cli.format ?? 'text',
    failOn: cli.failOn ?? config.severityThreshold,
    ignoreRules: [...(config.ignoreRules ?? []), ...(cli.ignoreRules ?? [])]
  };
}

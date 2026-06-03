import path from 'node:path';
import { readJsonFile } from '../utils/fs.js';
export async function loadConfig(root) {
    const candidates = ['.nextsecrc', 'nextsec.json'];
    for (const candidate of candidates) {
        const config = await readJsonFile(path.join(root, candidate));
        if (config)
            return config;
    }
    return {};
}
export function mergeOptions(cli, config) {
    return {
        format: cli.format ?? 'text',
        failOn: cli.failOn ?? config.severityThreshold,
        ignoreRules: [...(config.ignoreRules ?? []), ...(cli.ignoreRules ?? [])]
    };
}
//# sourceMappingURL=loadConfig.js.map
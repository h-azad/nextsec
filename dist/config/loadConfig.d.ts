import type { CliOptions, NextsecConfig } from '../types.js';
export declare function loadConfig(root: string): Promise<NextsecConfig>;
export declare function mergeOptions(cli: Partial<CliOptions>, config: NextsecConfig): CliOptions;

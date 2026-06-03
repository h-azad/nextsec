import type { Finding, NextsecConfig } from '../types.js';
interface AnalyzeOptions {
    root: string;
    config: NextsecConfig;
    ignoreRules: string[];
}
export declare function analyzeSource({ root, config, ignoreRules }: AnalyzeOptions): Promise<Finding[]>;
export {};

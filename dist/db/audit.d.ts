import type { Finding, VulnerabilityRecord } from '../types.js';
export declare function loadVulnerabilityDb(): Promise<VulnerabilityRecord[]>;
export declare function auditDependencies(root: string, ignoredRules?: string[]): Promise<Finding[]>;

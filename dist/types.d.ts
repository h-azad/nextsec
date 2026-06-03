export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type OutputFormat = 'json' | 'markdown' | 'text';
export interface CliOptions {
    format: OutputFormat;
    failOn?: Severity;
    ignoreRules: string[];
}
export interface NextsecConfig {
    severityThreshold?: Severity;
    exclude?: string[];
    ignoreRules?: string[];
    exploitDbAutoUpdate?: boolean;
}
export interface Finding {
    ruleId: string;
    title: string;
    message: string;
    severity: Severity;
    file?: string;
    line?: number;
    column?: number;
    snippet?: string;
    cve?: string;
    edbId?: string;
    packageName?: string;
    installedVersion?: string;
    patchedVersion?: string;
}
export interface ScanResult {
    targetPath: string;
    generatedAt: string;
    findings: Finding[];
    summary: Record<Severity, number>;
}
export interface VulnerabilityRecord {
    packageName: string;
    vulnerableRange: string;
    severity: Severity;
    title: string;
    cve?: string;
    edbId?: string;
    patchedVersion?: string;
}
export declare const severityRank: Record<Severity, number>;
export declare const severities: Severity[];

import type { Finding, OutputFormat, ScanResult, Severity } from '../types.js';
export declare function createResult(targetPath: string, findings: Finding[]): ScanResult;
export declare function formatReport(result: ScanResult, format: OutputFormat): string;
export declare function shouldFail(findings: Finding[], threshold?: Severity): boolean;

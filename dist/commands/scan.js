import path from 'node:path';
import { analyzeSource } from '../analyzer/codeAnalyzer.js';
import { loadConfig, mergeOptions } from '../config/loadConfig.js';
import { auditDependencies } from '../db/audit.js';
import { createResult, formatReport, shouldFail } from '../reporter/report.js';
import { verifyNextProject } from './verify.js';
export async function runScan(targetPath, rawOptions, includeCode = true) {
    const root = path.resolve(targetPath);
    const config = await loadConfig(root);
    const options = mergeOptions(rawOptions, config);
    const verification = await verifyNextProject(root);
    if (!verification.valid && includeCode) {
        console.error(`nextsec: not a valid Next.js project. Missing: ${verification.missing.join(', ')}`);
        return 1;
    }
    const findings = [
        ...(await auditDependencies(root, options.ignoreRules)),
        ...(includeCode ? await analyzeSource({ root, config, ignoreRules: options.ignoreRules }) : [])
    ];
    const result = createResult(root, findings);
    console.log(formatReport(result, options.format));
    return shouldFail(findings, options.failOn) ? 1 : 0;
}
//# sourceMappingURL=scan.js.map
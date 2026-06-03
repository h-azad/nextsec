import type { Finding, OutputFormat, ScanResult, Severity } from '../types.js';
import { severityRank, severities } from '../types.js';

export function createResult(targetPath: string, findings: Finding[]): ScanResult {
  return {
    targetPath,
    generatedAt: new Date().toISOString(),
    findings,
    summary: Object.fromEntries(severities.map((severity) => [severity, findings.filter((f) => f.severity === severity).length])) as Record<Severity, number>
  };
}

export function formatReport(result: ScanResult, format: OutputFormat): string {
  if (format === 'json') return JSON.stringify(result, null, 2);
  if (format === 'markdown') return markdownReport(result);
  return textReport(result);
}

export function shouldFail(findings: Finding[], threshold?: Severity): boolean {
  if (!threshold) return false;
  return findings.some((finding) => severityRank[finding.severity] >= severityRank[threshold]);
}

function textReport(result: ScanResult): string {
  const lines = [bold('nextsec security report'), `Target: ${result.targetPath}`, `Generated: ${result.generatedAt}`, ''];
  lines.push(`Summary: ${severities.map((s) => `${colorSeverity(s)(s)}=${result.summary[s]}`).join(' ')}`);
  if (result.findings.length === 0) {
    lines.push('', green('✓ No findings detected.'));
    return lines.join('\n');
  }
  for (const finding of result.findings) {
    const location = finding.file ? `${finding.file}${finding.line ? `:${finding.line}` : ''}` : 'project';
    lines.push('', `${colorSeverity(finding.severity)(finding.severity.toUpperCase())} ${bold(finding.ruleId)} ${finding.title}`);
    lines.push(`  ${location}`);
    lines.push(`  ${finding.message}`);
    if (finding.cve) lines.push(`  CVE: ${finding.cve}`);
    if (finding.edbId) lines.push(`  EDB-ID: ${finding.edbId}`);
    if (finding.patchedVersion) lines.push(`  Patched: ${finding.patchedVersion}`);
    if (finding.snippet) lines.push(`  > ${finding.snippet}`);
  }
  return lines.join('\n');
}

function markdownReport(result: ScanResult): string {
  const lines = ['# nextsec security report', '', `- Target: \`${result.targetPath}\``, `- Generated: \`${result.generatedAt}\``, ''];
  lines.push('| Severity | Count |', '| --- | ---: |', ...severities.map((s) => `| ${s} | ${result.summary[s]} |`), '');
  if (result.findings.length === 0) return [...lines, 'No findings detected.'].join('\n');
  lines.push('## Findings', '');
  for (const finding of result.findings) {
    const location = finding.file ? `${finding.file}${finding.line ? `:${finding.line}` : ''}` : 'project';
    lines.push(`### ${finding.ruleId}: ${finding.title}`, '', `- Severity: **${finding.severity}**`, `- Location: \`${location}\``, `- Message: ${finding.message}`);
    if (finding.cve) lines.push(`- CVE: ${finding.cve}`);
    if (finding.edbId) lines.push(`- EDB-ID: ${finding.edbId}`);
    if (finding.snippet) lines.push('', '```', finding.snippet, '```');
    lines.push('');
  }
  return lines.join('\n');
}

function colorSeverity(severity: Severity): (text: string) => string {
  if (severity === 'critical' || severity === 'high') return red;
  if (severity === 'medium') return yellow;
  return cyan;
}

function wrap(open: string, close: string): (text: string) => string {
  return (text) => process.stdout.isTTY ? `${open}${text}${close}` : text;
}

const bold = wrap('\u001b[1m', '\u001b[22m');
const red = wrap('\u001b[31m', '\u001b[39m');
const yellow = wrap('\u001b[33m', '\u001b[39m');
const cyan = wrap('\u001b[36m', '\u001b[39m');
const green = wrap('\u001b[32m', '\u001b[39m');

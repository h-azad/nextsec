import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Finding, NextsecConfig } from '../types.js';
import { collectSourceFiles } from '../utils/glob.js';
import { readSnippet } from '../utils/fs.js';

interface AnalyzeOptions {
  root: string;
  config: NextsecConfig;
  ignoreRules: string[];
}

export async function analyzeSource({ root, config, ignoreRules }: AnalyzeOptions): Promise<Finding[]> {
  const ignored = new Set(ignoreRules);
  const files = await collectSourceFiles(root, config.exclude ?? []);
  const findings: Finding[] = [];
  for (const file of files) findings.push(...(await analyzeFile(file, root, ignored)));
  return findings;
}

async function analyzeFile(file: string, root: string, ignored: Set<string>): Promise<Finding[]> {
  const source = await fs.readFile(file, 'utf8');
  const findings: Finding[] = [];
  if (!ignored.has('NS-001')) findings.push(...(await checkServerActions(source, file, root)));
  if (!ignored.has('NS-004')) findings.push(...(await checkDangerouslySetInnerHTML(source, file, root)));
  if (!ignored.has('NS-012')) findings.push(...(await checkNextPublicLeakage(source, file, root)));
  return findings;
}

async function buildFinding(partial: Omit<Finding, 'snippet'>, absoluteFile: string): Promise<Finding> {
  return { ...partial, snippet: await readSnippet(absoluteFile, partial.line) };
}

async function checkDangerouslySetInnerHTML(source: string, file: string, root: string): Promise<Finding[]> {
  const findings: Finding[] = [];
  const lines = source.split(/\r?\n/);
  lines.forEach((line, index) => {
    const column = line.indexOf('dangerouslySetInnerHTML');
    if (column >= 0) {
      findings.push({
        ruleId: 'NS-004',
        title: 'Unsanitized dangerouslySetInnerHTML usage',
        message: 'Review this dangerouslySetInnerHTML sink and ensure content is sanitized before rendering.',
        severity: 'high',
        file: pathRelative(root, file),
        line: index + 1,
        column,
        snippet: line.trim()
      });
    }
  });
  return findings;
}

async function checkNextPublicLeakage(source: string, file: string, root: string): Promise<Finding[]> {
  const sensitive = /(SECRET|TOKEN|KEY|PASSWORD|PRIVATE|CREDENTIAL)/i;
  const findings: Promise<Finding>[] = [];
  for (const match of source.matchAll(/process\.env\.(NEXT_PUBLIC_[A-Z0-9_]+)/g)) {
    const envName = match[1]!;
    if (!sensitive.test(envName)) continue;
    const line = source.slice(0, match.index).split(/\r?\n/).length;
    findings.push(buildFinding({
      ruleId: 'NS-012',
      title: 'Sensitive-looking NEXT_PUBLIC environment variable',
      message: `${envName} will be bundled for browser access. Do not expose secrets with NEXT_PUBLIC_.`,
      severity: 'critical',
      file: pathRelative(root, file),
      line,
      column: match.index
    }, file));
  }
  return Promise.all(findings);
}

async function checkServerActions(source: string, file: string, root: string): Promise<Finding[]> {
  if (!/^\s*['"]use server['"];?/m.test(source)) return [];
  const hasValidation = /\b(zod|z\.|parse\(|safeParse\(|yup|valibot|superstruct)\b/.test(source);
  const hasAuthorization = /\b(auth|authorize|requireUser|requireSession|getServerSession|currentUser|hasPermission)\b/i.test(source);
  if (hasValidation && hasAuthorization) return [];

  const findings: Promise<Finding>[] = [];
  for (const match of source.matchAll(/^\s*export\s+(?:async\s+)?(?:function|const|default)\b/gm)) {
    const line = source.slice(0, match.index).split(/\r?\n/).length;
    findings.push(buildFinding({
      ruleId: 'NS-001',
      title: 'Potentially unprotected Server Action',
      message: `Server Action file is missing ${hasValidation ? 'authorization checks' : hasAuthorization ? 'input validation' : 'input validation and authorization checks'}.`,
      severity: 'medium',
      file: pathRelative(root, file),
      line
    }, file));
  }
  return Promise.all(findings);
}

function pathRelative(root: string, file: string): string {
  return path.relative(root, file).split(path.sep).join('/');
}

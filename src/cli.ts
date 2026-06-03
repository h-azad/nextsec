#!/usr/bin/env node
import { runScan } from './commands/scan.js';
import { updateDb } from './scripts/db-update.js';
import type { OutputFormat, Severity } from './types.js';

const formats: OutputFormat[] = ['json', 'markdown', 'text'];
const severities: Severity[] = ['low', 'medium', 'high', 'critical'];

interface ParsedOptions {
  format: OutputFormat;
  failOn?: Severity;
  ignoreRules: string[];
  output?: string;
}

async function main(argv: string[]): Promise<number> {
  const [command = 'help', ...rest] = argv;
  if (command === '--help' || command === '-h' || command === 'help') {
    printHelp();
    return 0;
  }
  if (command === '--version' || command === '-V') {
    console.log('0.1.0');
    return 0;
  }
  if (command === 'scan' || command === 'audit') {
    const { targetPath, options } = parseScanArgs(rest);
    return runScan(targetPath, options, command === 'scan');
  }
  if (command === 'db-update') {
    const options = parseDbUpdateArgs(rest);
    await updateDb(options.output ?? 'data/exploitdb-web.json');
    console.log(`Updated vulnerability database at ${options.output ?? 'data/exploitdb-web.json'}`);
    return 0;
  }
  console.error(`Unknown command: ${command}`);
  printHelp();
  return 1;
}

function parseScanArgs(args: string[]): { targetPath: string; options: ParsedOptions } {
  const options: ParsedOptions = { format: 'text', ignoreRules: [] };
  let targetPath = '.';
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]!;
    if (arg === '-f' || arg === '--format') options.format = parseFormat(requireValue(arg, args[++index]));
    else if (arg === '--fail-on') options.failOn = parseSeverity(requireValue(arg, args[++index]));
    else if (arg === '--ignore-rules') options.ignoreRules = parseRuleIds(requireValue(arg, args[++index]));
    else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`);
    else targetPath = arg;
  }
  return { targetPath, options };
}

function parseDbUpdateArgs(args: string[]): ParsedOptions {
  const options: ParsedOptions = { format: 'text', ignoreRules: [] };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]!;
    if (arg === '-o' || arg === '--output') options.output = requireValue(arg, args[++index]);
    else throw new Error(`Unknown option: ${arg}`);
  }
  return options;
}

function requireValue(flag: string, value?: string): string {
  if (!value) throw new Error(`Missing value for ${flag}`);
  return value;
}

function parseFormat(value: string): OutputFormat {
  if (formats.includes(value as OutputFormat)) return value as OutputFormat;
  throw new Error(`Invalid format ${value}; expected one of: ${formats.join(', ')}`);
}

function parseSeverity(value: string): Severity {
  if (severities.includes(value as Severity)) return value as Severity;
  throw new Error(`Invalid severity ${value}; expected one of: ${severities.join(', ')}`);
}

function parseRuleIds(value: string): string[] {
  return value.split(',').map((rule) => rule.trim()).filter(Boolean);
}

function printHelp(): void {
  console.log(`nextsec 0.1.0\n\nUsage:\n  nextsec scan [path] [options]\n  nextsec audit [path] [options]\n  nextsec db-update [options]\n\nOptions:\n  -f, --format <json|markdown|text>       Output format (default: text)\n      --fail-on <low|medium|high|critical> Exit non-zero at threshold\n      --ignore-rules <rule-ids>            Comma-separated rule IDs\n  -o, --output <path>                      db-update output path\n  -h, --help                               Show help\n`);
}

main(process.argv.slice(2)).then((code) => process.exit(code)).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

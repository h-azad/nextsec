export function cleanVersion(value: string): string | undefined {
  const match = value.match(/\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?/);
  return match?.[0];
}

export function minVersion(range: string): string | undefined {
  return cleanVersion(range);
}

export function satisfies(version: string, range: string): boolean {
  const simple = range.trim();
  const match = simple.match(/^(<=|<|>=|>|=)?\s*(\d+\.\d+\.\d+)/);
  if (!match) return false;
  const op = match[1] ?? '=';
  const cmp = compare(version, match[2]!);
  if (op === '<') return cmp < 0;
  if (op === '<=') return cmp <= 0;
  if (op === '>') return cmp > 0;
  if (op === '>=') return cmp >= 0;
  return cmp === 0;
}

function compare(left: string, right: string): number {
  const a = left.split(/[.-]/).slice(0, 3).map(Number);
  const b = right.split(/[.-]/).slice(0, 3).map(Number);
  for (let i = 0; i < 3; i += 1) {
    if ((a[i] ?? 0) > (b[i] ?? 0)) return 1;
    if ((a[i] ?? 0) < (b[i] ?? 0)) return -1;
  }
  return 0;
}

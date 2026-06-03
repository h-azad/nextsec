declare module 'node:fs' {
  export const promises: {
    access(path: string): Promise<void>;
    readFile(path: string, encoding: string): Promise<string>;
    writeFile(path: string, data: string): Promise<void>;
    mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
    readdir(path: string, options: { withFileTypes: true }): Promise<Array<{ name: string; isDirectory(): boolean; isFile(): boolean }>>;
  };
  export function existsSync(path: string): boolean;
}
declare module 'node:fs/promises' {
  export function mkdtemp(prefix: string): Promise<string>;
  export function writeFile(path: string, data: string): Promise<void>;
  export function mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
}
declare module 'node:path' {
  const path: {
    join(...parts: string[]): string;
    resolve(...parts: string[]): string;
    dirname(path: string): string;
    relative(from: string, to: string): string;
    sep: string;
  };
  export default path;
}
declare module 'node:os' {
  const os: { tmpdir(): string };
  export default os;
}
declare module 'node:test' {
  export default function test(name: string, fn: () => void | Promise<void>): void;
}
declare module 'node:assert/strict' {
  const assert: { equal(actual: unknown, expected: unknown): void };
  export default assert;
}
declare const process: {
  argv: string[];
  stdout: { isTTY?: boolean };
  exit(code?: number): never;
};
declare const console: {
  log(...args: unknown[]): void;
  error(...args: unknown[]): void;
};
declare function fetch(input: string): Promise<{ ok: boolean; status: number; statusText: string; text(): Promise<string> }>;

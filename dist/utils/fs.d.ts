export declare function pathExists(filePath: string): Promise<boolean>;
export declare function readJsonFile<T>(filePath: string): Promise<T | undefined>;
export declare function findFirstExisting(root: string, candidates: string[]): Promise<string | undefined>;
export declare function readSnippet(filePath: string, line?: number): Promise<string | undefined>;

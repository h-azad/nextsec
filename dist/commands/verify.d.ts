export interface VerificationResult {
    valid: boolean;
    missing: string[];
}
export declare function verifyNextProject(root: string): Promise<VerificationResult>;

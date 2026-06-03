import { existsSync, promises as fs } from 'node:fs';
import path from 'node:path';
import { pathExists, readJsonFile } from '../utils/fs.js';
import { cleanVersion, minVersion, satisfies } from '../utils/semver.js';
export async function loadVulnerabilityDb() {
    const dbPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../data/vulnerabilities.json');
    return (await readJsonFile(dbPath)) ?? [];
}
export async function auditDependencies(root, ignoredRules = []) {
    const deps = await readDependencies(root);
    const db = await loadVulnerabilityDb();
    const ignored = new Set(ignoredRules);
    const findings = [];
    for (const vuln of db) {
        if (ignored.has('NS-DEP'))
            continue;
        const installedVersion = deps.get(vuln.packageName);
        if (!installedVersion)
            continue;
        if (satisfies(installedVersion, vuln.vulnerableRange)) {
            findings.push({
                ruleId: 'NS-DEP',
                title: vuln.title,
                message: `${vuln.packageName}@${installedVersion} matches vulnerable range ${vuln.vulnerableRange}.`,
                severity: vuln.severity,
                file: lockfileFor(root),
                packageName: vuln.packageName,
                installedVersion,
                patchedVersion: vuln.patchedVersion,
                cve: vuln.cve,
                edbId: vuln.edbId
            });
        }
    }
    return findings;
}
async function readDependencies(root) {
    if (await pathExists(path.join(root, 'package-lock.json')))
        return readPackageLock(root);
    if (await pathExists(path.join(root, 'pnpm-lock.yaml')))
        return readPnpmLock(root);
    if (await pathExists(path.join(root, 'yarn.lock')))
        return readYarnLock(root);
    if (await pathExists(path.join(root, 'package.json')))
        return readPackageJson(root);
    return new Map();
}
async function readPackageLock(root) {
    const lock = await readJsonFile(path.join(root, 'package-lock.json'));
    const deps = new Map();
    for (const [name, meta] of Object.entries(lock?.dependencies ?? {})) {
        const version = meta.version ? cleanVersion(meta.version) : undefined;
        if (version)
            deps.set(name, version);
    }
    for (const [pkgPath, meta] of Object.entries(lock?.packages ?? {})) {
        if (!pkgPath.startsWith('node_modules/') || !meta.version)
            continue;
        const version = cleanVersion(meta.version);
        if (version)
            deps.set(pkgPath.replace(/^node_modules\//, ''), version);
    }
    return deps;
}
async function readPnpmLock(root) {
    const contents = await fs.readFile(path.join(root, 'pnpm-lock.yaml'), 'utf8');
    const deps = new Map();
    for (const match of contents.matchAll(/^\s{2}\/?((?:@[^/]+\/)?[^/@\s]+)@(\d+\.\d+\.\d+)/gm)) {
        deps.set(match[1], match[2]);
    }
    return deps;
}
async function readYarnLock(root) {
    const contents = await fs.readFile(path.join(root, 'yarn.lock'), 'utf8');
    const deps = new Map();
    const blocks = contents.split(/\n(?=\S)/g);
    for (const block of blocks) {
        const nameMatch = block.match(/^"?((?:@[^/]+\/)?[^@":]+)@/);
        const versionMatch = block.match(/\n\s+version\s+"?(\d+\.\d+\.\d+)/);
        if (nameMatch && versionMatch)
            deps.set(nameMatch[1], versionMatch[1]);
    }
    return deps;
}
async function readPackageJson(root) {
    const pkg = await readJsonFile(path.join(root, 'package.json'));
    const deps = new Map();
    for (const [name, range] of Object.entries({ ...(pkg?.dependencies ?? {}), ...(pkg?.devDependencies ?? {}) })) {
        const version = minVersion(range);
        if (version)
            deps.set(name, version);
    }
    return deps;
}
function lockfileFor(root) {
    for (const file of ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'package.json']) {
        if (existsSync(path.join(root, file)))
            return file;
    }
    return 'package.json';
}
//# sourceMappingURL=audit.js.map
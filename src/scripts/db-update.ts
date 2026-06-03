import { promises as fs } from 'node:fs';
import path from 'node:path';

const EXPLOIT_DB_FILES_CSV = 'https://gitlab.com/exploit-database/exploitdb/-/raw/main/files_exploits.csv';

export async function updateDb(outputPath = path.resolve('data/exploitdb-web.json')): Promise<void> {
  const response = await fetch(EXPLOIT_DB_FILES_CSV);
  if (!response.ok) throw new Error(`Failed to download Exploit-DB CSV: ${response.status} ${response.statusText}`);
  const csv = await response.text();
  const webRows = csv.split('\n').filter((row) => /webapps|node|javascript|next\.js/i.test(row));
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify({ generatedAt: new Date().toISOString(), source: EXPLOIT_DB_FILES_CSV, rows: webRows }, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  updateDb(process.argv[2]).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}

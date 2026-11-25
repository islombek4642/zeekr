import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const ROOT_DIR = path.resolve(process.cwd());

export function resolveRepoPath(relPath: string): string {
  return path.isAbsolute(relPath) ? relPath : path.resolve(ROOT_DIR, relPath);
}

export function fileExistsInRepo(relPath: string): boolean {
  return fs.existsSync(resolveRepoPath(relPath));
}

export async function importOptionalModule<T = Record<string, any>>(
  relPath: string
): Promise<T | null> {
  const candidates = [
    relPath,
    `${relPath}.ts`,
    `${relPath}.tsx`,
    `${relPath}.js`,
    path.join(relPath, 'index.ts'),
    path.join(relPath, 'index.tsx'),
  ];

  let foundPath: string | null = null;
  for (const candidate of candidates) {
    const abs = resolveRepoPath(candidate);
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
      foundPath = abs;
      break;
    }
  }

  if (!foundPath) {
    return null;
  }

  // Use file URL or Vite path so dynamic loading of optional Part B/C modules
  // works cleanly at runtime without failing static TypeScript compilation.
  const target = pathToFileURL(foundPath).href;
  try {
    return (await import(/* @vite-ignore */ target)) as T;
  } catch {
    // Fallback to raw absolute path for Vitest's module runner on Windows
    return (await import(/* @vite-ignore */ foundPath)) as T;
  }
}

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VISUAL_DIR = path.resolve(__dirname, 'screenshots', 'visual');
const FAILURE_DIR = path.resolve(__dirname, 'screenshots', 'failure');
const MAX_VISUAL_SCREENSHOTS = 30;
const MAX_FAILURE_SCREENSHOTS = 30;
const MAX_VIDEOS = 10;

function cleanupByExtension(
  dir: string,
  extensions: string[],
  maxCount: number,
  label: string,
) {
  if (!fs.existsSync(dir)) return;

  const files: { name: string; fullPath: string; mtime: number }[] = [];

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (extensions.some(ext => entry.name.endsWith(ext))) {
        files.push({
          name: entry.name,
          fullPath,
          mtime: fs.statSync(fullPath).mtimeMs,
        });
      }
    }
  }

  walk(dir);
  files.sort((a, b) => b.mtime - a.mtime);

  if (files.length <= maxCount) return;

  const toDelete = files.slice(maxCount);
  for (const file of toDelete) {
    fs.rmSync(file.fullPath, { force: true });
  }

  console.log(
    `Cleaned up ${toDelete.length} old ${label}(s), kept latest ${maxCount}.`,
  );
}

function cleanupEmptyFolders(dir: string) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const fullPath = path.join(dir, entry.name);
      cleanupEmptyFolders(fullPath);
      if (fs.readdirSync(fullPath).length === 0) {
        fs.rmdirSync(fullPath);
      }
    }
  }
}

cleanupByExtension(
  VISUAL_DIR,
  ['.png', '.jpg', '.jpeg'],
  MAX_VISUAL_SCREENSHOTS,
  'visual screenshot',
);
cleanupByExtension(
  FAILURE_DIR,
  ['.png', '.jpg', '.jpeg'],
  MAX_FAILURE_SCREENSHOTS,
  'failure screenshot',
);
cleanupByExtension(FAILURE_DIR, ['.webm', '.mp4'], MAX_VIDEOS, 'video');
cleanupEmptyFolders(FAILURE_DIR);

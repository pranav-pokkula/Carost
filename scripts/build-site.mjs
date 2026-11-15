import { cp, copyFile, mkdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');
const source = path.join(root, 'frontend', 'public');
const files = [
  'index.html',
  'styles.css',
  'marketplace.mjs',
  'demo-data.mjs',
  'booking-core.mjs',
];
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const file of files) {
  await copyFile(path.join(source, file), path.join(out, file));
}
const mediaDir = path.join(root, 'frontend', 'assets', 'carost');
try {
  const info = await stat(mediaDir);
  if (info.isDirectory()) {
    await cp(mediaDir, path.join(out, 'assets', 'carost'), { recursive: true });
  }
} catch (err) {
  if (err.code !== 'ENOENT') throw err;
}
const built = await stat(path.join(out, 'index.html'));
if (!built.isFile()) throw new Error('No index.html emitted');
console.log('Carost static production output ready at', out);

import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, copyFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { webcrypto } from 'node:crypto';

const fixture = await mkdtemp(join(tmpdir(), 'portfolio-photo-test-'));
try {
  await mkdir(join(fixture, 'scripts'));
  await mkdir(join(fixture, '.private'));
  await copyFile(new URL('encrypt-private.mjs', import.meta.url), join(fixture, 'scripts/encrypt-private.mjs'));
  const password = 'Temporary-photo-test-passphrase';
  const photo = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
  await writeFile(join(fixture, '.private/password.txt'), password);
  await writeFile(join(fixture, '.private/portrait.png'), photo);
  const contentFile = join(fixture, '.private/content.json');
  await writeFile(contentFile, JSON.stringify({ photoFiles: { portrait: 'portrait.png' } }));
  const run = () => execFileSync(process.execPath, [join(fixture, 'scripts/encrypt-private.mjs')], { stdio: 'pipe' });
  run();
  const encrypted = JSON.parse(await readFile(join(fixture, 'static/private/content.enc.json'), 'utf8'));
  const material = await webcrypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await webcrypto.subtle.deriveKey({ name: 'PBKDF2', salt: Buffer.from(encrypted.salt, 'base64'), iterations: encrypted.iterations, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const decoded = JSON.parse(new TextDecoder().decode(await webcrypto.subtle.decrypt({ name: 'AES-GCM', iv: Buffer.from(encrypted.iv, 'base64') }, key, Buffer.from(encrypted.ciphertext, 'base64'))));
  assert.equal(decoded.photos.portrait, `data:image/png;base64,${photo.toString('base64')}`);
  assert.equal(decoded.photoFiles, undefined);
  assert(!JSON.stringify(encrypted).includes(photo.toString('base64')));
  await writeFile(join(fixture, 'outside.png'), photo);
  await writeFile(contentFile, JSON.stringify({ photoFiles: { portrait: '../outside.png' } }));
  assert.throws(run, /Private photos must be inside/);
  await writeFile(join(fixture, '.private/unsafe.svg'), '<svg></svg>');
  await writeFile(contentFile, JSON.stringify({ photoFiles: { portrait: 'unsafe.svg' } }));
  assert.throws(run, /Use JPEG, PNG or WebP/);
  console.log('PASS: Photo bytes round-trip inside encryption; no plaintext image in envelope; source paths omitted; traversal and SVG rejected.');
} finally {
  // Only this test's freshly created temporary directory is removed.
  await rm(fixture, { recursive: true, force: true });
}

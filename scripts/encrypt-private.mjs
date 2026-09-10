import { webcrypto } from 'node:crypto';
import { readFile, writeFile, mkdir, realpath } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Run explicitly after editing local content. CI publishes only the encrypted file.
const root = new URL('../', import.meta.url);
const password = (await readFile(new URL('.private/password.txt', root), 'utf8')).trimEnd();
if (password.length < 16) throw new Error('Use a unique passphrase of at least 16 characters.');
const content = JSON.parse(await readFile(new URL('.private/content.json', root), 'utf8'));
const privateRoot = await realpath(fileURLToPath(new URL('.private/', root)));
const mimeTypes = { '.jpg': 'jpeg', '.jpeg': 'jpeg', '.png': 'png', '.webp': 'webp' };
content.photos = {};
for (const [slot, filename] of Object.entries(content.photoFiles ?? {})) {
  if (!['portrait', 'moment', 'detail', 'closing'].includes(slot) || typeof filename !== 'string') throw new Error('Invalid photo slot or filename.');
  const file = await realpath(resolve(privateRoot, filename));
  if (!file.startsWith(privateRoot + sep)) throw new Error('Private photos must be inside .private/.');
  const mime = mimeTypes[extname(file).toLowerCase()];
  if (!mime) throw new Error('Use JPEG, PNG or WebP photos.');
  const image = await readFile(file);
  if (image.length > 4 * 1024 * 1024) throw new Error('Resize each photo to less than 4 MB before encryption.');
  content.photos[slot] = `data:image/${mime};base64,${image.toString('base64')}`;
}
delete content.photoFiles;
const plaintext = new TextEncoder().encode(JSON.stringify(content));
const salt = webcrypto.getRandomValues(new Uint8Array(16));
const iv = webcrypto.getRandomValues(new Uint8Array(12));
const iterations = 600000;
const material = await webcrypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
const key = await webcrypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const ciphertext = await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
const base64 = (bytes) => Buffer.from(bytes).toString('base64');
await mkdir(new URL('static/private/', root), { recursive: true });
await writeFile(new URL('static/private/content.enc.json', root), JSON.stringify({ version: 1, iterations, salt: base64(salt), iv: base64(iv), ciphertext: base64(ciphertext) }));
console.log('Encrypted private content written. No password or plaintext is included in the public file.');

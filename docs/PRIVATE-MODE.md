# Private mode

The overview has an in-memory private mode. Its text is loaded from `static/private/content.enc.json` and decrypted after password entry using Web Crypto: AES-256-GCM, PBKDF2-SHA256 with 600,000 iterations, random 16-byte salt and 12-byte IV per encryption. The password and plaintext never enter the app imports or build. Switching back, refreshing, and navigating away remove the private view; no credentials or decrypted content are persisted in browser storage. Removing references is not a guarantee of physical memory erasure in a JavaScript runtime.

## Editing locally

The gitignored `.private/content.json` contains the editable content; `.private/password.txt` contains the password. Both must be backed up privately. Neither is needed by CI. After changes, run `npm run private:encrypt`, then `npm run build`. Publish the resulting encrypted asset with the site. Encryption is an explicit step; an ordinary build does not change the password or require private source files.

The first local setup uses a demo password supplied in the task handoff. Replace it with a long unique passphrase before adding real personal material. Never commit private sources, passwords, or screenshots showing real private content. Do not put secrets in VITE variables. Only dummy content is in the initial encrypted payload.

The portrait, moment, detail and closing areas currently use explicit placeholders. To add photos, put JPEG, PNG or WebP files under `.private/images/` and add a `photoFiles` mapping to `.private/content.json`, for example `"photoFiles": { "portrait": "images/portrait.jpg", "moment": "images/moment.webp" }`. Supported slots are `portrait`, `moment`, `detail` and `closing`. Each image must be below 4 MB; resize appropriately and remove unnecessary EXIF metadata before use. Run `npm run private:encrypt` again. The script embeds image bytes into the encrypted payload and strips the source paths. The browser accepts only embedded raster data URLs, so private photos never need a public asset URL. Missing slots retain their placeholders. Image-specific alt descriptions should be supplied when actual photographs replace placeholders.

Public layout labels and styling are intentionally visible in the app bundle; personal text is encrypted and rendered with Svelte escaping, never raw HTML. Never place plaintext private photos in `static/`.

For local verification, run `npm run check`, `npm run build`, then start `npm run preview` and run `node scripts/test-private.mjs` (set `PRIVATE_TEST_URL` if using another port). `node scripts/test-private-photos.mjs` separately checks encrypted image round-tripping and rejected source paths/formats using disposable test fixtures.

## Limits

Anyone can download the ciphertext and attempt passwords offline. No server-side rate limiting, individual accounts, revocation, or password recovery exists. Someone who knows an old password can still open a saved old payload. Authorized visitors can copy decrypted material. Browser extensions and compromised client code are outside this protection. HTTPS (or localhost for development) is required.

Reference: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey

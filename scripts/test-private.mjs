import assert from 'node:assert/strict';
import { readFile, readdir, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const root = fileURLToPath(new URL('../', import.meta.url));
const password = (await readFile(join(root, '.private/password.txt'), 'utf8')).trimEnd();
const source = JSON.parse(await readFile(join(root, '.private/content.json'), 'utf8'));
const needles = [password, ...Object.values(source).flat().filter((value) => typeof value === 'string')];
async function scan(dir) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) await scan(path);
		else if (/\.(html|js|json|css|txt|map)$/.test(entry.name)) {
			const text = await readFile(path, 'utf8');
			assert(!needles.some((needle) => text.includes(needle)), `Plaintext leak in ${path}`);
		}
	}
}
await scan(join(root, 'build'));
console.log('PASS: No password or private source strings in public build.');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const url = process.env.PRIVATE_TEST_URL || 'http://127.0.0.1:4173';
const gate = () => page.getByRole('switch', { name: 'Privatmodus' });
const input = () => page.getByLabel('Dein Passwort', { exact: true });
async function unlock() {
	await gate().click();
	await input().fill(password);
	await page.getByRole('button', { name: 'Tür öffnen', exact: true }).click();
	await page.locator('.private-world').waitFor();
}
try {
	await mkdir(join(root, '.impeccable/review'), { recursive: true });
	await page.goto(url);
	await page.keyboard.press('Tab');
	assert(await page.locator('a[href="#main-content"]').evaluate((el) => { const box = el.getBoundingClientRect(); return document.elementFromPoint(box.x + 5, box.y + 5) === el; }), 'Skip link is covered');
	assert.equal(await page.locator('.private-world').count(), 0);
	await page.screenshot({ path: join(root, '.impeccable/review/business-desktop.png') });
	await gate().click();
	assert.equal(await input().evaluate((el) => document.activeElement === el), true);
	await page.screenshot({ path: join(root, '.impeccable/review/password-desktop.png') });
	await input().fill('wrong-password');
	await page.getByRole('button', { name: 'Tür öffnen', exact: true }).click();
	await page.getByText('Das Passwort stimmt noch nicht. Versuch es noch einmal.').waitFor();
	assert.equal(await input().evaluate((el) => document.activeElement === el), true);
	assert.equal(await gate().getAttribute('aria-checked'), 'false');
	assert.equal(await input().inputValue(), '');
	await page.keyboard.press('Escape');
	assert.equal(await gate().evaluate((el) => document.activeElement === el), true);
	await unlock();
	assert.equal(await gate().getAttribute('aria-checked'), 'true');
	assert.equal(await page.locator('.site-header').count(), 0);
	const original = await page.locator('.thought > p').innerText();
	await page.getByRole('button', { name: 'Noch ein Fundstück' }).click();
	assert.notEqual(await page.locator('.thought > p').innerText(), original);
	/*
		The jukebox must be reachable from the top of the page, must never start
		on its own, and must advance on demand without starting. The audio is
		built in script rather than rendered, so before the first press there is
		no media element in the page at all, and the control labels are the
		honest signal for whether anything is playing.
	*/
	assert.equal(await page.locator('.private-world audio').count(), 0, 'No media element before the first press');
	const toggle = () => page.locator('button.ambient');
	await toggle().waitFor();
	assert.equal(await toggle().getAttribute('aria-label'), 'Musik anschalten');
	const firstTitle = await page.locator('.now-playing p').innerText();
	await page.getByRole('button', { name: 'Nächster Titel' }).click();
	assert.notEqual(await page.locator('.now-playing p').innerText(), firstTitle);
	assert.equal(await toggle().getAttribute('aria-label'), 'Musik anschalten', 'Skipping while paused must not start playback');
	assert.equal(await page.locator('.panel').getAttribute('data-playing'), 'false');
	assert((await page.locator('.time').innerText()).includes('02 / '));
	await page.evaluate(() => window.scrollTo(0, 0));
	await page.screenshot({ path: join(root, '.impeccable/review/private-desktop.png'), fullPage: true });
	for (const width of [360, 390, 640, 768, 1024, 1440]) {
		await page.setViewportSize({ width, height: 900 });
		assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}`);
		if (width === 390) await page.screenshot({ path: join(root, '.impeccable/review/private-mobile.png'), fullPage: true });
	}
	assert.equal(await page.evaluate((needles) => [...Object.values(localStorage), ...Object.values(sessionStorage)].some((v) => needles.some((needle) => v.includes(needle))), needles), false);
	await gate().click();
	await page.locator('.site-header').waitFor();
	assert.equal(await page.locator('.private-world').count(), 0);
	await unlock();
	await page.reload();
	await gate().waitFor();
	assert.equal(await gate().getAttribute('aria-checked'), 'false');
	assert.equal(await page.locator('.private-world').count(), 0);
	await page.setViewportSize({ width: 390, height: 844 });
	await gate().click();
	await page.screenshot({ path: join(root, '.impeccable/review/password-mobile.png') });
	await page.keyboard.press('Escape');
	await page.route('**/private/content.enc.json', async (route) => { await new Promise((resolve) => setTimeout(resolve, 700)); await route.continue().catch(() => {}); });
	await gate().click(); await input().fill(password);
	await page.getByRole('button', { name: 'Tür öffnen', exact: true }).click();
	await page.keyboard.press('Escape');
	await page.waitForTimeout(1300);
	assert.equal(await page.locator('.private-world').count(), 0);
	await page.unroute('**/private/content.enc.json');
	await page.route('**/private/content.enc.json', (route) => route.fulfill({ status: 503, body: 'Unavailable' }));
	await gate().click(); await input().fill(password);
	await page.getByRole('button', { name: 'Tür öffnen', exact: true }).click();
	await page.getByText('Die privaten Inhalte konnten nicht geladen werden. Bitte versuche es erneut.').waitFor();
	assert.equal(await page.locator('.private-world').count(), 0);
	await page.keyboard.press('Escape');
	await page.unroute('**/private/content.enc.json');
	await page.route('**/private/content.enc.json', async (route) => {
		const envelope = JSON.parse(await readFile(join(root, 'static/private/content.enc.json'), 'utf8'));
		const cipher = Buffer.from(envelope.ciphertext, 'base64'); cipher[0] ^= 1;
		envelope.ciphertext = cipher.toString('base64');
		await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(envelope) });
	});
	await gate().click(); await input().fill(password);
	await page.getByRole('button', { name: 'Tür öffnen', exact: true }).click();
	await page.getByText('Das Passwort stimmt noch nicht. Versuch es noch einmal.').waitFor();
	assert.equal(await page.locator('.private-world').count(), 0);
	await page.keyboard.press('Escape');
	await page.unroute('**/private/content.enc.json');
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.goto(`${url}/light`); await unlock(); await gate().click();
	assert.deepEqual(errors, []);
	console.log('PASS: Wrong/correct password, dialog focus/Escape, cancel in flight, load failure, relock, reload, /light, interactions, storage, six responsive widths; no browser exceptions.');
} finally { await browser.close(); }

/**
 * Layout collision check.
 *
 * The taste checks read source. This one reads geometry, because the class of
 * bug it exists for is invisible to source: the approach rows declared three
 * grid tracks and had two children, so the heading was assigned to a 5rem track
 * meant for a number that no longer existed, broke to one word per line and ran
 * straight into the body text beside it. Grid does not clip an item that
 * overflows its track, so a typecheck, a build and sixty taste checks all passed
 * over it. Only looking at the page found it.
 *
 * Three rules, all measured in a real browser at real widths:
 *
 *   collision  two in-flow siblings of a grid or flex container overlap
 *   overflow   an element runs outside its container's content box
 *   document   the page scrolls horizontally
 *
 * Usage: node scripts/layout-check.mjs [--width 1440] [--route /] [--json]
 * Requires `npm run build` first, and a Chromium that Playwright can drive.
 */

import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

// fileURLToPath and not URL.pathname: this project lives in a directory whose
// name has a space in it, and pathname hands that back percent-encoded.
const BUILD_DIR = fileURLToPath(new URL('../build/', import.meta.url));

/*
	Widths, not device names. The approach bug was invisible at 1440 and at 375
	and only showed between them, so the list has to be dense where the layout
	actually changes hands: the `md` breakpoint at 768 and the `lg` at 1024.
*/
const WIDTHS = [360, 375, 414, 600, 700, 768, 820, 900, 1024, 1180, 1280, 1440, 1728];

const TOLERANCE = 1.5; // px, absorbs subpixel rounding and hairline borders

const MIME = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.woff2': 'font/woff2',
	'.pdf': 'application/pdf',
	'.ico': 'image/x-icon'
};

/*
	playwright-core never downloads a browser, which keeps this check off the
	critical path of a fresh install. It resolves one instead: an explicit
	override, then whatever Playwright already cached, then a system Chrome.
*/
async function resolveBrowser() {
	if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;

	const cacheRoots = [
		process.env.PLAYWRIGHT_BROWSERS_PATH,
		join(homedir(), 'Library/Caches/ms-playwright'),
		join(homedir(), '.cache/ms-playwright'),
		join(process.env.LOCALAPPDATA ?? '', 'ms-playwright')
	].filter(Boolean);

	for (const root of cacheRoots) {
		if (!existsSync(root)) continue;
		const dirs = (await readdir(root)).filter((d) => d.startsWith('chromium-')).sort().reverse();
		for (const dir of dirs) {
			const candidates = [
				'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
				'chrome-mac/Chromium.app/Contents/MacOS/Chromium',
				'chrome-linux/chrome',
				'chrome-win/chrome.exe'
			];
			for (const rel of candidates) {
				const full = join(root, dir, rel);
				if (existsSync(full)) return full;
			}
		}
	}

	for (const sys of [
		'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
		'/Applications/Chromium.app/Contents/MacOS/Chromium',
		'/usr/bin/google-chrome',
		'/usr/bin/chromium'
	]) {
		if (existsSync(sys)) return sys;
	}

	throw new Error(
		'No Chromium found. Set CHROMIUM_PATH, or run `npx playwright install chromium`.'
	);
}

async function serve() {
	const server = createServer(async (req, res) => {
		try {
			const url = new URL(req.url, 'http://localhost');
			let path = join(BUILD_DIR, decodeURIComponent(url.pathname));
			if (existsSync(path) && (await stat(path)).isDirectory()) path = join(path, 'index.html');
			// adapter-static writes /projekte/slug as projekte/slug.html, not as a
			// directory with an index, so a bare route has to try the sibling file.
			if (!existsSync(path) && existsSync(`${path}.html`)) path = `${path}.html`;
			if (!existsSync(path)) path = join(BUILD_DIR, '404.html');
			if (!existsSync(path)) {
				res.writeHead(404).end('not found');
				return;
			}
			res.writeHead(200, { 'content-type': MIME[extname(path)] ?? 'application/octet-stream' });
			res.end(await readFile(path));
		} catch {
			res.writeHead(500).end('error');
		}
	});
	await new Promise((r) => server.listen(0, r));
	return { server, port: server.address().port };
}

/**
 * Every prerendered page, so a route is never checked only because someone
 * remembered to list it. The adapter emits both shapes: index.html inside a
 * directory for the root, and slug.html beside it for the case study pages.
 */
async function routes(dir = BUILD_DIR, base = '') {
	const found = [];
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		if (entry.name.startsWith('_') || entry.name === 'images' || entry.name === 'docs') continue;
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			found.push(...(await routes(full, `${base}/${entry.name}`)));
		} else if (entry.name === 'index.html') {
			found.push(base === '' ? '/' : base);
		} else if (entry.name.endsWith('.html') && entry.name !== '404.html') {
			found.push(`${base}/${entry.name.replace(/\.html$/, '')}`);
		}
	}
	return found.sort();
}

/*
	Runs in the page. Everything it reports is a measurement, never a guess about
	intent, and the exclusions below are the places where overlap is the design.
*/
const AUDIT = () => {
	const TOL = 1.5;
	const findings = [];

	const label = (el) => {
		const cls = typeof el.className === 'string' ? el.className : '';
		const own = cls
			.split(/\s+/)
			.filter((c) => c && !c.startsWith('svelte-'))
			.slice(0, 3)
			.join('.');
		const id = el.id ? `#${el.id}` : '';
		const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 42);
		return `${el.tagName.toLowerCase()}${id}${own ? '.' + own : ''}${text ? ` "${text}"` : ''}`;
	};

	const section = (el) => {
		const s = el.closest('section[id]');
		return s ? `#${s.id}` : '(page)';
	};

	const rectOf = (el) => el.getBoundingClientRect();
	const visible = (el, r) => {
		const cs = getComputedStyle(el);
		return (
			r.width > 0 &&
			r.height > 0 &&
			cs.visibility !== 'hidden' &&
			cs.display !== 'none' &&
			cs.position !== 'absolute' &&
			cs.position !== 'fixed' &&
			// sr-only and other clipped-away helpers are not layout
			!(r.width <= 1 && r.height <= 1)
		);
	};

	const overlap = (a, b) => {
		const x = Math.min(a.right, b.right) - Math.max(a.left, b.left);
		const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
		return x > TOL && y > TOL ? { x, y } : null;
	};

	const ignored = (el) => el.closest('[data-layout-check="ignore"]') !== null;

	/*
		A grid with exactly one column and one row is a stack, not a layout: every
		child is in the same cell by construction and overlapping is the entire
		point. This project uses it twice, to hold both states of the CV button and
		all three of the copy button in place so the control cannot resize under
		the cursor pressing it. Reading the resolved track count rather than
		guessing from the rects keeps a genuinely broken two-column grid in scope.
	*/
	const isStack = (cs) =>
		cs.display.includes('grid') &&
		cs.gridTemplateColumns.split(/\s+/).filter(Boolean).length === 1 &&
		cs.gridTemplateRows.split(/\s+/).filter(Boolean).length === 1;

	// ---- collision: two in-flow siblings of one grid or flex container overlap
	for (const container of document.querySelectorAll('*')) {
		const cs = getComputedStyle(container);
		if (!/grid|flex/.test(cs.display)) continue;
		if (ignored(container) || isStack(cs)) continue;

		const kids = [...container.children].filter((el) => visible(el, rectOf(el)));
		for (let i = 0; i < kids.length; i++) {
			for (let j = i + 1; j < kids.length; j++) {
				const ra = rectOf(kids[i]);
				const rb = rectOf(kids[j]);
				/*
					Two children sharing one cell to cross-fade between states is a
					pattern this project uses on purpose (the CV button holds both its
					labels stacked so the control cannot resize mid-click). Identical
					rects are that, not a collision.
				*/
				const identical =
					Math.abs(ra.left - rb.left) < TOL &&
					Math.abs(ra.top - rb.top) < TOL &&
					Math.abs(ra.width - rb.width) < TOL &&
					Math.abs(ra.height - rb.height) < TOL;
				if (identical) continue;

				const hit = overlap(ra, rb);
				if (!hit) continue;

				findings.push({
					rule: 'collision',
					where: section(container),
					container: label(container),
					a: label(kids[i]),
					b: label(kids[j]),
					detail: `overlap ${Math.round(hit.x)}x${Math.round(hit.y)}px`
				});
			}
		}
	}

	/*
		---- spill: an element's own content is wider than the element.

		This is the rule the check exists for, and the first version of the check
		did not have it. The broken approach row put its heading in an 80px track
		and the heading's border box obediently measured 80px wide while the words
		ran far outside it, so a rect-versus-rect collision test saw nothing at all.
		getBoundingClientRect measures the frame; scrollWidth measures what is
		actually inside it. Only the second one notices text leaving its box.
	*/
	for (const el of document.querySelectorAll('section *')) {
		const r = rectOf(el);
		if (!visible(el, r) || ignored(el)) continue;

		const cs = getComputedStyle(el);
		if (cs.overflow !== 'visible' || cs.overflowX !== 'visible') continue;
		// Only elements that hold text of their own; a wrapper's scrollWidth is
		// its children's business and is covered by the overflow rule below.
		const ownText = [...el.childNodes].some(
			(n) => n.nodeType === 3 && n.textContent.trim().length > 0
		);
		if (!ownText) continue;

		const spill = el.scrollWidth - el.clientWidth;
		if (spill > TOL) {
			findings.push({
				rule: 'spill',
				where: section(el),
				container: label(el.parentElement ?? el),
				a: label(el),
				b: '',
				detail: `content is ${Math.round(spill)}px wider than its ${Math.round(
					el.clientWidth
				)}px box`
			});
		}
	}

	// ---- overflow: an element runs past its container's content box
	for (const el of document.querySelectorAll('section *')) {
		const r = rectOf(el);
		if (!visible(el, r) || ignored(el)) continue;
		const parent = el.parentElement;
		if (!parent) continue;

		const pcs = getComputedStyle(parent);
		// A parent that scrolls or clips has opted into content leaving its box.
		if (pcs.overflow !== 'visible' || pcs.overflowX !== 'visible') continue;

		const ecs = getComputedStyle(el);
		if (ecs.position === 'sticky') continue;

		/*
			A negative margin is an authored bleed, not an accident: the current
			role's panel on the career axis deliberately pulls out of its column to
			mark itself. Only the side that was pulled is excused, so a bleed left
			still cannot hide an overflow right.
		*/
		const bleedL = (parseFloat(ecs.marginLeft) || 0) < 0;
		const bleedR = (parseFloat(ecs.marginRight) || 0) < 0;

		const pr = rectOf(parent);
		const padL = parseFloat(pcs.paddingLeft) || 0;
		const padR = parseFloat(pcs.paddingRight) || 0;
		const left = pr.left + padL;
		const right = pr.right - padR;

		const outRight = bleedR ? 0 : r.right - right;
		const outLeft = bleedL ? 0 : left - r.left;
		if (outRight > TOL || outLeft > TOL) {
			findings.push({
				rule: 'overflow',
				where: section(el),
				container: label(parent),
				a: label(el),
				b: '',
				detail:
					outRight > TOL
						? `${Math.round(outRight)}px past the right edge`
						: `${Math.round(outLeft)}px past the left edge`
			});
		}
	}

	// ---- document: the page itself scrolls sideways
	const doc = document.documentElement;
	if (doc.scrollWidth - doc.clientWidth > TOL) {
		findings.push({
			rule: 'document',
			where: '(page)',
			container: 'html',
			a: '',
			b: '',
			detail: `${doc.scrollWidth - doc.clientWidth}px of horizontal scroll`
		});
	}

	return findings;
};

/*
	Measure the settled page, not a page mid-entrance. Reveal elements sit at
	opacity 0 with a 28px offset until an observer promotes them, and the hero
	words carry an entrance transform, so the geometry before this runs is the
	geometry of an animation frame rather than of the layout.
*/
const SETTLE = () => {
	document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
	document.getAnimations().forEach((a) => {
		const timing = a.effect?.getTiming?.();
		if (timing && timing.iterations === Infinity) a.cancel();
		else a.finish();
	});
	window.scrollTo(0, 0);
};

async function main() {
	const args = process.argv.slice(2);
	const asJson = args.includes('--json');
	const only = (flag) => {
		const i = args.indexOf(flag);
		return i === -1 ? null : args[i + 1];
	};

	if (!existsSync(BUILD_DIR)) {
		console.error('No build/ directory. Run `npm run build` first.');
		process.exit(2);
	}

	const widthArg = only('--width');
	const widths = widthArg ? [Number(widthArg)] : WIDTHS;
	const routeArg = only('--route');

	const executablePath = await resolveBrowser();
	const { server, port } = await serve();
	const pages = routeArg ? [routeArg] : await routes();

	const browser = await chromium.launch({ executablePath });
	const all = [];

	try {
		for (const width of widths) {
			const context = await browser.newContext({
				viewport: { width, height: 900 },
				deviceScaleFactor: 1,
				reducedMotion: 'no-preference'
			});
			const page = await context.newPage();

			for (const route of pages) {
				await page.goto(`http://localhost:${port}${route}`, { waitUntil: 'load' });
				// Real fonts change every measurement that involves text.
				await page.evaluate(() => document.fonts.ready);
				await page.evaluate(SETTLE);
				const found = await page.evaluate(AUDIT);
				for (const f of found) all.push({ ...f, width, route });
			}

			await context.close();
		}
	} finally {
		await browser.close();
		server.close();
	}

	/*
		The same broken row reports at every width it breaks at. Collapsing on the
		defect and listing the widths turns thirteen copies into one finding that
		says how wide the problem is.
	*/
	const grouped = new Map();
	for (const f of all) {
		const key = [f.rule, f.route, f.where, f.container, f.a, f.b].join('|');
		if (!grouped.has(key)) grouped.set(key, { ...f, widths: [], details: new Set() });
		grouped.get(key).widths.push(f.width);
		grouped.get(key).details.add(f.detail);
	}
	const findings = [...grouped.values()].map((f) => ({
		rule: f.rule,
		route: f.route,
		section: f.where,
		container: f.container,
		a: f.a,
		b: f.b,
		widths: f.widths,
		detail: [...f.details].join(', ')
	}));

	if (asJson) {
		console.log(JSON.stringify(findings, null, 2));
	} else {
		console.log(
			`Checked ${pages.length} route(s) at ${widths.length} width(s): ${widths.join(', ')}\n`
		);
		if (findings.length === 0) {
			console.log('PASS  No collisions, no overflow, no horizontal scroll.');
		} else {
			for (const f of findings) {
				console.log(`FAIL  [${f.rule}] ${f.route} ${f.section} @ ${f.widths.join(', ')}px`);
				console.log(`      in ${f.container}`);
				if (f.a) console.log(`      ${f.a}`);
				if (f.b) console.log(`      ${f.b}`);
				console.log(`      ${f.detail}\n`);
			}
			console.log(`${findings.length} layout finding(s).`);
		}
	}

	process.exit(findings.length === 0 ? 0 : 1);
}

main().catch((error) => {
	console.error(error.message);
	process.exit(2);
});

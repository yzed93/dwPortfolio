/*
	Regression checks for the design decisions behind this site.

	The suite is split in two on purpose. "Durable" rules survived the redesign
	because they encode judgements that are independent of any one composition
	(palette, dash characters, radius discipline, accessibility, assets). The
	"redesign" rules encode the current direction: a recruiter-facing dossier
	that leads with platform scale and resolves the career change visually.

	Rewrite the second group when the composition changes on purpose. Never
	delete a check to make a build pass.
*/
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { extname } from 'node:path';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const exists = (path) => existsSync(new URL(`../${path}`, import.meta.url));
const sourceRoot = new URL('../src/', import.meta.url);
const sourceText = readdirSync(sourceRoot, { recursive: true })
	.filter((path) => ['.svelte', '.ts', '.css'].includes(extname(path)))
	.map((path) => readFileSync(new URL(path, sourceRoot), 'utf8'))
	.join('\n');

const files = {
	hero: read('src/lib/components/Hero.svelte'),
	mobileHero: read('src/lib/components/MobileHeroParticles.svelte'),
	platforms: read('src/lib/components/Platforms.svelte'),
	approach: read('src/lib/components/Approach.svelte'),
	careerAxis: read('src/lib/components/CareerAxis.svelte'),
	careerField: read('src/lib/components/CareerField.svelte'),
	sideProject: read('src/lib/components/SideProject.svelte'),
	contact: read('src/lib/components/Contact.svelte'),
	cvButton: read('src/lib/components/CvButton.svelte'),
	nav: read('src/lib/components/Nav.svelte'),
	site: read('src/lib/components/Site.svelte'),
	layout: read('src/routes/+layout.svelte'),
	caseStudy: read('src/routes/projekte/[slug]/+page.svelte'),
	caseStudyLoad: read('src/routes/projekte/[slug]/+page.ts'),
	content: read('src/lib/content.ts'),
	styles: read('src/app.css'),
	pkg: read('package.json')
};

const checks = [
	// ---------------------------------------------------------------- durable
	['Hero fills one stable dynamic viewport', files.hero.includes('min-h-[100dvh]')],
	['Hero top padding stays within 6rem', !/md:pt-(2[5-9]|[3-9]\d)/.test(files.hero)],
	[
		'Hero keeps a lightweight mobile visual',
		files.mobileHero.includes('/images/portfolio-mobile-hero.jpg') &&
			files.hero.includes('MobileHeroParticles') &&
			files.mobileHero.includes('requestAnimationFrame') &&
			files.mobileHero.includes('prefers-reduced-motion: reduce') &&
			files.hero.includes('mobile-hero-art') &&
			files.hero.includes("matchMedia('(min-width: 768px)')")
	],
	[
		'Mobile hero separates the visual stage from readable copy',
		files.hero.includes('mobile-hero-panel') &&
			files.hero.includes('clip-path: polygon(0 3.5rem') &&
			files.hero.includes('align-items: flex-start')
	],
	[
		'Ink Blue Bordeaux palette stays locked',
		files.styles.includes('--color-paper: #070a14') &&
			files.styles.includes('--color-paper-raised: #111626') &&
			files.styles.includes('--color-signal: #7a143a') &&
			files.styles.includes('--color-accent-on-paper: #db3e70') &&
			files.styles.includes('--color-hero-wine-light: #bd2052') &&
			files.styles.includes('--color-hero-blue: #0b2450')
	],
	['Structural surfaces share the restrained radius', !/rounded-(?:3xl|2xl)/.test(sourceText)],
	['Section rhythm avoids oversized padding', !/(?:md:)?py-32/.test(sourceText)],
	['No pure black component shadow remains', !sourceText.includes('shadow-black')],
	['Visible source contains no long dash characters', !/[—–]/.test(sourceText)],
	['Visible content uses no middle-dot separators', !/·/.test(files.content)],
	['Skip link is present', files.layout.includes('Zum Inhalt springen')],
	[
		'Social metadata includes canonical URL and image',
		files.site.includes('og:url') && files.site.includes('og:image')
	],
	[
		'Site does not invent a standalone favicon',
		!files.layout.includes('rel="icon"') && !exists('src/lib/assets/favicon.svg')
	],
	['Footer stays removed', !files.site.includes('<Footer')],
	['Client copy is employer-neutral', !/Provectus-Kunden|Provectus clients/.test(files.content)],
	[
		'Availability copy is absent from all visible content',
		!/open to new projects|offen für neue projekte|verfügbar für neue projekte/i.test(sourceText)
	],
	[
		'Required image assets exist',
		exists('static/images/tabiyume-planner.jpg') &&
			exists('static/images/portfolio-og.jpg') &&
			exists('static/images/portfolio-mobile-hero.jpg')
	],

	// --------------------------------------------------------------- redesign
	[
		'Typography is the Geist pair, the studio faces are gone',
		files.styles.includes("'Geist Variable'") &&
			files.styles.includes("'Geist Mono Variable'") &&
			!sourceText.includes('bricolage') &&
			!sourceText.includes('space-grotesk') &&
			files.pkg.includes('@fontsource-variable/geist')
	],
	[
		'The CV ships as an asset and is reachable from hero and contact',
		exists('static/docs/Lebenslauf_Dennis_Wiredu.pdf') &&
			files.content.includes("CV_HREF = '/docs/Lebenslauf_Dennis_Wiredu.pdf'") &&
			files.hero.includes('content.cv.href') &&
			files.contact.includes('content.cv.href') &&
			// The download attribute lives in the shared button component now.
			files.cvButton.includes('download')
	],
	[
		'The facts bar is gone and the scale figure is only claimed where it is shown',
		!files.content.includes('stats:') &&
			!sourceText.includes('countUp') &&
			files.hero.includes('content.hero.positioning') &&
			// The platform list right below carries 15.000+, 7.000 and 700 in its
			// own column. Repeating the largest of them in the hero states a number
			// before any evidence for it, which is the difference between saying
			// what you do and boasting about it.
			!/positioning:[^\n]*15[.,]000/.test(files.content) &&
			/scaleValue: '15\.000\+'/.test(files.content)
	],
	[
		'Platforms lead the page, ordered by scale, linking to their own pages',
		files.site.indexOf('<Platforms') < files.site.indexOf('<Approach') &&
			files.platforms.includes('href="/projekte/{platform.slug}"') &&
			files.platforms.includes('figure') &&
			// Largest environment first: the automotive platform heads the list.
			files.content.indexOf("slug: 'automotive-muenchen'") <
				files.content.indexOf("slug: 'bundesbehoerde'")
	],
	[
		'Case studies prerender from a slug list',
		files.caseStudyLoad.includes('export const entries') &&
			files.caseStudyLoad.includes('platformSlugs') &&
			['context', 'task', 'work', 'outcome'].every((field) =>
				files.caseStudy.includes(`platform.${field}`)
			)
	],
	[
		'Skill dump is replaced by principles that still carry the product names',
		!exists('src/lib/components/Skills.svelte') &&
			files.approach.includes('item.tools') &&
			/Citrix Virtual Apps & Desktops/.test(files.content) &&
			/PowerShell/.test(files.content) &&
			/Azure Virtual Desktop/.test(files.content)
	],
	[
		'The map is gone and the career reads as one axis',
		!exists('src/lib/components/CareerMap.svelte') &&
			!sourceText.includes('maplibre') &&
			!files.pkg.includes('maplibre-gl') &&
			files.careerAxis.includes('is-dashed') &&
			files.careerAxis.includes('is-solid')
	],
	[
		'The career field resolves scatter into lattice across the section',
		files.careerField.includes('readTarget') &&
			files.careerField.includes('MAX_DELAY') &&
			// The stagger budget has to close, or the last columns never arrive.
			files.careerField.includes('const SETTLE = 1 - MAX_DELAY') &&
			files.careerField.includes('IntersectionObserver') &&
			// Progress is read inside the frame loop, never from a scroll listener.
			!files.careerField.includes("addEventListener('scroll'")
	],
	[
		'The field follows the scroll on a spring, not one to one',
		files.careerField.includes('const STIFFNESS') &&
			files.careerField.includes('const DAMPING') &&
			// Fixed-step integration, so the motion does not change with frame rate.
			files.careerField.includes('const STEP = 1 / 120') &&
			files.careerField.includes('while (accumulator >= STEP)') &&
			// A backgrounded tab hands back a huge delta on return; capping it stops
			// the spring being launched across the whole field in one frame.
			files.careerField.includes('Math.min((now - lastTime) / 1000, 0.05)')
	],
	[
		'The field measures geometry once, not inside every frame',
		files.careerField.includes('function measureSection') &&
			// getBoundingClientRect in the frame loop forces a layout flush per
			// frame, which is what made the field stutter in the first place.
			!/function readTarget[\s\S]{0,400}getBoundingClientRect/.test(files.careerField)
	],
	[
		'Points are drawn in bands rather than one context state change each',
		files.careerField.includes('const BANDS') &&
			// Every point collapses into at most one fill per band.
			/for \(let b = 0; b < BANDS; b\+\+\)/.test(files.careerField)
	],
	[
		'The field is a backdrop, not a second column',
		// As a column it dropped below the axis under 1024px. Behind the
		// stations it holds at every width and the reading order never moves.
		files.careerAxis.includes('career-field') &&
			files.careerAxis.includes('absolute inset-y-0 right-0') &&
			!files.careerAxis.includes('lg:grid-cols-') &&
			!files.careerAxis.includes('order-first') &&
			// Masked off the left, so no point ever sits behind a line start.
			files.careerAxis.includes('mask-image: linear-gradient(to right')
	],
	[
		'The field grid is derived from its box, so cells stay square',
		files.careerField.includes('const CELL') &&
			files.careerField.includes('const MAX_POINTS') &&
			// A fixed row count would stretch cells into stripes now that the
			// field spans a whole section rather than a fixed panel.
			!/const (COLS|ROWS) =/.test(files.careerField)
	],
	[
		'No closing reflection on the career axis',
		!files.content.includes('closing:') && !files.careerAxis.includes('career.closing')
	],
	[
		'The field paints outside the frame loop as well',
		files.careerField.includes('function paintOnce') &&
			files.careerField.includes('prefers-reduced-motion')
	],
	[
		'Section headings carry two tiers instead of one',
		files.styles.includes('.section-head {') &&
			files.styles.includes('.section-head-quiet {') &&
			[files.platforms, files.careerAxis, files.contact].every((file) =>
				file.includes('class="section-head ')
			) &&
			[files.approach, files.contact].every((file) => file.includes('section-head-quiet')) &&
			!/text-5xl font-extrabold/.test(sourceText)
	],
	[
		'List markers are hairlines, not dots',
		files.styles.includes('.rule-item {') &&
			[files.platforms, files.careerAxis, files.caseStudy].some((file) =>
				file.includes('rule-item')
			) &&
			!/h-1 w-1 shrink-0 rounded-full/.test(sourceText)
	],
	[
		'Figures are set in mono so the sizes read as a column',
		files.styles.includes('.figure {') &&
			files.styles.includes('font-variant-numeric: tabular-nums') &&
			files.platforms.includes('figure') &&
			files.caseStudy.includes('figure')
	],
	[
		'Only the hero role uses an uppercase micro-label',
		(sourceText.match(/uppercase/g) ?? []).length === 1 && files.hero.includes('uppercase')
	],
	[
		'Credentials sit beside the contact details, not in a section of their own',
		!exists('src/lib/components/Certifications.svelte') &&
			files.contact.includes('content.credentials.items') &&
			!files.site.includes('<Certifications')
	],
	[
		'Nav travels home from a case study instead of dangling on a sub-path',
		files.nav.includes('isOverview') && files.nav.includes('prefix')
	],
	// ---------------------------------------------------------------- delight
	// Three moments earn a response: the download, the address, the row the
	// reader is aiming at. Each states only what is true and none of them may
	// move the layout while being used.
	[
		'The CV download confirms without claiming completion',
		// Both labels stay in the layout, so the control cannot resize mid-press.
		files.cvButton.includes("grid-template-areas: 'stack'") &&
			files.cvButton.includes('aria-label={label}') &&
			files.cvButton.includes('role="status"') &&
			// The click proves the download started. Nothing on this page can
			// observe that it finished, so no label may say so. Checked against the
			// shipped strings rather than the source, which discusses the rule.
			/started: 'Download gestartet'/.test(files.content) &&
			/started: 'Download started'/.test(files.content) &&
			!/(abgeschlossen|fertig|downloaded|saved)'/i.test(files.content)
	],
	[
		'Copying the address recovers honestly when the clipboard is refused',
		files.contact.includes('navigator.clipboard.writeText') &&
			// A refused clipboard must not report success; the address gets
			// selected instead so the reader's own shortcut works.
			files.contact.includes('selectNodeContents') &&
			files.contact.includes("announce('selected')") &&
			// The button's accessible name never becomes a claim about the past.
			files.contact.includes('aria-label={content.contact.copy}')
	],
	[
		'Row feedback is direction aware and gated to real pointers',
		files.platforms.includes('function anchorSweep') &&
			files.platforms.includes('--sweep-origin') &&
			files.platforms.includes('@media (hover: hover) and (pointer: fine)') &&
			// Keyboard focus has no entry side, so it draws from the reading edge.
			files.platforms.includes('.platform-row:focus-visible::after')
	],
	[
		'Delight motion stays inside the motion budget and folds under reduced motion',
		files.styles.includes('--ease-out-strong') &&
			// Nothing in the three details runs longer than the 300ms UI ceiling.
			![
				files.cvButton,
				files.contact,
				files.platforms
			].some((file) => /transition:[^;]*?(\d{3,})ms/.test(file) && /[4-9]\d\dms|\d{4}ms/.test(file)) &&
			[read('src/lib/components/CvButton.svelte'), files.contact, files.platforms].every((file) =>
				file.includes('prefers-reduced-motion: reduce')
			)
	],

	[
		'Contact renders the requested email and the CV, nothing else',
		files.contact.includes('mailto:{content.contact.email}') &&
			files.content.includes("email: 'dennis@wiredu.cloud'") &&
			!files.contact.includes('<form')
	]
];

/*
	The CV is a download rather than a page asset, so its weight never blocks a
	render, but it does travel in full to every reader who clicks it. This was a
	soft note while the shipped export was 8.6 MB; now that a 0.4 MB version
	exists the budget is a real one, because a silent regression back to the
	unoptimised export is the likely failure and nothing else would catch it.
*/
const cvPath = new URL('../static/docs/Lebenslauf_Dennis_Wiredu.pdf', import.meta.url);
const cvMb = existsSync(cvPath) ? statSync(cvPath).size / 1e6 : Infinity;
checks.push(['CV download stays within its weight budget', cvMb <= 2]);

let failed = 0;
for (const [label, passed] of checks) {
	console.log(`${passed ? 'PASS' : 'FAIL'}  ${label}`);
	if (!passed) failed += 1;
}

if (Number.isFinite(cvMb)) {
	console.log(`\nCV: ${cvMb.toFixed(2)} MB of a 2 MB budget.`);
}

if (failed > 0) {
	console.error(`\n${failed} taste check${failed === 1 ? '' : 's'} failed.`);
	process.exit(1);
}

console.log(`\nAll ${checks.length} taste checks passed.`);

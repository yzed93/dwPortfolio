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
	architecturePlate: read('src/lib/components/ArchitecturePlate.svelte'),
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
	[
		'Hero uses an editorial split instead of a centred stage',
		files.hero.includes('lg:grid-cols-[1.08fr_0.92fr]') &&
			files.hero.includes('<ArchitecturePlate />') &&
			files.hero.includes('font-[family-name:var(--font-display)]')
	],
	['Hero leaves breathing room below the fixed navigation', files.hero.includes('md:pt-36')],
	[
		'Hero replaces the generative particle object with a lightweight topology',
		// The two particle components and the three.js dependency they carried
		// are gone rather than merely unused, so this asserts their absence from
		// the tree instead of their absence from one import list.
		!exists('src/lib/components/Hero3D.svelte') &&
			!exists('src/lib/components/MobileHeroParticles.svelte') &&
			!files.pkg.includes('"three"') &&
			files.architecturePlate.includes('system-flow') &&
			files.architecturePlate.includes('automation-band')
	],
	[
		'Recruiter proof is visible in the first viewport',
		files.architecturePlate.includes('Citrix CVAD') &&
			files.architecturePlate.includes('PowerShell-Orchestrierung') &&
			files.hero.includes('Citrix / Azure / PowerShell / Operations')
	],
	[
		'Warm paper, graphite and cobalt palette stays locked',
		files.styles.includes('--color-paper: #f3f0e8') &&
			files.styles.includes('--color-paper-raised: #e8e3d8') &&
			files.styles.includes('--color-ink: #191b19') &&
			files.styles.includes('--color-signal: #3157c8') &&
			files.styles.includes('--color-accent-on-paper: #3157c8')
	],
	[
		'No orphaned components and no dependency without an import',
		/*
			A redesign that replaces a component usually leaves the old one behind,
			still compiling and still costing a reader nothing but still there to
			confuse the next person. Same for the package it pulled in. This is the
			check that would have caught three.js sitting in the manifest with the
			only file that imported it no longer rendered anywhere.
		*/
		(() => {
			const componentDir = new URL('../src/lib/components/', import.meta.url);
			const orphans = readdirSync(componentDir)
				.filter((name) => name.endsWith('.svelte') && name !== 'Site.svelte')
				.filter((name) => {
					const base = name.replace('.svelte', '');
					// Site.svelte is the composition root, so it is referenced by a
					// route rather than by another component.
					return !new RegExp(`\\b${base}\\b`).test(
						sourceText.replaceAll(readFileSync(new URL(name, componentDir), 'utf8'), '')
					);
				});
			const deps = Object.keys(JSON.parse(files.pkg).dependencies ?? {});
			const unused = deps.filter(
				(dep) => !sourceText.includes(dep) && !files.styles.includes(dep)
			);
			if (orphans.length) console.log(`      orphaned: ${orphans.join(', ')}`);
			if (unused.length) console.log(`      unused deps: ${unused.join(', ')}`);
			return orphans.length === 0 && unused.length === 0;
		})()
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
		'Typography pairs Newsreader with the Geist text and mono faces',
		files.styles.includes("'Newsreader Variable'") &&
		files.styles.includes("'Geist Variable'") &&
			files.styles.includes("'Geist Mono Variable'") &&
			!sourceText.includes('bricolage') &&
			!sourceText.includes('space-grotesk') &&
			files.pkg.includes('@fontsource-variable/geist') &&
			files.pkg.includes('@fontsource-variable/newsreader')
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
		'The hero diagram explains the platform work instead of repeating project scale',
		!files.content.includes('stats:') &&
			!sourceText.includes('countUp') &&
			files.hero.includes('content.hero.positioning') &&
			!files.architecturePlate.includes('15.000+') &&
			['NetScaler', 'Citrix CVAD', 'PowerShell', 'Monitoring', 'SOPs'].every((term) =>
				files.architecturePlate.includes(term)
			) &&
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
	// ---------------------------------------------------------------- anti-AI
	// Mechanical checks for the signatures that mark a page as machine-made.
	// These are cheap to run and cheap to violate by accident, which is exactly
	// the combination that makes them worth pinning.
	['No transition: all, properties are named', !/transition:\s*all|transition-all/.test(sourceText)],
	['No gradient text', !/bg-clip-text|text-transparent/.test(sourceText)],
	[
		'No neon or outer glow',
		/*
			What makes a glow is blur with no offset. A zero-blur box-shadow at an
			offset of zero is a ring, which is a legitimate way to mark state, so
			the blur radius is what this looks at rather than the leading zeros.
		*/
		!/box-shadow:\s*0 0 (?!0)/.test(sourceText) &&
			!/shadow-\[0_0_(?!0)/.test(sourceText) &&
			!/drop-shadow-\[0_0_(?!0)/.test(sourceText)
	],
	['No custom cursor', !/cursor:\s*url|cursor-\[/.test(sourceText)],
	['Viewport height is dynamic, never h-screen', !/h-screen/.test(sourceText)],
	['Nothing enters from scale(0)', !/scale\(0\)|scale-0\b/.test(sourceText)],
	[
		'No pure black as a visible colour',
		// `black` is legitimate inside a mask, where it is an alpha value rather
		// than a colour anyone sees. Everywhere else it flattens the palette.
		!/#000000|#000\b|rgb\(0,\s*0,\s*0\)/.test(sourceText) &&
			sourceText
				.split('\n')
				.filter((line) => /\bblack\b/.test(line))
				.every((line) => /mask-image/.test(line))
	],
	[
		'No three-equal-column feature row',
		// The most worn layout on the web. The one remaining grid-cols-3 is the
		// case study metadata list, which is three facts and not three cards.
		!files.approach.includes('grid-cols-3') &&
			files.platforms.includes('grid-cols-[9rem_1fr_auto]') &&
			/dl class="[^"]*sm:grid-cols-3/.test(files.caseStudy)
	],
	[
		'Copy carries no marketing filler',
		!/elevate|seamless|unleash|next-gen|revolutioni|cutting-edge|state-of-the-art|passionate|nahtlos|leidenschaft/i.test(
			files.content
		)
	],
	[
		'Every section uses a different layout family',
		// Six sections, six grid signatures. Two sections sharing one is the
		// point at which a page starts reading as a template.
		new Set(
			[files.hero, files.platforms, files.approach, files.sideProject, files.contact]
				.map((file) => (file.match(/grid-cols-\[[^\]]*\]/g) ?? []).sort().join('|'))
				.filter(Boolean)
		).size >= 3
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
		'The career axis draws itself as stations arrive',
		// The dashed to solid change at the second-chance Abitur becomes an event
		// the reader watches, rather than a difference they may never register.
		files.careerAxis.includes('transform: scaleY(0)') &&
			files.careerAxis.includes('.station:global(.is-visible) .axis-line') &&
			// Reduced motion keeps the rule, drops only the drawing.
			/prefers-reduced-motion[\s\S]*transform: scaleY\(1\)/.test(files.careerAxis)
	],
	[
		'The current role reads as open ended',
		// No end date, so no end to its rule: it fades instead of stopping, and
		// the node is ringed. Static, because this is passed on every scroll.
		files.careerAxis.includes('is-open-ended') &&
			/\.station\.is-open-ended \.axis-line[\s\S]{0,220}mask-image/.test(files.careerAxis) &&
			!/is-open-ended[\s\S]{0,400}animation:/.test(files.careerAxis)
	],
	[
		'Station detail is available on request, natively',
		// The bullets existed in the content and were rendered for one station
		// out of eight. Native details, so keyboard, screen readers and a
		// no-JavaScript load all get it without anything being wired up.
		files.careerAxis.includes('<details') &&
			files.careerAxis.includes('station.bullets.length > 1') &&
			files.careerAxis.includes('open={isCurrent}') &&
			files.content.includes("detail: 'Aufgaben'") &&
			// Touch target on the toggle.
			files.careerAxis.includes('min-h-11')
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
		'Five restrained delight details are present and motion-safe',
		files.architecturePlate.includes('topology-node-in') &&
			files.hero.includes('hero-contact-arrow') &&
			files.nav.includes('mobile-menu-panel') &&
			files.approach.includes('approach-row') &&
			files.contact.includes('.copy-button::after') &&
			[files.architecturePlate, files.hero, files.nav, files.approach, files.contact].every(
				(file) => file.includes('prefers-reduced-motion')
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

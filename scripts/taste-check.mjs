import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { extname } from 'node:path';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const sourceRoot = new URL('../src/', import.meta.url);
const sourceText = readdirSync(sourceRoot, { recursive: true })
	.filter((path) => ['.svelte', '.ts', '.css'].includes(extname(path)))
	.map((path) => readFileSync(new URL(path, sourceRoot), 'utf8'))
	.join('\n');
const files = {
	hero: read('src/lib/components/Hero.svelte'),
	projects: read('src/lib/components/ClientProjects.svelte'),
	project: read('src/lib/components/Project.svelte'),
	mobileHero: read('src/lib/components/MobileHeroParticles.svelte'),
	skills: read('src/lib/components/Skills.svelte'),
	contact: read('src/lib/components/Contact.svelte'),
	career: read('src/lib/components/CareerMap.svelte'),
	site: read('src/lib/components/Site.svelte'),
	content: read('src/lib/content.ts'),
	styles: read('src/app.css')
};

const checks = [
	['Hero fills one stable dynamic viewport', files.hero.includes('min-h-[100dvh]')],
	[
		'Hero keeps a lightweight mobile visual',
		files.mobileHero.includes('/images/portfolio-mobile-hero.jpg') &&
			files.hero.includes('MobileHeroParticles') &&
			files.mobileHero.includes('requestAnimationFrame') &&
			files.mobileHero.includes('prefers-reduced-motion: reduce') &&
			files.hero.includes('mobile-hero-art') &&
			files.hero.includes('md:hidden') &&
			files.hero.includes("matchMedia('(min-width: 768px)')")
	],
	[
		'Mobile hero animates individual points without object drift',
		files.mobileHero.includes('const baseX') &&
			files.mobileHero.includes('particle.phase') &&
			files.mobileHero.includes('triangle itself does not drift') &&
			!files.hero.includes('mobile-object-drift')
	],
	[
		'Mobile hero separates the visual stage from readable copy',
		files.hero.includes('mobile-hero-panel') &&
			files.hero.includes('clip-path: polygon(0 3.5rem') &&
			files.hero.includes('align-items: flex-start') &&
			files.hero.includes('hero-actions')
	],
	['Hero top padding stays within 6rem', !/md:pt-(2[5-9]|[3-9]\d)/.test(files.hero)],
	['Hero contains no redundant greeting', !files.hero.includes('content.hero.greeting')],
	[
		'Project cards share one equal grid',
		files.projects.includes('md:grid-cols-2') &&
			files.projects.includes('auto-rows-fr') &&
			!files.projects.includes('lg:col-span-7')
	],
	[
		'Skills use a line-based competency matrix',
		files.skills.includes('lg:grid-cols-[0.38fr_1fr]') &&
			files.skills.includes('border-l border-accent-on-paper/40') &&
			!files.skills.includes('cursor-default')
	],
	[
		'Facet vocabulary is centralized',
		files.styles.includes('.facet-rise') &&
			files.styles.includes('.facet-fall') &&
			files.styles.includes('.facet-card') &&
			!sourceText.includes('diagonal-block')
	],
	[
		'Header uses a typographic wordmark and opens over the hero',
		files.site.includes('<Nav') &&
			read('src/lib/components/Nav.svelte').includes('Dennis <span') &&
			!read('src/lib/components/Nav.svelte').includes('aria-hidden="true">DW') &&
			read('src/lib/components/Nav.svelte').includes('background: transparent') &&
			read('src/lib/components/Nav.svelte').includes('site-header.is-scrolled')
	],
	[
		'Site does not invent a standalone favicon',
		!read('src/routes/+layout.svelte').includes('rel="icon"') &&
			!existsSync(new URL('../src/lib/assets/favicon.svg', import.meta.url))
	],
	[
		'Career is one joined workspace',
		files.career.includes('grid overflow-hidden border border-on-signal/20 bg-card') &&
			!files.career.includes('relative -rotate-1')
	],
	[
		'Credentials avoid paper-card metaphors',
		!read('src/lib/components/Certifications.svelte').includes('border-dashed') &&
			!read('src/lib/components/Certifications.svelte').includes('rotations')
	],
	[
		'Delight details remain motivated and reduced-motion safe',
		files.project.includes('case-study-visual') &&
			files.skills.includes('skill-row') &&
			[files.project, files.skills].every((file) =>
				file.includes('prefers-reduced-motion: reduce')
			)
	],
	[
		'Structural surfaces share the restrained radius',
		!/(?:rounded-3xl|rounded-2xl|rounded-\[1\.35rem\])/.test(sourceText)
	],
	[
		'Controls use corners instead of pill shapes',
		![files.hero, files.project, files.skills, files.contact].some((file) =>
			file.includes('rounded-full')
		) &&
			!files.projects.includes('class="rounded-full border') &&
			!files.career.includes('class="rounded-full border')
	],
	['Section rhythm avoids oversized padding', !/(?:md:)?py-32/.test(sourceText)],
	['Page background carries the restrained ambient palette', files.styles.includes('var(--color-hero-blue-light)')],
	[
		'Ink Blue Bordeaux palette stays locked',
		files.styles.includes('--color-paper: #070a14') &&
			files.styles.includes('--color-paper-raised: #111626') &&
			files.styles.includes('--color-signal: #7a143a') &&
			files.styles.includes('--color-accent-on-paper: #db3e70') &&
			files.styles.includes('--color-hero-wine-light: #bd2052') &&
			files.styles.includes('--color-hero-blue: #0b2450') &&
			!/#171012|#22181a|#d98a9a|#c45678|#d06b8a/.test(files.styles)
	],
	[
		'Bold pass reinforces bordeaux in the header and hero',
		read('src/lib/components/Nav.svelte').includes('wordmark-accent') &&
			files.hero.includes('bg-signal') &&
			files.hero.includes('background: var(--color-hero-wine-light)') &&
			files.mobileHero.includes('preventing pale salmon highlights')
	],
	['Footer stays removed', !files.site.includes('<Footer') && !files.content.includes('footer:')],
	['Tabiyume uses a real local screenshot', files.project.includes('/images/tabiyume-planner.jpg')],
	[
		'Contact renders only the requested email below its heading',
		files.contact.includes('mailto:{content.contact.email}') &&
			files.content.includes("email: 'dennis@wiredu.cloud'") &&
			!files.contact.includes('content.contact.description') &&
			!files.contact.includes('<button')
	],
	[
		'Mobile career uses native swipe cards',
		files.career.includes('snap-x snap-mandatory') &&
			files.career.includes('md:hidden') &&
			files.career.includes('hidden md:block')
	],
	[
		'MapLibre is desktop-only and intersection-lazy',
		files.career.includes("matchMedia('(min-width: 768px)')") &&
			files.career.includes("rootMargin: '320px 0px'")
	],
	['Map has a skeleton loading state', files.career.includes('map-skeleton')],
	['No pure black component shadow remains', !Object.values(files).some((file) => file.includes('shadow-black'))],
	['Social metadata includes canonical URL and image', files.site.includes('og:url') && files.site.includes('og:image')],
	['Skip link is present', files.site.includes('Zum Inhalt springen')],
	['Client copy is employer-neutral', !/Provectus-Kunden|Provectus clients/.test(files.content)],
	[
		'Availability copy is absent from all visible content',
		!/open to new projects|offen für neue projekte|verfügbar für neue projekte/i.test(sourceText)
	],
	['Visible source contains no long dash characters', !/[—–]/.test(sourceText)],
	[
		'Required image assets exist',
			existsSync(new URL('../static/images/tabiyume-planner.jpg', import.meta.url)) &&
			existsSync(new URL('../static/images/portfolio-og.jpg', import.meta.url)) &&
			existsSync(new URL('../static/images/portfolio-mobile-hero.jpg', import.meta.url))
	]
];

let failed = 0;
for (const [label, passed] of checks) {
	console.log(`${passed ? 'PASS' : 'FAIL'}  ${label}`);
	if (!passed) failed += 1;
}

if (failed > 0) {
	console.error(`\n${failed} taste check${failed === 1 ? '' : 's'} failed.`);
	process.exit(1);
}

console.log(`\nAll ${checks.length} taste checks passed.`);

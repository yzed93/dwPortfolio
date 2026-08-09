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
	skills: read('src/lib/components/Skills.svelte'),
	contact: read('src/lib/components/Contact.svelte'),
	career: read('src/lib/components/CareerMap.svelte'),
	site: read('src/lib/components/Site.svelte'),
	content: read('src/lib/content.ts'),
	styles: read('src/app.css')
};

const checks = [
	['Hero fills one stable dynamic viewport', files.hero.includes('min-h-[100dvh]')],
	['Hero top padding stays within 6rem', !/md:pt-(2[5-9]|[3-9]\d)/.test(files.hero)],
	['Hero contains no redundant greeting', !files.hero.includes('content.hero.greeting')],
	[
		'Project cards share one equal grid',
		files.projects.includes('md:grid-cols-2') &&
			files.projects.includes('auto-rows-fr') &&
			!files.projects.includes('lg:col-span-7')
	],
	['Skills use the page surface tokens', files.skills.includes('bg-paper-raised') && !files.skills.includes('bg-card')],
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
			files.styles.includes('--color-signal: #701a38') &&
			files.styles.includes('--color-hero-blue: #0b2450') &&
			!/#171012|#22181a|#d98a9a/.test(files.styles)
	],
	['Footer stays removed', !files.site.includes('<Footer') && !files.content.includes('footer:')],
	['Tabiyume uses a real local screenshot', files.project.includes('/images/tabiyume-planner.jpg')],
	['Contact action describes copy behavior', /E-Mail kopieren/.test(files.content) && /Copy email/.test(files.content)],
	['MapLibre is intersection-lazy', files.career.includes("rootMargin: '320px 0px'")],
	['Map has a skeleton loading state', files.career.includes('map-skeleton')],
	['No pure black component shadow remains', !Object.values(files).some((file) => file.includes('shadow-black'))],
	['Social metadata includes canonical URL and image', files.site.includes('og:url') && files.site.includes('og:image')],
	['Skip link is present', files.site.includes('Zum Inhalt springen')],
	['Client copy is employer-neutral', !/Provectus-Kunden|Provectus clients/.test(files.content)],
	['Availability badge copy is absent', !/open to new projects|verfügbar für neue Projekte/.test(files.hero)],
	['Visible source contains no long dash characters', !/[—–]/.test(sourceText)],
	[
		'Required image assets exist',
		existsSync(new URL('../static/images/tabiyume-planner.jpg', import.meta.url)) &&
			existsSync(new URL('../static/images/portfolio-og.jpg', import.meta.url))
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

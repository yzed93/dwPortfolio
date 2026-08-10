<script lang="ts">
	import { langState } from '$lib/state/lang.svelte';
	import { contentFor, platformFor } from '$lib/content';
	import { reveal } from '$lib/actions/reveal';
	import ArrowLeft from 'phosphor-svelte/lib/ArrowLeft';
	import ArrowRight from 'phosphor-svelte/lib/ArrowRight';

	let { data } = $props();

	let content = $derived(contentFor(langState.current));
	// The slug is validated in the load function, so a miss here is impossible;
	// the fallback only exists to keep the type honest.
	let platform = $derived(platformFor(langState.current, data.slug) ?? content.platforms.items[0]);
	let labels = $derived(content.caseStudy);

	let siblings = $derived(content.platforms.items.filter((item) => item.slug !== platform.slug));
	let next = $derived(
		content.platforms.items[
			(content.platforms.items.findIndex((item) => item.slug === platform.slug) + 1) %
				content.platforms.items.length
		]
	);

	const SITE_URL = 'https://dennis.wiredu.cloud';
	let canonical = $derived(`${SITE_URL}/projekte/${platform.slug}`);
	let title = $derived(`${platform.name} - ${content.hero.name}`);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={platform.summary} />
	<link rel="canonical" href={canonical} />
	<meta property="og:type" content="article" />
	<meta property="og:site_name" content="Dennis Wiredu" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={platform.summary} />
	<meta property="og:locale" content={langState.current === 'de' ? 'de_DE' : 'en_US'} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content="{SITE_URL}/images/portfolio-og.jpg" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={platform.summary} />
</svelte:head>

<article class="mx-auto max-w-6xl px-4 pt-28 pb-16 sm:px-6 md:pt-32 md:pb-24">
	<a
		href="/#platforms"
		class="meta inline-flex min-h-11 items-center gap-2 text-ink-soft transition-colors hover:text-accent-on-paper"
	>
		<ArrowLeft size={14} weight="bold" />
		{labels.back}
	</a>

	<header class="mt-8 border-b border-ink/15 pb-10">
		<h1
			class="font-[family-name:var(--font-display)] text-[clamp(2.25rem,4.6vw,3.5rem)] leading-[1.02] font-bold tracking-[-0.035em] text-ink"
		>
			{platform.name}
		</h1>

		<!-- The three facts a reader checks before deciding to read on. -->
		<dl class="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-3">
			<div>
				<dt class="meta text-ink-faint">{labels.scale}</dt>
				<dd class="figure mt-1.5 text-2xl text-accent-on-paper">
					{platform.scaleValue}
					<span class="text-sm text-ink-soft">{platform.scaleLabel}</span>
				</dd>
			</div>
			<div>
				<dt class="meta text-ink-faint">{labels.period}</dt>
				<dd class="figure mt-1.5 text-lg text-ink">{platform.period}</dd>
			</div>
			<div>
				<dt class="meta text-ink-faint">{labels.sector}</dt>
				<dd class="mt-1.5 text-lg text-ink">{platform.sector}</dd>
			</div>
		</dl>
	</header>

	<div class="mt-12 grid gap-12 lg:grid-cols-[1fr_0.5fr] lg:gap-16">
		<div class="space-y-10">
			<section use:reveal>
				<h2 class="section-head-quiet text-ink">{labels.context}</h2>
				<p class="mt-4 max-w-[64ch] text-lg leading-relaxed text-ink-soft">{platform.context}</p>
			</section>

			<section use:reveal>
				<h2 class="section-head-quiet text-ink">{labels.task}</h2>
				<p class="mt-4 max-w-[64ch] text-lg leading-relaxed text-ink-soft">{platform.task}</p>
			</section>

			<section use:reveal>
				<h2 class="section-head-quiet text-ink">{labels.work}</h2>
				<ul class="mt-4 space-y-3">
					{#each platform.work as item (item)}
						<li class="rule-item max-w-[64ch] leading-relaxed text-ink-soft">{item}</li>
					{/each}
				</ul>
			</section>

			<section use:reveal class="border-l-2 border-accent-on-paper pl-6">
				<h2 class="section-head-quiet text-ink">{labels.outcome}</h2>
				<p class="mt-4 max-w-[64ch] text-lg leading-relaxed text-ink">{platform.outcome}</p>
			</section>
		</div>

		<aside class="lg:sticky lg:top-28 lg:self-start">
			<h2 class="meta text-ink-faint">{labels.stack}</h2>
			<ul class="mt-4 border-t border-ink/15">
				{#each platform.stack as tech (tech)}
					<li class="border-b border-ink/12 py-3 text-sm text-ink-soft">{tech}</li>
				{/each}
			</ul>
		</aside>
	</div>

	<!-- Somewhere to go next, so the page is not a dead end. -->
	<nav class="mt-16 border-t border-ink/15 pt-8" aria-label={content.platforms.title}>
		<a
			href="/projekte/{next.slug}"
			class="next-platform group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 py-4 transition-colors"
		>
			<span>
				<span class="meta block text-ink-faint">{content.platforms.title}</span>
				<span
					class="mt-1 block font-[family-name:var(--font-display)] text-xl font-semibold text-ink"
				>
					{next.name}
				</span>
			</span>
			<span class="flex items-baseline gap-3">
				<span class="figure text-accent-on-paper">{next.scaleValue}</span>
				<span class="next-arrow text-accent-on-paper transition-transform" aria-hidden="true">
					<ArrowRight size={20} weight="bold" />
				</span>
			</span>
		</a>
		<p class="meta mt-2 text-ink-faint">
			{siblings.length + 1}
			{content.platforms.title}
		</p>
	</nav>
</article>

<style>
	.next-platform:hover .next-arrow,
	.next-platform:focus-visible .next-arrow {
		transform: translateX(4px);
	}

	@media (prefers-reduced-motion: reduce) {
		.next-arrow {
			transition: none;
		}
		.next-platform:hover .next-arrow,
		.next-platform:focus-visible .next-arrow {
			transform: none;
		}
	}
</style>

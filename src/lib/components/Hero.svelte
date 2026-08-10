<script lang="ts">
	import { onMount } from 'svelte';
	import type { SiteContent } from '$lib/content';
	import { langState } from '$lib/state/lang.svelte';
	import { countUp } from '$lib/actions/countUp';
	import Hero3D from './Hero3D.svelte';
	import MobileHeroParticles from './MobileHeroParticles.svelte';

	let { content }: { content: SiteContent } = $props();

	let nameWords = $derived(content.hero.name.split(' '));

	// The 3D scene is decorative and hidden below md. Gating the component
	// itself (rather than hiding it with CSS) keeps three.js off the wire on
	// phones, where it would otherwise render into a 0x0 canvas forever.
	let showScene = $state(false);
	onMount(() => {
		const desktopMedia = window.matchMedia('(min-width: 768px)');
		showScene = desktopMedia.matches;
		const onChange = (event: MediaQueryListEvent) => (showScene = event.matches);
		desktopMedia.addEventListener('change', onChange);
		return () => desktopMedia.removeEventListener('change', onChange);
	});
</script>

<section
	id="top"
	class="relative flex min-h-[100dvh] items-stretch overflow-hidden md:items-center md:px-4 md:pt-24 md:pb-16"
>
	<!-- On mobile the object gets its own stage. Copy begins below the diagonal
	     panel edge, so the artwork can stay vivid without sacrificing contrast. -->
	<div class="mobile-hero-art pointer-events-none absolute inset-x-0 top-0 overflow-hidden md:hidden" aria-hidden="true">
		<div class="mobile-hero-object-wrap absolute inset-0">
			{#if !showScene}
				<MobileHeroParticles />
			{/if}
		</div>
		<div class="mobile-hero-scrim absolute inset-0"></div>
	</div>
	<div class="mobile-hero-panel pointer-events-none absolute inset-x-0 bottom-0 md:hidden" aria-hidden="true"></div>

	{#if showScene}
		<!-- Decorative backdrop. pointer-events stay off so the scene never
		     swallows clicks; Hero3D tracks the pointer on window instead.
		     Anchored right rather than centred: the copy column keeps the left
		     third to itself, so the type never has to fight the densest part of
		     the mesh for contrast. -->
		<div class="pointer-events-none absolute inset-y-0 right-0 flex w-[58%] items-center justify-center">
			<!-- Sized to sit whole inside the right column. It used to run at 196%
			     and read as wallpaper; at this scale the tetrahedron is an object
			     with an edge, which is what makes the split composition work. -->
			<div class="aspect-square h-[96%] max-w-none translate-x-[4%] lg:h-[104%]">
				<Hero3D />
			</div>
		</div>
		<!-- Lifts the copy off the densest part of the mesh. -->
		<div class="hero-scrim pointer-events-none absolute inset-0"></div>
	{/if}

	<div class="hero-copy relative mx-auto flex w-full max-w-6xl flex-col md:justify-center">
		<div class="md:max-w-[30rem] lg:max-w-[34rem]">
			<h1
				class="hero-name font-[family-name:var(--font-display)] text-[17vw] leading-[0.82] font-extrabold tracking-[-0.07em] text-ink sm:text-[13vw] md:text-[7.4vw] xl:text-[6.75rem]"
			>
				{#each nameWords as word, i (i)}<span class="hero-word" style="animation-delay: {i * 90}ms"
					>{word}</span
				>{/each}
			</h1>

			<!--
				Hierarchy through weight and colour rather than raw scale: the role
				used to compete with the name at text-5xl, which left the sentence
				that actually explains the work looking like a footnote.
			-->
			<p
				class="hero-role mt-6 max-w-[28ch] font-[family-name:var(--font-display)] text-xl leading-tight font-bold tracking-tight text-accent-on-paper md:text-2xl"
			>
				{content.hero.role}
			</p>

			<p class="hero-tagline mt-4 max-w-[42ch] text-lg leading-relaxed text-ink-soft md:text-xl">
				{content.hero.tagline}
			</p>

			<div class="hero-actions mt-9 grid w-full grid-cols-2 gap-3 md:flex md:w-auto md:flex-wrap md:items-center">
				<!-- The German labels wrapped to two lines in a 158px column at
				     text-sm, which pushed the buttons past the fold on a 375px
				     phone. One notch down keeps both on a single line. -->
				<a
					href="#contact"
					class="flex min-h-12 items-center justify-center rounded-lg bg-signal px-2 py-3 text-center text-[0.8125rem] font-bold text-on-signal transition-transform hover:-translate-y-0.5 active:scale-[0.98] md:px-6 md:text-sm"
				>
					{content.hero.cta}
				</a>
				<a
					href="#career"
					class="flex min-h-12 items-center justify-center rounded-lg border-2 border-ink px-2 py-3 text-center text-[0.8125rem] font-semibold text-ink transition-colors hover:border-accent-on-paper hover:text-accent-on-paper md:px-6 md:text-sm"
				>
					{content.hero.ctaSecondary}
				</a>
			</div>
		</div>
	</div>
</section>

<!--
	The three numbers used to sit in a clipped panel as three equal columns of
	text-7xl. Same facts, read as a hairline strip instead: the figures support
	the hero, they are not a second headline.
-->
<section class="relative mx-auto max-w-6xl px-4 sm:px-6">
	<div class="grid border-t border-ink/15 sm:grid-cols-3">
		{#each content.stats as stat, i (stat.label)}
			<div
				class="flex items-baseline gap-3 border-b border-ink/12 py-5 sm:border-b-0 sm:py-7 {i > 0
					? 'sm:border-l sm:border-ink/12 sm:pl-6'
					: ''} sm:pr-6"
			>
				<span
					use:countUp={{ text: stat.value, locale: langState.current }}
					class="shrink-0 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-ink md:text-4xl"
				>
					{stat.value}
				</span>
				<span class="text-sm leading-snug text-ink-soft">{stat.label}</span>
			</div>
		{/each}
	</div>
</section>

<style>
	/* One word per line at every width: a stacked wordmark reads as a
	   deliberate lockup, a single centred line reads as a title slide. */
	.hero-word {
		display: block;
		opacity: 0;
		transform: translateY(0.5em);
		animation: word-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}
	.hero-name {
		text-shadow: 0 2px 28px color-mix(in srgb, var(--color-paper) 62%, transparent);
	}
	.mobile-hero-art {
		height: clamp(18rem, 48dvh, 27rem);
		background: var(--color-paper);
	}
	.mobile-hero-panel {
		top: clamp(16rem, 42dvh, 23rem);
		background: linear-gradient(
			145deg,
			color-mix(in srgb, var(--color-paper) 91%, var(--color-hero-blue) 9%),
			var(--color-paper) 58%
		);
		clip-path: polygon(0 3.5rem, 100% 0, 100% 100%, 0 100%);
	}
	.mobile-hero-panel::before {
		position: absolute;
		top: 3.45rem;
		left: 0;
		width: 110%;
		height: 1px;
		content: '';
		transform: rotate(-8deg);
		transform-origin: left center;
		background: var(--color-hero-wine-light);
		opacity: 0.9;
	}
	.mobile-hero-object-wrap {
		opacity: 0;
		animation: mobile-object-in 1.1s 0.12s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}
	.mobile-hero-scrim {
		background:
			radial-gradient(ellipse 72% 72% at 50% 54%, transparent 42%, color-mix(in srgb, var(--color-paper) 42%, transparent) 100%),
			linear-gradient(
				to bottom,
				color-mix(in srgb, var(--color-paper) 38%, transparent),
				transparent 24%,
				transparent 68%,
				color-mix(in srgb, var(--color-paper) 82%, transparent)
			);
	}
	@keyframes mobile-object-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	@keyframes word-in {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.hero-word {
			animation: none;
			opacity: 1;
			transform: none;
		}
		.mobile-hero-object-wrap {
			opacity: 1;
			animation: none;
		}
	}
	@media (max-width: 767px) {
		.hero-copy {
			align-items: flex-start;
			padding: calc(clamp(16rem, 42dvh, 23rem) + 4.5rem) 1.5rem 2.5rem;
			text-align: left;
		}
		.hero-name {
			text-shadow: none;
		}
		.hero-role {
			max-width: 20ch;
		}
		.hero-tagline {
			max-width: 38ch;
			font-size: 1.0625rem;
			line-height: 1.55;
		}
	}

	/* Directional wash rather than a radial one: the object now sits to the
	   right, so the page colour only has to carry the left column. The facets
	   on the right stay untouched. */
	.hero-scrim {
		background: linear-gradient(
			100deg,
			color-mix(in srgb, var(--color-paper) 94%, transparent) 0%,
			color-mix(in srgb, var(--color-paper) 82%, transparent) 30%,
			color-mix(in srgb, var(--color-paper) 34%, transparent) 54%,
			transparent 74%
		);
	}
</style>

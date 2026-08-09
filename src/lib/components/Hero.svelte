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
		     swallows clicks; Hero3D tracks the pointer on window instead. -->
		<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
			<!-- Oversized on purpose: the solid bleeds past the hero edges so it
			     reads as a backdrop rather than an illustration sitting in a box. -->
			<div class="aspect-square h-[178%] max-w-none md:h-[196%]">
				<Hero3D />
			</div>
		</div>
		<!-- Lifts the copy off the densest part of the mesh. -->
		<div class="hero-scrim pointer-events-none absolute inset-0"></div>
	{/if}

	<div class="hero-copy relative mx-auto flex w-full max-w-6xl flex-col md:items-center md:text-center">
		<h1
			class="hero-name font-[family-name:var(--font-display)] text-[17vw] leading-[0.8] font-extrabold tracking-[-0.075em] text-ink sm:text-[13vw] md:text-[9.5vw] xl:text-[8.5rem]"
		>
			{#each nameWords as word, i (i)}<span class="hero-word" style="animation-delay: {i * 90}ms"
				>{word}{i < nameWords.length - 1 ? '\u00a0' : ''}</span
			>{/each}
		</h1>

		<p
			class="hero-role mt-6 max-w-[24ch] text-balance font-[family-name:var(--font-display)] text-3xl leading-[1.02] font-bold tracking-tight text-accent-on-paper sm:text-4xl md:text-5xl"
		>
			{content.hero.role}
		</p>

		<p class="hero-tagline mt-6 max-w-[46ch] text-xl leading-snug text-ink-soft">
			{content.hero.tagline}
		</p>

		<div class="hero-actions mt-8 grid w-full grid-cols-2 gap-3 md:flex md:w-auto md:flex-wrap md:items-center md:justify-center">
			<a
				href="#contact"
				class="flex min-h-12 items-center justify-center rounded-lg bg-signal px-3 py-3 text-center text-sm font-bold text-on-signal transition-transform hover:-translate-y-0.5 active:scale-[0.98] md:px-6"
			>
				{content.hero.cta}
			</a>
			<a
				href="#career"
				class="flex min-h-12 items-center justify-center rounded-lg border-2 border-ink px-3 py-3 text-center text-sm font-semibold text-ink transition-colors hover:border-accent-on-paper hover:text-accent-on-paper md:px-6"
			>
				{content.hero.ctaSecondary}
			</a>
		</div>
	</div>
</section>

<section class="relative px-4 pb-4 sm:px-6">
	<div class="facet-rise mx-auto max-w-6xl bg-paper-raised px-6 py-12 sm:px-10 md:py-16">
		<div class="grid grid-cols-1 divide-y divide-ink/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
			{#each content.stats as stat, i (stat.label)}
				<div class="flex flex-col justify-center px-2 py-6 sm:px-8 {i === 0 ? 'pt-0 sm:pt-6' : ''}">
					<span
						use:countUp={{ text: stat.value, locale: langState.current }}
						class="font-[family-name:var(--font-display)] text-6xl font-extrabold text-ink md:text-7xl"
					>
						{stat.value}
					</span>
					<span class="mt-2 text-sm text-ink-soft">{stat.label}</span>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.hero-word {
		display: inline-block;
		opacity: 0;
		transform: translateY(0.5em);
		animation: word-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}
	.hero-name {
		text-shadow: 0 2px 28px color-mix(in srgb, var(--color-paper) 82%, transparent);
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
		.hero-word {
			display: block;
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

	/* Radial wash in the page colour: settles the mesh behind the headline
	   without hiding the facets that fall outside the copy. */
	.hero-scrim {
		background: radial-gradient(
			ellipse 50% 36% at 50% 48%,
			color-mix(in srgb, var(--color-paper) 88%, transparent) 0%,
			color-mix(in srgb, var(--color-paper) 62%, transparent) 45%,
			transparent 78%
		);
	}
</style>

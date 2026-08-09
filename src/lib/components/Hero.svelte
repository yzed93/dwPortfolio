<script lang="ts">
	import { onMount } from 'svelte';
	import type { SiteContent } from '$lib/content';
	import { langState } from '$lib/state/lang.svelte';
	import { countUp } from '$lib/actions/countUp';
	import Hero3D from './Hero3D.svelte';

	let { content }: { content: SiteContent } = $props();

	let nameWords = $derived(content.hero.name.split(' '));

	// The 3D scene is decorative and hidden below md. Gating the component
	// itself (rather than hiding it with CSS) keeps three.js off the wire on
	// phones, where it would otherwise render into a 0x0 canvas forever.
	let showScene = $state(false);
	onMount(() => {
		const mq = window.matchMedia('(min-width: 768px)');
		showScene = mq.matches;
		const onChange = (e: MediaQueryListEvent) => (showScene = e.matches);
		mq.addEventListener('change', onChange);
		return () => mq.removeEventListener('change', onChange);
	});
</script>

<section
	id="top"
	class="relative flex min-h-[100dvh] items-center overflow-hidden px-4 pt-24 pb-14 sm:px-6 md:pt-24 md:pb-16"
>
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

	<div class="relative mx-auto flex max-w-6xl flex-col items-center text-center">
		<h1
			class="hero-name font-[family-name:var(--font-display)] text-[18vw] leading-[0.8] font-extrabold tracking-[-0.075em] text-ink sm:text-[13vw] md:text-[9.5vw] xl:text-[8.5rem]"
		>
			{#each nameWords as word, i (i)}<span
					class="hero-word"
					style="animation-delay: {i * 90}ms">{word}</span
				>&nbsp;{/each}
		</h1>

		<p
			class="mt-6 max-w-[24ch] text-balance font-[family-name:var(--font-display)] text-3xl leading-[1.02] font-bold tracking-tight text-accent-on-paper sm:text-4xl md:text-5xl"
		>
			{content.hero.role}
		</p>

		<p class="mt-6 max-w-[46ch] text-xl leading-snug text-ink-soft">
			{content.hero.tagline}
		</p>

		<div class="mt-8 flex flex-wrap items-center justify-center gap-3">
			<a
				href="#contact"
				class="rounded-lg bg-ink px-6 py-3 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
			>
				{content.hero.cta}
			</a>
			<a
				href="#career"
				class="rounded-lg border-2 border-ink px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent-on-paper hover:text-accent-on-paper"
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

<script lang="ts">
	import type { SiteContent } from '$lib/content';
	import { langState } from '$lib/state/lang.svelte';
	import CvButton from './CvButton.svelte';
	import ArchitecturePlate from './ArchitecturePlate.svelte';
	import ArrowDown from 'phosphor-svelte/lib/ArrowDown';

	let { content }: { content: SiteContent } = $props();
	let nameWords = $derived(content.hero.name.split(' '));
	let proofLabel = $derived(
		langState.current === 'de'
			? 'Ausgewählte Plattformarbeit · München'
			: 'Selected platform work · Munich'
	);
</script>

<section id="top" class="hero-shell relative overflow-hidden px-4 pt-28 pb-16 sm:px-6 md:pt-36 md:pb-24">
	<div class="mx-auto max-w-6xl">
		<p class="meta hero-kicker flex items-center gap-3 font-medium text-accent-on-paper uppercase">
			<span aria-hidden="true"></span>
			{content.hero.role}
		</p>

		<div class="mt-8 grid items-end gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
			<div>
				<h1 class="hero-name font-[family-name:var(--font-display)] text-[clamp(4.6rem,11vw,9rem)] leading-[0.74] font-medium tracking-[-0.065em] text-ink">
					{#each nameWords as word, i (word)}
						<span class="hero-word" style="animation-delay: {i * 90}ms">{word}</span>
					{/each}
				</h1>

				<p class="hero-positioning mt-10 max-w-[36ch] text-xl leading-[1.42] text-ink md:text-2xl">
					{content.hero.positioning}
				</p>

				<div class="mt-9 flex flex-wrap items-center gap-3">
					<a href="#contact" class="hero-contact inline-flex min-h-12 items-center justify-center gap-2 bg-signal px-6 py-3 text-sm font-semibold text-on-signal transition-transform hover:-translate-y-0.5 active:scale-[0.98]">
						{content.hero.ctaContact}
						<span class="hero-contact-arrow" aria-hidden="true"><ArrowDown size={15} weight="bold" /></span>
					</a>
					<CvButton href={content.cv.href} label={content.hero.ctaCv} confirmLabel={content.cv.started} class="min-h-12 border border-ink/35 px-5 py-3 text-sm font-medium text-ink hover:border-accent-on-paper hover:text-accent-on-paper" />
				</div>
			</div>

			<div class="hero-plate">
				<ArchitecturePlate />
			</div>
		</div>

		<div class="hero-proof meta mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-ink/20 pt-4 text-ink-faint md:mt-20">
			<span>{proofLabel}</span>
			<span>Citrix / Azure / PowerShell / Operations</span>
		</div>
	</div>
</section>

<style>
	.hero-shell::after {
		position: absolute;
		top: 5.5rem;
		right: max(1rem, calc((100vw - 72rem) / 2));
		width: clamp(8rem, 16vw, 14rem);
		height: 1px;
		content: '';
		background: var(--color-accent-on-paper);
		opacity: 0.55;
	}
	.hero-kicker > span {
		width: 2.5rem;
		height: 1px;
		background: currentColor;
	}
	.hero-word {
		display: block;
		opacity: 0;
		transform: translateY(0.32em);
		animation: word-in 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}
	.hero-plate {
		opacity: 0;
		transform: translateY(20px);
		animation: plate-in 0.8s 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}
	.hero-contact-arrow {
		display: inline-flex;
		transition: transform 200ms var(--ease-out-strong);
	}
	.hero-contact:hover .hero-contact-arrow,
	.hero-contact:focus-visible .hero-contact-arrow {
		transform: translateY(3px);
	}
	@keyframes word-in {
		to { opacity: 1; transform: translateY(0); }
	}
	@keyframes plate-in {
		to { opacity: 1; transform: translateY(0); }
	}
	@media (max-width: 639px) {
		.hero-name { font-size: clamp(4.25rem, 24vw, 7rem); }
		.hero-plate { margin-right: 0.75rem; }
	}
	@media (prefers-reduced-motion: reduce) {
		.hero-word,
		.hero-plate { animation: none; opacity: 1; transform: none; }
		.hero-contact-arrow { transition: none; }
		.hero-contact:hover .hero-contact-arrow,
		.hero-contact:focus-visible .hero-contact-arrow { transform: none; }
	}
</style>

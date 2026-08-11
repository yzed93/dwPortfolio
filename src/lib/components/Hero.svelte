<script lang="ts">
	import type { SiteContent } from '$lib/content';
	import CvButton from './CvButton.svelte';
	import ArchitecturePlate from './ArchitecturePlate.svelte';
	import ArrowDown from 'phosphor-svelte/lib/ArrowDown';

	let { content }: { content: SiteContent } = $props();
	let nameWords = $derived(content.hero.name.split(' '));
	/*
		The role used to sit above the name as an eyebrow. It now closes the hero
		instead: the name gets the first viewport line to itself, and the role reads
		where a reader looks for the caption anyway.
	*/
	let proofLabel = $derived(`${content.hero.role} · München`);
</script>

<section id="top" class="hero-shell relative overflow-hidden px-4 pt-28 pb-16 sm:px-6 md:pt-36 md:pb-24">
	<div class="mx-auto max-w-6xl">
		<!--
			Stretch, not bottom-align. Bottom-aligning the two columns pushed the
			name down to meet the taller plate, which is exactly the wrong trade: the
			name has to land first. The column now fills the plate's height itself
			and pushes the buttons down, so the two columns still close on one line.
		-->
		<div class="grid items-stretch gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
			<div class="flex flex-col">
				<h1 class="hero-name font-[family-name:var(--font-display)] text-[clamp(4.6rem,11vw,9rem)] leading-[0.74] font-medium tracking-[-0.065em] text-ink">
					{#each nameWords as word, i (word)}
						<span class="hero-word" style="animation-delay: {i * 110}ms">{word}</span>
					{/each}
				</h1>

				<p class="hero-line hero-positioning mt-10 max-w-[36ch] text-xl leading-[1.42] text-ink md:text-2xl">
					{content.hero.positioning}
				</p>

				<div class="hero-line hero-actions mt-9 flex flex-wrap items-center gap-3 sm:flex-nowrap lg:mt-auto lg:pt-10">
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

		<div class="hero-proof hero-line meta mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-ink/20 pt-4 text-ink-faint md:mt-20">
			<span class="font-medium text-accent-on-paper uppercase">{proofLabel}</span>
			<span>Citrix / Azure / PowerShell / Operations</span>
		</div>
	</div>
</section>

<style>
	/*
		The name is masked in rather than faded in: the serif arrives already at
		full weight and colour, uncovered from the top, which reads as type being
		set instead of an element animating. Descenders survive because the mask is
		a gradient over the box, not an overflow clip.
	*/
	/*
		The name is wiped in rather than faded in: the serif arrives already at full
		weight and colour, uncovered from the top, which reads as type being set
		instead of an element animating.

		clip-path and not a mask, because at a line height of 0.74 the serif spills
		far outside its own box: caps above, descenders below. A mask can never
		cover more than the border box, so it sheared the top off the D and the W.
		clip-path takes negative insets, so the resting state reaches past the box
		on every side and clips nothing at all, with no padding and therefore no
		effect on the line spacing.
	*/
	.hero-word {
		display: block;
		clip-path: inset(-40% -12% 100% -12%);
		transform: translateY(0.16em);
		animation: word-set 1.05s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	/*
		Everything under the name follows the same entrance so the hero resolves as
		one overture; the plate's own cycle only starts once this has settled.
	*/
	.hero-line {
		opacity: 0;
		transform: translateY(14px);
		animation: line-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}
	.hero-positioning { animation-delay: 320ms; }
	.hero-actions { animation-delay: 420ms; }
	.hero-proof { animation-delay: 560ms; }

	.hero-plate {
		opacity: 0;
		transform: translateY(20px);
		animation: plate-in 0.9s 0.26s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	.hero-contact-arrow {
		display: inline-flex;
		transition: transform 200ms var(--ease-out-strong);
	}
	.hero-contact:hover .hero-contact-arrow,
	.hero-contact:focus-visible .hero-contact-arrow {
		transform: translateY(3px);
	}

	@keyframes word-set {
		to {
			clip-path: inset(-40% -12% -40% -12%);
			transform: translateY(0);
		}
	}
	@keyframes line-in {
		to { opacity: 1; transform: translateY(0); }
	}
	@keyframes plate-in {
		to { opacity: 1; transform: translateY(0); }
	}

	@media (max-width: 639px) {
		.hero-name { font-size: clamp(4.25rem, 24vw, 7rem); }
		.hero-plate { margin-right: 0.75rem; }
		/*
			Stacked buttons at two different widths read as an accident. Below the
			row breakpoint they share one edge and become a deliberate pair.
		*/
		/* Links only: the CV button also emits an sr-only status span. */
		.hero-actions > :global(a) {
			flex: 1 1 100%;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.hero-word {
			animation: none;
			clip-path: none;
			transform: none;
		}
		.hero-line,
		.hero-plate { animation: none; opacity: 1; transform: none; }
		.hero-contact-arrow { transition: none; }
		.hero-contact:hover .hero-contact-arrow,
		.hero-contact:focus-visible .hero-contact-arrow { transform: none; }
	}
</style>

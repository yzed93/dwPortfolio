<script lang="ts">
	import type { SiteContent } from '$lib/content';
	import { reveal } from '$lib/actions/reveal';
	import CareerField from './CareerField.svelte';

	let { content }: { content: SiteContent } = $props();

	let section = $state<HTMLElement | null>(null);

	// Stored oldest-first; the axis reads that way on purpose. The arc only
	// works forwards: purchasing, then school, then infrastructure. Where it
	// turns is carried by the rule going from dashed to solid, not by a label.
	let stations = $derived(content.career.stations);
</script>

<section id="career" bind:this={section} class="relative px-4 py-16 sm:px-6 md:py-24">
	<div class="mx-auto max-w-6xl">
		<h2 use:reveal class="section-head text-ink">
			{content.career.title}
		</h2>
		<p class="mt-4 max-w-[58ch] text-lg leading-relaxed text-ink-soft">
			{content.career.intro}
		</p>

		<div class="mt-12 grid gap-10 lg:grid-cols-[1fr_0.72fr] lg:gap-16">
			<!--
				The axis. The rule to the left of the stations is dashed for the
				commercial years and solid from the second-chance Abitur onwards, so
				the career change is visible without being labelled.
			-->
			<ol class="relative">
				{#each stations as station, i (station.id)}
					{@const isCurrent = i === stations.length - 1}
					<li use:reveal={Math.min(i, 4) * 60} class="relative pb-9 pl-8 last:pb-0 sm:pl-10">
						<span
							class="axis-line absolute top-2 bottom-0 left-0 w-px {station.track === 'it'
								? 'is-solid'
								: 'is-dashed'}"
							aria-hidden="true"
						></span>
						<span
							class="absolute top-[0.4rem] left-0 h-2 w-2 -translate-x-1/2 rounded-full {station.track ===
							'it'
								? 'bg-accent-on-paper'
								: 'bg-ink-faint'}"
							aria-hidden="true"
						></span>

						<div>
							<div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
								<span class="figure text-sm text-accent-on-paper">{station.year}</span>
								<h3
									class="font-[family-name:var(--font-display)] text-lg font-semibold text-ink {isCurrent
										? 'md:text-xl'
										: ''}"
								>
									{station.company}
								</h3>
							</div>
							<p class="mt-1 text-sm font-medium text-ink-soft">{station.role}</p>
							<p class="meta mt-1 text-ink-faint">{station.period}</p>
							<p class="mt-3 max-w-[60ch] leading-relaxed text-ink-soft">{station.summary}</p>

							{#if isCurrent}
								<!-- Only the current role gets its detail on the axis. Everything
								     else stays at one line, which is what keeps this scannable. -->
								<ul class="mt-4 space-y-2">
									{#each station.bullets as bullet (bullet)}
										<li class="rule-item max-w-[60ch] text-sm leading-relaxed text-ink-soft">
											{bullet}
										</li>
									{/each}
								</ul>
							{/if}
						</div>
					</li>
				{/each}
			</ol>

			<!--
				The field sticks while the axis scrolls past it, so the reader sees
				the same object resolve from scattered points into an ordered
				lattice across the eight stations. That is the whole argument of the
				section in one image.
			-->
			<div class="order-first lg:order-none">
				<div class="lg:sticky lg:top-28">
					<div class="h-40 w-full sm:h-52 lg:h-[26rem]">
						<CareerField {section} />
					</div>
					<p class="mt-6 max-w-[38ch] leading-relaxed text-ink-soft">
						{content.career.closing}
					</p>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.axis-line.is-solid {
		background: color-mix(in srgb, var(--color-accent-on-paper) 38%, transparent);
	}

	/*
		A repeating gradient rather than a dashed border, because a border would
		need its own element and would not sit on the same pixel column as the
		solid half of the axis.
	*/
	.axis-line.is-dashed {
		background: repeating-linear-gradient(
			to bottom,
			color-mix(in srgb, var(--color-ink-faint) 55%, transparent) 0 4px,
			transparent 4px 9px
		);
	}
</style>

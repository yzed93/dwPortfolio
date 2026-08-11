<script lang="ts">
	import type { SiteContent } from '$lib/content';
	import { reveal } from '$lib/actions/reveal';
	import CareerField from './CareerField.svelte';
	import CaretDown from 'phosphor-svelte/lib/CaretDown';

	let { content }: { content: SiteContent } = $props();

	let section = $state<HTMLElement | null>(null);

	// Stored oldest-first; the axis reads that way on purpose. The arc only
	// works forwards: purchasing, then school, then infrastructure. Where it
	// turns is carried by the rule going from dashed to solid and by two quiet
	// phase labels, so the change can be scanned as well as discovered.
	let stations = $derived(content.career.stations);
	let presentLabel = $derived(content.career.title === 'Werdegang' ? 'heute' : 'present');

	function phaseLabel(track: 'commercial' | 'it') {
		if (content.career.title === 'Werdegang') {
			return track === 'commercial' ? 'Kaufmännischer Weg' : 'Neustart in die IT';
		}
		return track === 'commercial' ? 'Commercial path' : 'New start in IT';
	}
</script>

<section id="career" bind:this={section} class="relative overflow-hidden px-4 py-16 sm:px-6 md:py-24">
	<!--
		The field sits behind the stations rather than in a column beside them.
		As a column it dropped below the axis on any viewport under 1024px, which
		is most laptop windows that are not maximised. Behind, it is one
		composition at every width, and the reading order never changes.

		Readability is protected twice over: the field is masked away across the
		left of the section so it never sits behind the start of a line, and its
		points cover under one percent of their own area even when fully
		resolved.
	-->
	<div class="career-field pointer-events-none absolute inset-y-0 right-0 w-full" aria-hidden="true">
		<CareerField {section} />
	</div>

	<div class="relative mx-auto max-w-6xl">
		<div class="career-intro-grid">
			<div>
				<h2 use:reveal class="section-head text-ink">
					{content.career.title}
				</h2>
				<p class="mt-5 max-w-[58ch] text-lg leading-relaxed text-ink-soft">
					{content.career.intro}
				</p>
			</div>

			<p class="career-range" aria-label="{stations[0]?.year} bis {presentLabel}">
				<span>{stations[0]?.year}</span>
				<span class="career-range-rule" aria-hidden="true"></span>
				<span>{presentLabel}</span>
			</p>
		</div>

		<div class="mt-16 md:mt-24">
			<!--
				The axis. The rule to the left of the stations is dashed for the
				commercial years and solid from the second-chance Abitur onwards. The
				phase labels make that career change explicit without interrupting it.
			-->
			<ol class="relative">
				{#each stations as station, i (station.id)}
					{@const isCurrent = i === stations.length - 1}
					{@const isPhaseStart = i === 0 || stations[i - 1]?.track !== station.track}
					<li
						use:reveal={Math.min(i, 4) * 60}
						class="station relative pb-9 pl-8 sm:pl-10"
						class:is-open-ended={isCurrent}
						class:is-current={isCurrent}
						class:is-phase-start={isPhaseStart}
					>
						{#if isPhaseStart}
							<p class="phase-label meta" data-phase={station.track}>
								{phaseLabel(station.track)}
							</p>
						{/if}
						<span
							class="axis-line absolute top-2 bottom-0 left-0 w-px {station.track === 'it'
								? 'is-solid'
								: 'is-dashed'}"
							aria-hidden="true"
						></span>
						<span
							class="station-node absolute top-[0.4rem] left-0 h-2 w-2 -translate-x-1/2 rounded-full {station.track ===
							'it'
								? 'bg-accent-on-paper'
								: 'bg-ink-faint'}"
							aria-hidden="true"
						></span>

						<div class="station-panel">
							<div class="station-grid">
								<div class="station-time">
									<span class="station-year figure text-accent-on-paper">{station.year}</span>
									<span class="figure mt-1 block text-sm text-ink-faint">{station.period}</span>
								</div>

								<div class="station-copy">
									<h3 class="station-company font-[family-name:var(--font-display)] font-semibold text-ink">
										{station.company}
									</h3>
									<p class="mt-1 text-sm font-medium text-ink-soft">{station.role}</p>
									<p class="mt-4 max-w-[60ch] leading-relaxed text-ink-soft">{station.summary}</p>

									<!--
										Four of the eight stations carry detail beyond their one-line
										summary, and until now it was written in the content file and
										never rendered. Rather than pasting it all onto the axis and
										losing the scan, it opens on request. The current role starts
										open, because it is the one a reader came for.

										Native details, so the keyboard, screen readers and a
										no-JavaScript load all get it without anything being wired up.
									-->
									{#if station.bullets.length > 1}
										<details class="station-detail mt-4" open={isCurrent}>
											<summary class="meta inline-flex min-h-11 cursor-pointer items-center gap-2 text-ink-faint">
												<span class="station-chevron" aria-hidden="true">
													<CaretDown size={12} weight="bold" />
												</span>
												{content.career.detail}
											</summary>
											<ul class="mt-3 space-y-2">
												{#each station.bullets as bullet (bullet)}
													<li class="rule-item max-w-[60ch] text-sm leading-relaxed text-ink-soft">
														{bullet}
													</li>
												{/each}
											</ul>
										</details>
									{/if}
								</div>
							</div>
						</div>
					</li>
				{/each}
			</ol>

		</div>
	</div>
</section>

<style>
	.career-intro-grid {
		display: grid;
		gap: 3rem;
		align-items: end;
	}

	.career-range {
		display: grid;
		grid-template-columns: auto minmax(2rem, 1fr) auto;
		gap: 0.7rem;
		align-items: center;
		margin: 0;
		font-family: var(--font-mono);
		/*
			8.5vw and not 9vw: between the two-column breakpoint and roughly 880px
			this pair shares its row with the intro text, and at 9vw the figures
			needed 372px of a 362px box. `white-space: nowrap` means they cannot
			give, so they overflowed instead. Above 1315px the 7rem cap takes over
			and nothing about the desktop size changes.
		*/
		font-size: clamp(2.5rem, 8.5vw, 7rem);
		font-variant-numeric: tabular-nums;
		font-weight: 500;
		line-height: 0.8;
		letter-spacing: -0.09em;
		color: var(--color-ink);
		white-space: nowrap;
	}

	.career-range span:last-child {
		color: var(--color-accent-on-paper);
	}

	.career-range-rule {
		height: 2px;
		background: var(--color-accent-on-paper);
		opacity: 0.75;
	}

	.phase-label {
		display: flex;
		gap: 1rem;
		align-items: center;
		margin: 0 0 1.5rem;
		color: var(--color-ink-faint);
		font-weight: 560;
		letter-spacing: 0.02em;
		white-space: nowrap;
	}

	.phase-label::after {
		min-width: 2rem;
		flex: 1;
		height: 1px;
		content: '';
		background: color-mix(in srgb, var(--color-ink) 18%, transparent);
	}

	.phase-label[data-phase='it'] {
		color: var(--color-accent-on-paper);
	}

	.station.is-phase-start:not(:first-child) {
		margin-top: 3rem;
	}

	.station-panel {
		padding-top: 1.4rem;
		border-top: 1px solid color-mix(in srgb, var(--color-ink) 14%, transparent);
	}

	.station-grid {
		display: grid;
		gap: 1rem;
	}

	.station-year {
		display: block;
		font-size: clamp(1.75rem, 3vw, 2.75rem);
		line-height: 0.95;
		letter-spacing: -0.08em;
	}

	.station-company {
		font-size: clamp(1.45rem, 2.4vw, 2rem);
		line-height: 1.02;
		letter-spacing: -0.03em;
	}

	.station.is-current .station-panel {
		position: relative;
		margin-left: -1rem;
		padding: 2rem 1.25rem 2.25rem;
		border-top: 3px solid var(--color-accent-on-paper);
		background: color-mix(in srgb, var(--color-accent-on-paper) 6%, var(--color-paper-raised));
	}

	.station.is-current .station-panel::after {
		position: absolute;
		right: 1.25rem;
		bottom: 1rem;
		width: clamp(3rem, 9vw, 7rem);
		height: 1px;
		content: '';
		background: var(--color-accent-on-paper);
	}

	.station.is-current .station-year {
		font-size: clamp(2.7rem, 5.5vw, 4.75rem);
	}

	.station.is-current .station-company {
		font-size: clamp(1.8rem, 3.4vw, 2.75rem);
	}

	.station.is-current .station-node {
		width: 0.75rem;
		height: 0.75rem;
	}

	@media (min-width: 768px) {
		.career-intro-grid {
			grid-template-columns: minmax(0, 0.9fr) minmax(20rem, 1.1fr);
			gap: clamp(3rem, 8vw, 7rem);
		}

		.career-range {
			padding-bottom: 0.3rem;
		}

		.station-grid {
			grid-template-columns: minmax(7rem, 0.23fr) minmax(0, 1fr);
			gap: clamp(2rem, 5vw, 5rem);
			align-items: start;
		}

		.station.is-current .station-panel {
			margin-left: -2rem;
			padding: 2.5rem 2rem 3rem;
		}
	}

	/*
		Masked away across the left of the section, so the points only ever
		appear to the right of where the station text lives. The fade is wide on
		purpose: a hard edge would read as a panel boundary and reintroduce the
		two-column look this replaced.
	*/
	.career-field {
		opacity: 0.5;
		-webkit-mask-image: linear-gradient(to right, transparent 22%, black 62%);
		mask-image: linear-gradient(to right, transparent 22%, black 62%);
	}

	/*
		On a phone the text runs the full width, so there is no empty right side
		to hide in. The field stays as a faint texture instead of a figure.
	*/
	@media (max-width: 767px) {
		.career-field {
			opacity: 0.3;
			-webkit-mask-image: linear-gradient(to bottom, black 55%, transparent 92%);
			mask-image: linear-gradient(to bottom, black 55%, transparent 92%);
		}
	}

	/*
		The rule draws downward as each station arrives, rather than being there
		the whole time. The point is not the movement: it is that the change
		from dashed to solid becomes something the reader watches happen at the
		second-chance Abitur, instead of a difference they may never register.
	*/
	.axis-line {
		transform: scaleY(0);
		transform-origin: top center;
		transition: transform 520ms var(--ease-out-strong);
	}

	.station:global(.is-visible) .axis-line {
		transform: scaleY(1);
	}

	.axis-line.is-solid {
		background: color-mix(in srgb, var(--color-accent-on-paper) 38%, transparent);
	}

	/*
		The current role has no end date, so its rule does not get one either: it
		fades out instead of stopping, and the node is ringed rather than filled.
		Static, because a reader passes this eight times in a scroll and a
		pulsing dot would wear out on the second.
	*/
	.station.is-open-ended .axis-line {
		-webkit-mask-image: linear-gradient(to bottom, black 30%, transparent 100%);
		mask-image: linear-gradient(to bottom, black 30%, transparent 100%);
	}

	.station.is-open-ended .station-node {
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent-on-paper) 22%, transparent);
	}

	.station-detail > summary {
		list-style: none;
		transition: color 180ms var(--ease-out-strong);
	}

	.station-detail > summary::-webkit-details-marker {
		display: none;
	}

	.station-detail > summary:hover {
		color: var(--color-accent-on-paper);
	}

	.station-chevron {
		display: inline-flex;
		transition: transform 200ms var(--ease-out-strong);
	}

	.station-detail[open] > summary .station-chevron {
		transform: rotate(180deg);
	}

	@media (prefers-reduced-motion: reduce) {
		.axis-line,
		.station-chevron,
		.station-detail > summary {
			transition: none;
		}
		/* The rule still has to be there; only the drawing goes away. */
		.axis-line {
			transform: scaleY(1);
		}
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

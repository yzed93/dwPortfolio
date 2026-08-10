<script lang="ts">
	import type { SiteContent } from '$lib/content';
	import { reveal } from '$lib/actions/reveal';
	import ArrowRight from 'phosphor-svelte/lib/ArrowRight';

	let { content }: { content: SiteContent } = $props();
</script>

<!--
	The section that answers the first question a hiring manager has. Ordered by
	scale in content.ts, so the largest environment is the first thing read.
	Each entry is a link into its own page rather than a card that expands: the
	overview stays scannable, the depth lives one click away.
-->
<section id="platforms" class="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
	<h2 use:reveal class="section-head text-ink">
		{content.platforms.title}
	</h2>
	<p class="mt-4 max-w-[56ch] text-lg leading-relaxed text-ink-soft">
		{content.platforms.intro}
	</p>

	<ul class="mt-12 border-t border-ink/15">
		{#each content.platforms.items as platform, i (platform.slug)}
			<li use:reveal={i * 70}>
				<a
					href="/projekte/{platform.slug}"
					class="platform-row group grid gap-x-8 gap-y-3 border-b border-ink/15 py-7 transition-colors md:grid-cols-[9rem_1fr_auto] md:items-baseline md:py-8"
				>
					<!-- The figure leads the row and is set in mono, so the four
					     platform sizes stack into a readable column of numbers. The unit
					     sits underneath rather than beside it: values like "ca. 7.000"
					     are too wide to share a line at this column width. -->
					<p>
						<span class="figure block text-2xl whitespace-nowrap text-accent-on-paper md:text-3xl">
							{platform.scaleValue}
						</span>
						<span class="meta mt-1 block text-ink-faint">{platform.scaleLabel}</span>
					</p>

					<div>
						<h3
							class="font-[family-name:var(--font-display)] text-xl font-semibold text-ink md:text-2xl"
						>
							{platform.name}
						</h3>
						<p class="mt-1.5 max-w-[62ch] leading-relaxed text-ink-soft">
							{platform.summary}
						</p>
						<p class="meta mt-3 text-ink-faint">
							{platform.sector}
						</p>
					</div>

					<div class="flex items-center gap-4 md:flex-col md:items-end md:gap-2">
						<span class="meta text-ink-faint">{platform.period}</span>
						<span
							class="platform-arrow text-accent-on-paper transition-transform"
							aria-hidden="true"
						>
							<ArrowRight size={20} weight="bold" />
						</span>
					</div>
				</a>
			</li>
		{/each}
	</ul>
</section>

<style>
	.platform-row:hover {
		background: color-mix(in srgb, var(--color-ink) 3%, transparent);
	}

	.platform-row:hover .platform-arrow,
	.platform-row:focus-visible .platform-arrow {
		transform: translateX(4px);
	}

	@media (prefers-reduced-motion: reduce) {
		.platform-arrow {
			transition: none;
		}
		.platform-row:hover .platform-arrow,
		.platform-row:focus-visible .platform-arrow {
			transform: none;
		}
	}
</style>

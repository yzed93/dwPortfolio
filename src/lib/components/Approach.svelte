<script lang="ts">
	import type { SiteContent } from '$lib/content';
	import { reveal } from '$lib/actions/reveal';

	let { content }: { content: SiteContent } = $props();
</script>

<!--
	This replaces the old skill matrix. The product names are still here, because
	recruiters and applicant tracking scan for them, but each one hangs off a
	working principle instead of sitting in a decontextualised list.
-->
<section id="approach" class="relative px-4 py-4 sm:px-6">
	<div class="mx-auto max-w-6xl bg-paper-raised px-6 py-16 sm:px-10 md:py-20">
		<h2 use:reveal class="section-head-quiet text-ink">
			{content.approach.title}
		</h2>
		<p class="mt-3 max-w-[52ch] leading-relaxed text-ink-soft">{content.approach.intro}</p>

		<!--
			Stacked full width rather than three equal columns. Two reasons, and
			the second is the one that matters: three identical cards in a row is
			the most worn layout on the web, and it also misreads the content.
			These are not three parallel options, they are the order a platform
			passes through: automate it, design how it will be run, hand it over.
			A vertical sequence says that; a row of cards says "pick one".
		-->
		<!--
			Two tracks for two children. The row used to carry a leading number in a
			5rem column; when the numbering went the track stayed behind, so the
			heading was squeezed into 80px, broke one word per line and collided
			with the body text beside it.
		-->
		<div class="mt-10 border-t border-ink/15">
			{#each content.approach.items as item, i (item.title)}
				<div use:reveal={i * 80} class="approach-row grid border-b border-ink/15 py-8 md:grid-cols-[0.8fr_1.2fr] md:gap-8 md:py-10">
					<h3 class="approach-title mt-3 max-w-[20ch] font-[family-name:var(--font-display)] text-2xl leading-[1.08] font-medium text-ink md:mt-0 md:text-3xl">
						{item.title}
					</h3>
					<div class="mt-4 md:mt-0">
						<p class="max-w-[58ch] leading-relaxed text-ink-soft">{item.body}</p>

					<ul class="mt-6 flex flex-wrap gap-x-2 gap-y-1.5">
						{#each item.tools as tool (tool)}
							<li class="approach-tool meta border border-ink/18 px-2 py-1 text-ink-soft">
								{tool}
							</li>
						{/each}
					</ul>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.approach-title,
	.approach-tool {
		transition:
			transform 220ms var(--ease-out-strong),
			border-color 220ms ease,
			color 220ms ease;
	}

	@media (hover: hover) and (pointer: fine) {
		.approach-row:hover .approach-title {
			transform: translateX(3px);
			color: var(--color-accent-on-paper);
		}

		.approach-row:hover .approach-tool {
			border-color: color-mix(in srgb, var(--color-accent-on-paper) 45%, transparent);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.approach-title,
		.approach-tool {
			transition-property: border-color, color;
		}

		.approach-row:hover .approach-title {
			transform: none;
		}
	}
</style>

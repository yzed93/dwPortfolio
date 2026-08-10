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
		<div class="mt-10 border-t border-ink/15">
			{#each content.approach.items as item, i (item.title)}
				<div use:reveal={i * 80} class="border-b border-ink/15 py-8 md:py-10">
					<h3
						class="max-w-[24ch] font-[family-name:var(--font-display)] text-xl leading-snug font-semibold text-ink md:text-2xl"
					>
						{item.title}
					</h3>
					<p class="mt-3 max-w-[62ch] leading-relaxed text-ink-soft">{item.body}</p>

					<ul class="mt-6 flex flex-wrap gap-x-2 gap-y-1.5">
						{#each item.tools as tool (tool)}
							<li class="meta border border-ink/18 px-2 py-1 text-ink-soft">
								{tool}
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</div>
</section>

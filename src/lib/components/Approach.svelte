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

		<div class="mt-10 grid gap-px bg-ink/12 md:grid-cols-3">
			{#each content.approach.items as item, i (item.title)}
				<div use:reveal={i * 80} class="flex flex-col bg-paper-raised p-6 md:p-7">
					<h3
						class="font-[family-name:var(--font-display)] text-lg leading-snug font-semibold text-ink"
					>
						{item.title}
					</h3>
					<p class="mt-3 leading-relaxed text-ink-soft">{item.body}</p>

					<ul class="mt-auto flex flex-wrap gap-x-2 gap-y-1.5 pt-6">
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

<script lang="ts">
	import type { SiteContent } from '$lib/content';
	import { reveal } from '$lib/actions/reveal';

	let { content }: { content: SiteContent } = $props();
</script>

<!--
	Skills directly above already uses the header-left / hairline-rows-right
	layout, so credentials get a different family: heading stacked, then one
	column per credential separated by vertical rules. Three items, three cells.
-->
<section class="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
	<h2 use:reveal class="section-head-quiet text-ink">
		{content.certifications.title}
	</h2>

	<div class="mt-8 grid border-t border-ink/20 sm:grid-cols-3">
		{#each content.certifications.items as cert, i (cert.name)}
			<div
				use:reveal={i * 80}
				class="flex flex-col border-b border-ink/15 py-6 sm:border-b-0 sm:py-8 {i > 0
					? 'sm:border-l sm:border-ink/15 sm:pl-6'
					: ''} sm:pr-6"
			>
				<p class="font-[family-name:var(--font-display)] text-2xl font-bold text-accent-on-paper">
					{cert.year}
				</p>
				<p class="mt-3 font-[family-name:var(--font-display)] text-base leading-snug font-bold text-ink">
					{cert.name}
				</p>
				<!-- Pushed down so the three issuers share a line even when a
			     credential name wraps. -->
			<p class="mt-auto pt-3 text-sm text-ink-faint">{cert.issuer}</p>
			</div>
		{/each}
	</div>
</section>

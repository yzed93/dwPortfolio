<script lang="ts">
	import type { SiteContent } from '$lib/content';
	import { reveal } from '$lib/actions/reveal';

	let { content }: { content: SiteContent } = $props();
</script>

<section class="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[0.48fr_1fr] lg:gap-16">
	<h2
		use:reveal
		class="font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-tight text-ink md:text-6xl"
	>
		{content.certifications.title}
	</h2>

	<div class="border-t border-ink/20">
		{#each content.certifications.items as cert, i (cert.name)}
			<div use:reveal={i * 80} class="grid grid-cols-[4.5rem_1fr] gap-4 border-b border-ink/15 py-5 sm:grid-cols-[5rem_1fr_auto] sm:items-center">
				<p class="text-sm font-semibold text-ink-faint">{cert.year}</p>
				<p class="font-[family-name:var(--font-display)] text-base leading-snug font-bold text-ink">
					{cert.name}
				</p>
				<p class="col-start-2 text-xs font-semibold text-accent-on-paper sm:col-start-auto">
					{cert.issuer}
				</p>
			</div>
		{/each}
	</div>
</section>

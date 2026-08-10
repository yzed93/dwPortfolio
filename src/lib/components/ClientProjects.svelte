<script lang="ts">
	import type { SiteContent } from '$lib/content';
	import { reveal } from '$lib/actions/reveal';

	let { content }: { content: SiteContent } = $props();
</script>

<section id="projects" class="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
	<h2 use:reveal class="section-head text-ink">
		{content.projects.title}
	</h2>
	<p class="mt-4 max-w-[58ch] text-lg leading-relaxed text-ink-soft">{content.projects.intro}</p>

	<div class="mt-12 grid auto-rows-fr gap-5 md:grid-cols-2">
		{#each content.projects.items as p, i (p.id)}
			{@const featured = i === 0}
			<!--
				Plain rectangles on purpose. The facet notch is the site's signature,
				so it stays on the two full-bleed bordeaux surfaces and the case
				study image; notching every card turned it into wallpaper.
			-->
			<div
				use:reveal={i * 80}
				class="group flex h-full flex-col border p-7 transition-[transform,border-color] duration-300 ease-out hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:p-8 {featured
					? 'border-transparent bg-signal drop-shadow-[0_22px_48px_color-mix(in_srgb,var(--color-signal)_22%,transparent)]'
					: 'border-ink/12 bg-paper-raised hover:border-accent-on-paper/55'}"
			>
				<div class="flex items-baseline justify-between gap-4 border-b pb-4 text-xs {featured ? 'border-on-signal/18' : 'border-ink/10'}">
					<span class="font-medium {featured ? 'text-on-signal/75' : 'text-ink-soft'}">
						{p.sector}
					</span>
					<span class="{featured ? 'text-on-signal/60' : 'text-ink-faint'}">
						{p.period}
					</span>
				</div>

				<p
					class="mt-6 font-[family-name:var(--font-display)] font-bold tracking-tight {featured
						? 'text-3xl text-on-signal'
						: 'text-2xl text-accent-on-paper'}"
				>
					{p.scale}
				</p>
				<h3
					class="mt-2 font-[family-name:var(--font-display)] text-xl font-bold {featured
						? 'text-on-signal md:text-2xl'
						: 'text-ink'}"
				>
					{p.name}
				</h3>
				<p class="mt-2 text-sm leading-relaxed {featured ? 'text-on-signal/78' : 'text-ink-soft'}">
					{p.summary}
				</p>

				<ul class="mt-5 space-y-2">
					{#each p.bullets as bullet (bullet)}
						<li class="rule-item text-sm leading-relaxed {featured ? 'text-on-signal/78' : 'text-ink-soft'}">
							{bullet}
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
</section>

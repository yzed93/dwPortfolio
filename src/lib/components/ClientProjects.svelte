<script lang="ts">
	import type { SiteContent } from '$lib/content';
	import { reveal } from '$lib/actions/reveal';

	let { content }: { content: SiteContent } = $props();
</script>

<section id="projects" class="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
	<h2
		use:reveal
		class="font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-tight text-ink md:text-6xl"
	>
		{content.projects.title}
	</h2>
	<p class="mt-3 max-w-[60ch] text-lg text-ink-soft">{content.projects.intro}</p>

	<div class="mt-10 grid auto-rows-fr gap-5 md:grid-cols-2">
		{#each content.projects.items as p, i (p.id)}
			{@const featured = i === 0}
			<div
				use:reveal={i * 80}
				class="facet-card group flex h-full flex-col border p-7 transition-[transform,filter] duration-300 ease-out hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:p-8 {featured
					? 'border-transparent bg-signal drop-shadow-[0_22px_48px_color-mix(in_srgb,var(--color-signal)_22%,transparent)]'
					: 'border-ink/12 bg-paper-raised hover:drop-shadow-[5px_5px_0_var(--color-accent-on-paper)]'}"
			>
				<div class="flex items-start justify-between gap-4 border-b pb-4 {featured ? 'border-on-signal/18' : 'border-ink/10'}">
					<span
						class="text-xs font-semibold tracking-[0.12em] uppercase {featured
							? 'text-on-signal/80'
							: 'text-ink-soft'}"
					>
						{p.sector}
					</span>
					<span class="text-xs font-medium {featured ? 'text-on-signal/65' : 'text-ink-faint'}">
						{p.period}
					</span>
				</div>

				<p
					class="mt-6 font-[family-name:var(--font-display)] font-extrabold {featured
						? 'text-4xl text-on-signal'
						: 'text-3xl text-accent-on-paper'}"
				>
					{p.scale}
				</p>
				<h3
					class="mt-2 font-[family-name:var(--font-display)] font-bold {featured
						? 'text-2xl text-on-signal md:text-3xl'
						: 'text-xl text-ink'}"
				>
					{p.name}
				</h3>
				<p class="mt-2 text-sm {featured ? 'text-on-signal/78' : 'text-ink-soft'}">
					{p.summary}
				</p>

				<ul class="mt-4 space-y-1.5">
					{#each p.bullets as bullet (bullet)}
						<li class="flex gap-2.5 text-sm {featured ? 'text-on-signal/78' : 'text-ink-soft'}">
							<span
								class="mt-2 h-1 w-1 shrink-0 rounded-full {featured
									? 'bg-on-signal/55'
									: 'bg-ink/40'}"
							></span>
							{bullet}
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
</section>

<script lang="ts">
	import type { SiteContent } from '$lib/content';
	import { reveal } from '$lib/actions/reveal';

	let { content }: { content: SiteContent } = $props();
</script>

<section id="project" class="relative px-4 py-4 sm:px-6">
	<div class="facet-fall mx-auto max-w-6xl bg-paper-raised px-6 py-16 sm:px-10 md:py-20">
		<div class="grid items-center gap-10 lg:grid-cols-[0.68fr_1.32fr] lg:gap-14">
			<div use:reveal>
				<p class="text-sm font-semibold text-ink-faint">{content.project.title}</p>
				<h2
					class="mt-2 font-[family-name:var(--font-display)] text-6xl font-extrabold tracking-tight text-accent-on-paper md:text-8xl"
				>
					{content.project.name}
				</h2>
				<p class="mt-2 text-xl font-semibold text-ink">{content.project.tagline}</p>

				<p class="mt-6 max-w-[55ch] text-lg leading-relaxed text-ink-soft">
					{content.project.description}
				</p>

				<ul class="mt-7 grid grid-cols-2 border-t border-ink/15">
					{#each content.project.stack as tech (tech)}
						<li class="border-b border-ink/15 py-2.5 pr-3 text-sm text-ink-soft">
							{tech}
						</li>
					{/each}
				</ul>

				<a
					href={content.project.link}
					target="_blank"
					rel="noopener noreferrer"
					class="mt-8 inline-flex items-center gap-2 rounded-md bg-signal px-6 py-3 text-sm font-semibold text-on-signal transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
				>
					{content.project.cta} →
				</a>
			</div>

			<a
				use:reveal={100}
				href={content.project.link}
				target="_blank"
				rel="noopener noreferrer"
				class="facet-card group relative block overflow-hidden bg-paper drop-shadow-[0_28px_60px_color-mix(in_srgb,var(--color-signal)_22%,transparent)]"
				aria-label={content.project.cta}
			>
				<img
					src="/images/tabiyume-planner.jpg"
					alt={content.project.imageAlt}
					width="1600"
					height="1000"
					loading="lazy"
					decoding="async"
					class="aspect-[8/5] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.015] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
				/>
			</a>
		</div>
	</div>
</section>

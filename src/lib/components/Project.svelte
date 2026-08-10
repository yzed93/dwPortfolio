<script lang="ts">
	import type { SiteContent } from '$lib/content';
	import { reveal } from '$lib/actions/reveal';

	let { content }: { content: SiteContent } = $props();
</script>

<section id="project" class="relative px-4 py-4 sm:px-6">
	<div class="facet-fall mx-auto max-w-6xl bg-paper-raised px-6 py-16 sm:px-10 md:py-20">
		<div class="grid items-center gap-10 lg:grid-cols-[0.68fr_1.32fr] lg:gap-14">
			<div use:reveal>
				<p class="text-sm font-medium text-ink-faint">{content.project.title}</p>
				<h2
					class="mt-2 font-[family-name:var(--font-display)] text-[clamp(2.75rem,5.4vw,4.25rem)] leading-none font-extrabold tracking-[-0.045em] text-accent-on-paper"
				>
					{content.project.name}
				</h2>
				<p class="mt-3 text-lg font-semibold text-ink">{content.project.tagline}</p>

				<p class="mt-6 max-w-[52ch] leading-relaxed text-ink-soft">
					{content.project.description}
				</p>

				<!-- Grouped as a plain two-column index: the stack is supporting
				     detail, not a spec sheet that needs a rule under every entry. -->
				<ul class="mt-8 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-ink/15 pt-5">
					{#each content.project.stack as tech (tech)}
						<li class="text-sm text-ink-soft">
							{tech}
						</li>
					{/each}
				</ul>

				<a
					href={content.project.link}
					target="_blank"
					rel="noopener noreferrer"
					class="mt-8 inline-flex items-center gap-2 rounded-lg bg-signal px-6 py-3 text-sm font-semibold text-on-signal transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
				>
					{content.project.cta} →
				</a>
			</div>

			<a
				use:reveal={100}
				href={content.project.link}
				target="_blank"
				rel="noopener noreferrer"
				class="case-study-visual facet-card group relative block overflow-hidden bg-paper drop-shadow-[0_28px_60px_color-mix(in_srgb,var(--color-signal)_22%,transparent)]"
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

<style>
	.case-study-visual::after {
		position: absolute;
		inset: -45%;
		content: '';
		pointer-events: none;
		background: linear-gradient(
			112deg,
			transparent 38%,
			color-mix(in srgb, var(--color-on-signal) 18%, transparent) 49%,
			transparent 60%
		);
		opacity: 0;
		transform: translateX(-48%);
		transition:
			transform 0.75s cubic-bezier(0.16, 1, 0.3, 1),
			opacity 0.25s ease;
	}

	.case-study-visual:hover::after,
	.case-study-visual:focus-visible::after {
		opacity: 1;
		transform: translateX(48%);
	}

	@media (prefers-reduced-motion: reduce) {
		.case-study-visual::after {
			display: none;
		}
	}
</style>

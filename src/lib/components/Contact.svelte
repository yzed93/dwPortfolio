<script lang="ts">
	import type { SiteContent } from '$lib/content';
	import { reveal } from '$lib/actions/reveal';

	let { content }: { content: SiteContent } = $props();
</script>

<!--
	Credentials sit here rather than in a section of their own. They are the
	last thing that has to be true before someone writes the email, so they
	belong next to the address, not three screens above it.
-->
<section id="contact" class="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
	<div use:reveal class="grid gap-10 border-t border-ink/15 pt-10 lg:grid-cols-[1fr_0.62fr] lg:gap-16">
		<div>
			<h2 class="section-head text-ink">{content.contact.title}</h2>
			<p class="mt-4 max-w-[44ch] leading-relaxed text-ink-soft">{content.contact.intro}</p>

			<a
				href="mailto:{content.contact.email}"
				class="contact-mail mt-8 inline-block max-w-full break-words font-[family-name:var(--font-display)] text-[clamp(1.35rem,4vw,2.5rem)] leading-tight font-semibold text-accent-on-paper transition-colors"
			>
				{content.contact.email}
			</a>

			<p class="mt-8">
				<a
					href={content.cv.href}
					download
					class="inline-flex min-h-12 items-center rounded-lg border border-ink/40 px-5 py-3 text-sm font-medium text-ink transition-colors hover:border-accent-on-paper hover:text-accent-on-paper"
				>
					{content.cv.note}
				</a>
			</p>
		</div>

		<div>
			<h3 class="section-head-quiet text-ink">{content.credentials.title}</h3>
			<ul class="mt-6 border-t border-ink/15">
				{#each content.credentials.items as cert (cert.name)}
					<li class="grid grid-cols-[3.5rem_1fr] gap-4 border-b border-ink/12 py-4">
						<span class="figure text-sm text-accent-on-paper">{cert.year}</span>
						<span>
							<span class="block text-sm leading-snug font-medium text-ink">{cert.name}</span>
							<span class="meta mt-1 block text-ink-faint">{cert.issuer}</span>
						</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<style>
	/* A hairline rather than a heavy rule, in the same 1px language the rest of
	   the page uses. It still reads as a link at rest. */
	.contact-mail {
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 0.22em;
		text-decoration-color: color-mix(in srgb, var(--color-accent-on-paper) 45%, transparent);
		transition: text-decoration-color 220ms ease;
	}

	.contact-mail:hover,
	.contact-mail:focus-visible {
		text-decoration-color: var(--color-accent-on-paper);
	}

	@media (prefers-reduced-motion: reduce) {
		.contact-mail {
			transition: none;
		}
	}
</style>

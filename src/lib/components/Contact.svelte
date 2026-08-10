<script lang="ts">
	import type { SiteContent } from '$lib/content';
	import { reveal } from '$lib/actions/reveal';

	let { content }: { content: SiteContent } = $props();
</script>

<section id="contact" class="relative px-4 py-4 sm:px-6">
	<div use:reveal class="facet-rise mx-auto max-w-6xl bg-signal px-6 py-20 sm:px-10 md:py-24">
		<h2 class="section-head text-on-signal">
			{content.contact.title}
		</h2>

		<!-- The address is the whole point of the section, so it stays large, but
		     it sits on the same left edge as every other heading rather than
		     centred under a four-pixel underline. -->
		<a
			href="mailto:{content.contact.email}"
			class="contact-mail mt-8 inline-block max-w-full break-words font-[family-name:var(--font-display)] text-[clamp(1.35rem,4.6vw,3rem)] leading-tight font-bold text-on-signal transition-colors"
		>
			{content.contact.email}
		</a>
	</div>
</section>

<style>
	/* A hairline rather than a four-pixel rule, in the same 1px language the
	   rest of the page uses. It still reads as a link at rest. */
	.contact-mail {
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 0.22em;
		text-decoration-color: color-mix(in srgb, var(--color-on-signal) 45%, transparent);
		transition: text-decoration-color 220ms ease;
	}

	.contact-mail:hover,
	.contact-mail:focus-visible {
		text-decoration-color: var(--color-on-signal);
	}

	@media (prefers-reduced-motion: reduce) {
		.contact-mail {
			transition: none;
		}
	}
</style>

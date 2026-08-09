<script lang="ts">
	import type { SiteContent } from '$lib/content';
	import { reveal } from '$lib/actions/reveal';

	let { content }: { content: SiteContent } = $props();
</script>

<section id="contact" class="relative px-4 py-4 sm:px-6">
	<div
		use:reveal
		class="facet-rise mx-auto max-w-6xl bg-signal px-6 py-20 text-center sm:px-10 md:py-24"
	>
		<h2 class="font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-tight text-on-signal md:text-6xl">
			{content.contact.title}
		</h2>

		<a
			href="mailto:{content.contact.email}"
			class="mt-8 inline-block max-w-full break-words font-[family-name:var(--font-display)] text-[clamp(1.35rem,6vw,3.75rem)] leading-tight font-extrabold text-on-signal underline decoration-4 underline-offset-8 transition-opacity hover:opacity-80"
		>
			{content.contact.email}
		</a>
	</div>
</section>

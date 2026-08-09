<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { SiteContent } from '$lib/content';
	import { reveal } from '$lib/actions/reveal';
	import Copy from 'phosphor-svelte/lib/Copy';
	import Check from 'phosphor-svelte/lib/Check';
	import WarningCircle from 'phosphor-svelte/lib/WarningCircle';

	let { content }: { content: SiteContent } = $props();
	let copyState = $state<'idle' | 'copied' | 'error'>('idle');
	let resetTimer: ReturnType<typeof setTimeout> | undefined;

	async function copyEmail() {
		try {
			await navigator.clipboard.writeText(content.contact.email);
			copyState = 'copied';
		} catch {
			copyState = 'error';
		}
		clearTimeout(resetTimer);
		resetTimer = setTimeout(() => (copyState = 'idle'), 2200);
	}

	onDestroy(() => clearTimeout(resetTimer));
</script>

<section id="contact" class="relative px-4 py-4 sm:px-6">
	<div
		use:reveal
		class="facet-rise mx-auto max-w-6xl bg-signal px-6 py-20 text-center sm:px-10 md:py-24"
	>
		<h2 class="font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-tight text-on-signal md:text-6xl">
			{content.contact.title}
		</h2>
		<p class="mx-auto mt-3 max-w-[46ch] text-lg text-on-signal/75">{content.contact.description}</p>

		<a
			href="mailto:{content.contact.email}"
			class="mt-8 inline-block max-w-full break-words font-[family-name:var(--font-display)] text-[clamp(1.35rem,6vw,3.75rem)] leading-tight font-extrabold text-on-signal underline decoration-4 underline-offset-8 transition-opacity hover:opacity-80"
		>
			{content.contact.email}
		</a>

		<div class="mt-8 flex justify-center">
			<button
				type="button"
				onclick={copyEmail}
				class="flex min-h-11 items-center gap-2 rounded-md border border-on-signal/30 px-5 py-2.5 text-sm font-medium text-on-signal/80 transition-colors hover:border-on-signal hover:text-on-signal active:scale-[0.98]"
				aria-live="polite"
			>
				{#if copyState === 'copied'}
					<Check size={15} class="text-on-signal" />
					{content.contact.copied}
				{:else if copyState === 'error'}
					<WarningCircle size={15} class="text-on-signal" />
					{content.contact.copyFailed}
				{:else}
					<Copy size={15} />
					{content.contact.cta}
				{/if}
			</button>
		</div>
	</div>
</section>

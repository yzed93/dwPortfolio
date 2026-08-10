<script lang="ts">
	import type { SiteContent } from '$lib/content';
	import { reveal } from '$lib/actions/reveal';
	import CvButton from './CvButton.svelte';
	import Copy from 'phosphor-svelte/lib/Copy';
	import Check from 'phosphor-svelte/lib/Check';

	let { content }: { content: SiteContent } = $props();

	/*
		A mailto link only helps someone whose mail client is wired to the
		browser. A recruiter working in a webmail tab or pasting into an
		applicant system wants the string itself, and today has to select it by
		hand across a display-sized font.
	*/
	let copyState = $state<'idle' | 'copied' | 'selected'>('idle');
	let mailLink = $state<HTMLAnchorElement | null>(null);
	let timer: ReturnType<typeof setTimeout> | undefined;

	function announce(state: 'copied' | 'selected') {
		clearTimeout(timer);
		copyState = state;
		timer = setTimeout(() => (copyState = 'idle'), 2400);
	}

	async function copyAddress() {
		try {
			await navigator.clipboard.writeText(content.contact.email);
			announce('copied');
		} catch {
			/*
				The clipboard API is unavailable over plain http and can be denied
				outright. Rather than reporting a success that did not happen, put
				the address under the reader's selection so the keyboard shortcut
				they are about to reach for actually works.
			*/
			if (mailLink) {
				const range = document.createRange();
				range.selectNodeContents(mailLink);
				const selection = window.getSelection();
				selection?.removeAllRanges();
				selection?.addRange(range);
			}
			announce('selected');
		}
	}

	$effect(() => () => clearTimeout(timer));

	let copyLabel = $derived(
		copyState === 'copied'
			? content.contact.copied
			: copyState === 'selected'
				? content.contact.copyFallback
				: content.contact.copy
	);
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

			<div class="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
				<a
					bind:this={mailLink}
					href="mailto:{content.contact.email}"
					class="contact-mail max-w-full break-words font-[family-name:var(--font-display)] text-[clamp(1.35rem,4vw,2.5rem)] leading-tight font-semibold text-accent-on-paper transition-colors"
				>
					{content.contact.email}
				</a>

				<!--
					The accessible name stays "copy" through every state. A button
					whose name changes to "copied" is a button that now claims to do
					something it does not do, and paired with the status region below
					it would announce the same outcome twice.
				-->
				<button
					type="button"
					onclick={copyAddress}
					aria-label={content.contact.copy}
					data-state={copyState}
					class="copy-button meta flex min-h-11 items-center gap-2 rounded-lg border border-ink/25 px-3 text-ink-soft"
				>
					<span class="copy-icon" aria-hidden="true">
						<span class="copy-face" data-visible={copyState === 'idle'}>
							<Copy size={14} weight="bold" />
						</span>
						<span class="copy-face" data-visible={copyState !== 'idle'}>
							<Check size={14} weight="bold" />
						</span>
					</span>
					<!--
						All three labels occupy one grid cell, so the button is sized by
						the longest and cannot resize under the cursor that is pressing
						it. Measured before this: it grew from 136px to 165px on click.
					-->
					<span class="copy-label" aria-hidden="true">
						<span class="copy-face" data-visible={copyState === 'idle'}>
							{content.contact.copy}
						</span>
						<span class="copy-face" data-visible={copyState === 'copied'}>
							{content.contact.copied}
						</span>
						<span class="copy-face" data-visible={copyState === 'selected'}>
							{content.contact.copyFallback}
						</span>
					</span>
				</button>
			</div>
			<span role="status" class="sr-only" data-testid="copy-status">
				{copyState === 'idle' ? '' : copyLabel}
			</span>

			<p class="mt-8">
				<CvButton
					href={content.cv.href}
					label={content.cv.note}
					confirmLabel={content.cv.started}
					class="min-h-12 rounded-lg border border-ink/40 px-5 py-3 text-sm font-medium text-ink hover:border-accent-on-paper hover:text-accent-on-paper"
				/>
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

	.copy-button {
		transition:
			transform 160ms var(--ease-out-strong),
			border-color 200ms var(--ease-out-strong),
			color 200ms var(--ease-out-strong);
	}

	.copy-button:active {
		transform: scale(0.97);
	}

	.copy-button[data-state='copied'],
	.copy-button[data-state='selected'] {
		border-color: var(--color-accent-on-paper);
		color: var(--color-accent-on-paper);
	}

	.copy-icon,
	.copy-label {
		display: grid;
		grid-template-areas: 'stack';
		align-items: center;
		justify-items: start;
	}

	.copy-label .copy-face {
		white-space: nowrap;
	}

	.copy-face {
		grid-area: stack;
		transition:
			opacity 180ms var(--ease-out-strong),
			filter 180ms var(--ease-out-strong);
	}

	.copy-face[data-visible='false'] {
		opacity: 0;
		filter: blur(3px);
	}

	.copy-face[data-visible='true'] {
		opacity: 1;
		filter: blur(0);
	}

	@media (prefers-reduced-motion: reduce) {
		.contact-mail,
		.copy-button {
			transition-property: border-color, color;
		}
		.copy-button:active {
			transform: none;
		}
		.copy-face[data-visible='false'] {
			filter: none;
		}
	}
</style>

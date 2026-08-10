<script lang="ts">
	import DownloadSimple from 'phosphor-svelte/lib/DownloadSimple';
	import Check from 'phosphor-svelte/lib/Check';

	let {
		href,
		label,
		confirmLabel,
		class: className = ''
	}: { href: string; label: string; confirmLabel: string; class?: string } = $props();

	/*
		A download link is the one action on this page with real stakes, and by
		default it is completely silent: the file lands in a folder the reader
		cannot see from here. The confirmation says only what is actually true,
		that the download started. It never claims completion, because the page
		has no way to know that.
	*/
	let confirmed = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	function confirm() {
		clearTimeout(timer);
		confirmed = true;
		timer = setTimeout(() => (confirmed = false), 2400);
	}

	$effect(() => () => clearTimeout(timer));
</script>

<!--
	Both labels stay in the layout at once, stacked in a single grid cell. The
	button is therefore as wide as the longer of the two and cannot resize when
	the state flips: a control that jumps while being clicked is worse than one
	that says nothing.

	The visible pair is hidden from assistive tech and the link keeps a stable
	accessible name, so the confirmation is announced once through the status
	region rather than the name changing under the user.
-->
<a
	{href}
	download
	onclick={confirm}
	aria-label={label}
	data-confirmed={confirmed}
	class="cv-button {className}"
>
	<span class="cv-icon" aria-hidden="true">
		<span class="cv-icon-face" data-visible={!confirmed}>
			<DownloadSimple size={15} weight="bold" />
		</span>
		<span class="cv-icon-face" data-visible={confirmed}>
			<Check size={15} weight="bold" />
		</span>
	</span>

	<span class="cv-label" aria-hidden="true">
		<span class="cv-label-face" data-visible={!confirmed}>{label}</span>
		<span class="cv-label-face" data-visible={confirmed}>{confirmLabel}</span>
	</span>
</a>
<span role="status" class="sr-only">{confirmed ? confirmLabel : ''}</span>

<style>
	.cv-button {
		display: inline-flex;
		gap: 0.5rem;
		align-items: center;
		justify-content: center;
		transition:
			transform 160ms var(--ease-out-strong),
			border-color 200ms var(--ease-out-strong),
			color 200ms var(--ease-out-strong);
	}

	/* Instant physical feedback: the control confirms it heard the press
	   before the browser has done anything at all. */
	.cv-button:active {
		transform: scale(0.97);
	}

	.cv-button[data-confirmed='true'] {
		border-color: var(--color-accent-on-paper);
		color: var(--color-accent-on-paper);
	}

	.cv-icon,
	.cv-label {
		display: grid;
		grid-template-areas: 'stack';
		align-items: center;
	}

	.cv-icon-face,
	.cv-label-face {
		grid-area: stack;
		transition:
			opacity 180ms var(--ease-out-strong),
			filter 180ms var(--ease-out-strong);
	}

	.cv-label-face {
		white-space: nowrap;
	}

	/*
		Blur across the swap. Without it the eye sees two separate words
		overlapping mid-crossfade; the blur blends them into one word changing.
	*/
	.cv-icon-face[data-visible='false'],
	.cv-label-face[data-visible='false'] {
		opacity: 0;
		filter: blur(3px);
	}

	.cv-icon-face[data-visible='true'],
	.cv-label-face[data-visible='true'] {
		opacity: 1;
		filter: blur(0);
	}

	@media (prefers-reduced-motion: reduce) {
		.cv-button,
		.cv-icon-face,
		.cv-label-face {
			transition-property: opacity, border-color, color;
		}
		.cv-button:active {
			transform: none;
		}
		/* Reduced motion means gentler, not silent: the swap still happens, it
		   just stops moving and blurring. */
		.cv-icon-face[data-visible='false'],
		.cv-label-face[data-visible='false'] {
			filter: none;
		}
	}
</style>

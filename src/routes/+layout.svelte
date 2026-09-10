<script lang="ts">
	import '../app.css';
	import { tick } from 'svelte';
	import { langState } from '$lib/state/lang.svelte';
	import Nav from '$lib/components/Nav.svelte';
	import { page } from '$app/state';
	import PrivateGate from '$lib/components/PrivateGate.svelte';
	import PrivateSite from '$lib/components/PrivateSite.svelte';
	import type { PrivateContent } from '$lib/private-content';
	let privateContent = $state<PrivateContent | null>(null);
	let overview = $derived(page.url.pathname === '/' || page.url.pathname === '/light');

	/*
		The mode switch is a state change, not a navigation, so the view
		transition has to be started by hand. The direction is stamped on the
		document because the curtain draws down into the private side and lifts
		back off it, and a pseudo-element cannot read component state.
	*/
	function swapMode(to: 'private' | 'business', apply: () => void) {
		const run = () => { apply(); window.scrollTo({ top: 0, behavior: 'instant' }); };
		if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) { run(); return; }
		document.documentElement.dataset.modeSwitch = to;
		document.startViewTransition(() => { run(); return tick(); });
	}
	function lock() { swapMode('business', () => { privateContent = null; }); }
	function unlock(content: PrivateContent) { swapMode('private', () => { privateContent = content; }); }
	$effect(() => { if (!overview) privateContent = null; });

	let { children } = $props();

	// app.html ships lang="en"; keep the document in sync with both the
	// initial detection and every later switch, for screen readers and SEO.
	$effect(() => {
		document.documentElement.lang = langState.current;
	});
</script>

<!--
	The shell lives here rather than in a page component, because the case
	study pages under /projekte/ need the same header and skip link as the
	overview and should not have to reassemble them.
-->
<a
	href="#main-content"
	class="fixed top-3 left-3 z-[80] -translate-y-24 rounded-xl bg-ink px-4 py-3 font-semibold text-paper transition-transform focus:translate-y-0"
>
	{langState.current === 'de' ? 'Zum Inhalt springen' : 'Skip to content'}
</a>
{#if overview}
	<PrivateGate active={privateContent !== null} onlock={lock} onunlock={unlock} />
{/if}
<div class:has-mode-bar={overview}>
{#if !privateContent}<Nav />{/if}
<main id="main-content" tabindex="-1">
	{#if privateContent}<PrivateSite content={privateContent} />{:else}{@render children()}{/if}
</main>
</div>

<style>
	.has-mode-bar { padding-top: 52px; }
	.has-mode-bar :global(.site-header) { top: 52px; }

	/*
		Business and private are two halves of one page, so the switch between
		them reads as a curtain rather than a cut. The view-transition pseudos
		hang off html itself, so these selectors carry no descendant space, and
		the UA's plus-lighter blending has to go: it exists to make a
		cross-fade look right and blows out the overlap of a clipped wipe.
	*/
	:global(html[data-mode-switch]::view-transition-old(root)),
	:global(html[data-mode-switch]::view-transition-new(root)) {
		mix-blend-mode: normal;
	}
	:global(html[data-mode-switch]::view-transition-old(root)) {
		animation: vt-recede 620ms cubic-bezier(.4, 0, .2, 1) both;
	}
	:global(html[data-mode-switch='private']::view-transition-new(root)) {
		animation: vt-draw-down 620ms cubic-bezier(.22, 1, .36, 1) both;
	}
	:global(html[data-mode-switch='business']::view-transition-new(root)) {
		animation: vt-draw-up 620ms cubic-bezier(.22, 1, .36, 1) both;
	}
	/* The mode bar is the hinge: it stays put and only its colours cross over. */
	:global(html[data-mode-switch]::view-transition-group(mode-bar)) { animation-duration: 620ms; }

	@keyframes vt-recede {
		from { opacity: 1; transform: scale(1); }
		72% { opacity: .94; }
		to { opacity: 0; transform: scale(.985); }
	}
	@keyframes vt-draw-down {
		from { clip-path: inset(0 0 100% 0); }
		to { clip-path: inset(0 0 0 0); }
	}
	@keyframes vt-draw-up {
		from { clip-path: inset(100% 0 0 0); }
		to { clip-path: inset(0 0 0 0); }
	}
	@media (prefers-reduced-motion: reduce) {
		:global(html::view-transition-group(*)),
		:global(html::view-transition-old(*)),
		:global(html::view-transition-new(*)) { animation: none !important; }
	}
</style>

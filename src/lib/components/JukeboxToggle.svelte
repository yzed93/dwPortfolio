<script lang="ts">
	import Pause from 'phosphor-svelte/lib/Pause';
	import Play from 'phosphor-svelte/lib/Play';
	import { jukebox } from '$lib/jukebox.svelte';
</script>

<!--
	The switch at the top of the page. It says what it will do, not what it is,
	and it is the only control the visitor needs to find: everything else about
	the music lives further down, where the music section already is.
-->
<button
	class="ambient"
	class:on={jukebox.playing}
	type="button"
	onclick={() => jukebox.toggle()}
	aria-label={jukebox.playing ? 'Musik pausieren' : 'Musik anschalten'}
>
	<span class="glyph" aria-hidden="true">
		{#if jukebox.playing}<Pause size={11} weight="fill" />{:else}<Play size={11} weight="fill" />{/if}
	</span>
	<span class="text">{jukebox.playing ? 'Musik läuft' : 'Musik an'}</span>
	<span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>
</button>

<style>
	.ambient {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		padding: 8px 14px 8px 10px;
		border: 1px solid #906449;
		border-radius: 999px;
		color: #dfc58f;
		font-size: 12px;
		cursor: pointer;
		transition: border-color 200ms, color 200ms, background 200ms;
	}
	.ambient:hover { border-color: var(--gold); color: var(--paper); background: #6a2839; }
	.ambient.on { border-color: var(--gold); color: var(--gold); }
	.glyph { display: inline-flex; }

	/* Three bars that only move while sound is actually coming out. */
	.bars { display: flex; align-items: flex-end; gap: 2px; height: 10px; }
	.bars i { width: 2px; height: 3px; background: currentColor; opacity: .55; }
	.on .bars i { opacity: 1; animation: bob 1100ms ease-in-out infinite; }
	.on .bars i:nth-child(2) { animation-duration: 780ms; }
	.on .bars i:nth-child(3) { animation-duration: 1350ms; }
	@keyframes bob {
		0%, 100% { height: 3px; }
		50% { height: 10px; }
	}

	button:focus-visible { outline: 3px solid var(--gold); outline-offset: 4px; }

	@media (max-width: 640px) {
		/* Icon only, but the finger target stays a full one. */
		.ambient { position: relative; padding: 9px 13px; gap: 7px; }
		.ambient::after { content: ''; position: absolute; inset: -6px -4px; }
		.text { display: none; }
	}
	@media (prefers-reduced-motion: reduce) {
		.ambient { transition: none; }
		.on .bars i { animation: none; height: 10px; }
		.on .bars i:nth-child(2) { height: 6px; }
		.on .bars i:nth-child(3) { height: 8px; }
	}
</style>

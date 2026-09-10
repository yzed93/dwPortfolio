<script lang="ts">
	import Pause from 'phosphor-svelte/lib/Pause';
	import Play from 'phosphor-svelte/lib/Play';
	import SkipForward from 'phosphor-svelte/lib/SkipForward';
	import { PLAYLIST, clock, jukebox } from '$lib/jukebox.svelte';

	/*
		The second surface onto the same jukebox. It is a radio, not a media
		player: play, skip, a clock and a hairline of progress. No seeking and
		no volume, because neither belongs to the gesture of putting something
		on in the background, and leaving them out keeps this to two real
		buttons instead of a slider with its own keyboard model.
	*/
</script>

<div class="panel" data-playing={jukebox.playing}>
	<div class="now-playing">
		<p aria-live="polite">{jukebox.track.title}<span class="artist">{jukebox.track.artist}</span></p>
	</div>

	<div class="transport">
		<button class="play" type="button" onclick={() => jukebox.toggle()} aria-label={jukebox.playing ? 'Pause' : 'Abspielen'}>
			{#if jukebox.playing}<Pause size={17} weight="fill" />{:else}<Play size={17} weight="fill" />{/if}
		</button>
		<button class="skip" type="button" onclick={() => jukebox.next()} aria-label="Nächster Titel">
			<SkipForward size={15} weight="fill" />
		</button>
		<span class="time">
			<span class="of">{String(jukebox.index + 1).padStart(2, '0')} / {String(PLAYLIST.length).padStart(2, '0')}</span>
			{clock(jukebox.elapsed)} <span aria-hidden="true">/</span> {clock(jukebox.duration)}
		</span>
	</div>

	<span class="line" aria-hidden="true"><span class="fill" style:transform="scaleX({jukebox.progress})"></span></span>

	{#if jukebox.failed}
		<p class="failed" role="status">Der Titel lässt sich gerade nicht laden. Der nächste geht vielleicht.</p>
	{/if}
	{#if jukebox.track.credit}
		<small><a href={jukebox.track.credit.href} rel="noopener noreferrer" target="_blank">{jukebox.track.credit.text}</a></small>
	{/if}
</div>

<style>
	.panel { padding-top: 22px; }
	.now-playing { min-height: 78px; }
	.now-playing p { font-size: 26px; letter-spacing: -.025em; line-height: 1.2; font-weight: 550; }
	.artist { display: block; margin-top: 6px; font-size: 12px; font-weight: 400; letter-spacing: 0; color: #71535b; }

	.transport { display: flex; align-items: center; gap: 12px; margin-top: 14px; }
	button { display: grid; place-items: center; border-radius: 50%; cursor: pointer; transition: background 200ms, color 200ms, transform 250ms cubic-bezier(.22,1,.36,1); }
	.play { width: 44px; height: 44px; background: var(--wine); color: var(--paper); }
	.play:hover { background: var(--deep-wine); transform: scale(1.06); }
	/* Skip stays visually secondary to play, but the finger target does not. */
	.skip { position: relative; width: 36px; height: 36px; color: var(--wine); border: 1px solid #a98a53; }
	.skip::after { content: ''; position: absolute; inset: -4px; border-radius: 50%; }
	.skip:hover { background: var(--wine); color: var(--paper); border-color: var(--wine); }
	button:active { transform: none; }
	/* Tabular figures so the clock does not jitter while it counts. */
	.time { display: flex; align-items: baseline; gap: 14px; margin-left: auto; font-size: 11px; color: #71535b; font-variant-numeric: tabular-nums; }
	.of { padding-right: 14px; border-right: 1px solid #cbb894; }

	.line { display: block; height: 1px; margin-top: 20px; background: #cbb894; overflow: clip; }
	.fill { display: block; height: 100%; background: var(--wine); transform-origin: left; transition: transform 220ms linear; }

	.failed { margin-top: 14px; font-size: 12px; line-height: 1.5; color: #822446; }
	small { display: block; margin-top: 12px; font-size: 10px; color: #71535b; }
	a { text-decoration: underline; text-underline-offset: 3px; }
	button:focus-visible, a:focus-visible { outline: 3px solid var(--wine); outline-offset: 4px; }

	@media (max-width: 640px) {
		.now-playing { min-height: 76px; }
		.now-playing p { font-size: 23px; }
	}
	@media (prefers-reduced-motion: reduce) {
		button, .fill { transition: none; }
	}
</style>

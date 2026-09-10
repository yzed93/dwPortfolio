<script lang="ts">
	import ArrowDown from 'phosphor-svelte/lib/ArrowDown';
	import ArrowUp from 'phosphor-svelte/lib/ArrowUp';
	import ArrowUpRight from 'phosphor-svelte/lib/ArrowUpRight';
	import JukeboxPanel from '$lib/components/JukeboxPanel.svelte';
	import JukeboxToggle from '$lib/components/JukeboxToggle.svelte';
	import { jukebox } from '$lib/jukebox.svelte';
	import { onDestroy } from 'svelte';
	import type { PrivateContent } from '$lib/private-content';
	let { content }: { content: PrivateContent } = $props();
	let noteIndex = $state(0);
	// The music belongs to the private world; locking the page takes it with it.
	onDestroy(() => jukebox.stop());
</script>

<svelte:head><title>Dennis Wiredu | Privat</title></svelte:head>

{#snippet photo(slot: string, label: string)}
	<div class="frame">
		{#if content.photos?.[slot]}
			<img src={content.photos[slot]} alt={label} loading={slot === 'portrait' ? 'eager' : 'lazy'} />
		{:else}
			<div class="photo-placeholder"><span class="crop top-left" aria-hidden="true"></span><span class="crop bottom-right" aria-hidden="true"></span><span>{label}</span><small>Dein Foto findet hier seinen Platz.</small></div>
		{/if}
	</div>
{/snippet}

<div class="private-world" lang="de">
	<div class="bordeaux">
		<header><a href="#private-top" class="signature">dennis<span>.</span></a><nav aria-label="Persönliche Einblicke"><a href="#momente">Momente</a><a href="#gerade">Gerade jetzt</a><a href="#fundstuecke">Gedanken</a></nav><JukeboxToggle /><span class="demo">Porträtentwurf / Beispielinhalte</span></header>
		<section class="opening" id="private-top"><figure class="portrait">{@render photo('portrait', 'Ein Porträt von dir')}<figcaption>{content.portraitCaption}</figcaption></figure><div class="hello"><h1>{content.title}</h1><p>{content.intro}</p><a href="#momente" class="explore">Ein Stück näher kennenlernen <span class="icon" aria-hidden="true"><ArrowDown size={15} weight="bold" /></span></a><p class="handwritten">{content.note}</p></div></section>
		<div class="intro-end"><span>Ein kleines Porträt, das weiterwächst.</span><span>Fotos. Fundstücke. Was gerade bleibt.</span></div>
	</div>
	<div class="board">
		<h2 class="title-a" id="momente">Das Leben<br/>dazwischen.</h2>
		<p class="lede lede-a">Die kleinen Augenblicke erzählen manchmal die größeren Geschichten.</p>
		<figure class="postcard">{@render photo('moment', 'Ein Moment, den du behalten möchtest')}<figcaption><h3>{content.storyTitle}</h3><p>{content.story}</p></figcaption></figure>
		<figure class="snapshot">{@render photo('detail', 'Ein Detail aus deinem Alltag')}<figcaption>{content.detailCaption}</figcaption></figure>
		<p class="margin-note">{content.momentNote}</p>

		<h2 class="title-b" id="gerade">Gerade ein Teil<br/>von mir.</h2>
		<p class="lede lede-b">Was auf dem Nachttisch liegt. Was im Kopf weiterspielt.</p>
		<article class="reading"><div class="book-cover"><span>Zuletzt gelesen</span><strong>{content.bookTitle}</strong><span>{content.bookAuthor}</span></div><div class="book-thought"><span class="label">Was bei mir hängen geblieben ist</span><h3>{content.bookHeading}</h3><p>{content.bookThought}</p><small>Fiktiver Buchtitel und Beispieltext</small></div></article>
		<article class="music"><span class="label">Was gerade läuft</span><JukeboxPanel /><p class="music-note">{content.musicNote}</p><div class="picks"><span class="label">Mein kleiner Soundtrack</span><ul>{#each content.tracks as title}<li>{title}</li>{/each}</ul></div><small>Beispieltitel im Soundtrack</small></article>

		<h2 class="title-c" id="fundstuecke">Eine kleine<br/>Randnotiz.</h2>
		<article class="thought"><p aria-live="polite">{#key noteIndex}<span class="swap">{content.notes[noteIndex]}</span>{/key}</p><div class="thought-actions"><button onclick={() => noteIndex = (noteIndex + 1) % content.notes.length}>Noch ein Fundstück <span class="icon" aria-hidden="true"><ArrowUpRight size={15} weight="bold" /></span></button><small>{noteIndex + 1} / {content.notes.length}</small></div></article>
	</div>
	<footer><div class="footer-inner"><figure class="closing-photo">{@render photo('closing', 'Ein letzter Augenblick')}</figure><div><h2>{content.closing}</h2><p>{content.outro}</p><span class="closing-signature">Dennis.</span></div></div><div class="footer-bottom"><span>Ein Einblick. Kein vollständiges Bild.</span><a href="#private-top" class="to-top">Zurück nach oben <span class="icon" aria-hidden="true"><ArrowUp size={13} weight="bold" /></span></a></div></footer>
</div>

<style>
	.private-world { --wine: #541b2c; --deep-wine: #3c1321; --gold: #c4a365; --paper: #f3eee4; --ink: #482332; background: var(--paper); color: var(--ink); min-height: 100vh; font-family: var(--font-sans); overflow: clip; }
	.private-world ::selection { background: var(--gold); color: var(--deep-wine); }
	.private-world :global(svg) { display: block; flex-shrink: 0; }
	.icon { display: inline-flex; }
	/* The page owns the chrome it did not draw: the business scrollbar in
	   app.css is neutral ink on neutral paper and reads as a leak here. */
	:global(html:has(.private-world)) { scrollbar-color: #96697a #e4d9c6; }
	:global(html:has(.private-world) ::-webkit-scrollbar-track) { background: #e4d9c6; }
	:global(html:has(.private-world) ::-webkit-scrollbar-thumb) { border-color: #e4d9c6; background: #96697a; }
	:global(html:has(.private-world) ::-webkit-scrollbar-thumb:hover) { background: var(--wine); }
	.bordeaux { background: var(--wine); color: var(--paper); padding: 0 clamp(24px,6vw,100px); }
	header { min-height: 105px; display: flex; align-items: center; gap: 35px; max-width: 1300px; margin: auto; }
	.signature { font-weight: 750; font-size: 30px; letter-spacing: -.04em; margin-right: auto; }
	.signature span { color: var(--gold); }
	header :global(.ambient) { margin-left: 4px; }
	nav { display: flex; gap: 26px; font-size: 13px; }
	nav a { padding: 12px 0; }
	.demo { color: #d3bdb6; font-size: 10px; margin-left: 25px; }
	.opening { display: grid; grid-template-columns: 1.05fr 1fr; gap: clamp(40px,6vw,100px); align-items: center; max-width: 1300px; margin: auto; padding: 30px 0 64px; scroll-margin-top: 70px; }
	.portrait { --rest: 0deg; --loose: -2.5deg; margin: 0; transform: rotate(var(--rest)); }
	.portrait > :global(.frame) { aspect-ratio: 4 / 4.5; }
	:global(.private-world .frame) { display: block; position: relative; width: 100%; overflow: clip; }
	:global(.private-world .frame > *) { display: block; width: 100%; height: 100%; }
	:global(.private-world img) { object-fit: cover; }
	.portrait figcaption { font-size: 12px; line-height: 1.6; color: #dac6ba; margin: 16px 0 0; }
	h1 { font-size: clamp(48px,6.6vw,92px); font-weight: 650; line-height: 1.03; letter-spacing: -.04em; }
	.hello > p:not(.handwritten) { max-width: 390px; font-size: 16px; line-height: 1.85; margin-top: 28px; color: #e3d2c6; }
	.explore { display: inline-flex; align-items: center; gap: 24px; padding: 12px 0; margin-top: 28px; border-bottom: 1px solid var(--gold); color: #dfc58f; font-size: 13px; transition: color 200ms, border-color 200ms; }
	.explore:hover { color: var(--paper); border-color: var(--paper); }
	.explore .icon { transition: transform 300ms cubic-bezier(.22,1,.36,1); }
	.explore:hover .icon { transform: translateY(3px); }
	.handwritten { color: #d5b978; font: italic 25px/1.25 var(--font-display); transform: rotate(-5deg); margin: 48px 0 0 30px; max-width: 270px; }
	.intro-end { display: flex; justify-content: space-between; gap: 18px; max-width: 1300px; margin: auto; border-top: 1px solid #906449; padding: 20px 0; font-size: 11px; color: #dac6ba; }
	h2 { font-size: clamp(34px,4.4vw,60px); line-height: 1.08; font-weight: 600; letter-spacing: -.035em; }
	/*
		The pinboard. The page used to be five full-width bands, each a heading
		on the left and its content on the right, which is the rhythm every
		other portfolio has. Here the bands are gone: one continuous wall, and
		the things on it are placed rather than stacked. Sizes differ, edges do
		not align, and a few objects cross a boundary on purpose.

		Placement is explicit line numbers rather than template areas, because
		areas cannot overlap and the overlaps are the point. DOM order stays
		the reading order, so keyboard and screen readers are unaffected by
		where a thing happens to sit.
	*/
	.board {
		background: #eee6d8;
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: clamp(16px, 2vw, 34px);
		row-gap: clamp(14px, 2vw, 30px);
		align-content: start;
		padding: 0 clamp(24px, 6vw, 100px) clamp(90px, 10vw, 150px);
	}
	.board > * { min-width: 0; }
	h2 { font-size: clamp(34px,4.4vw,60px); line-height: 1.08; font-weight: 600; letter-spacing: -.035em; scroll-margin-top: 80px; }
	.lede { font-size: 14px; line-height: 1.7; color: #745d61; max-width: 34ch; }

	.title-a { grid-column: 8 / 13; grid-row: 1; margin-top: clamp(70px, 9vw, 130px); }
	.lede-a { grid-column: 8 / 12; grid-row: 2; margin-top: 22px; }
	/* The postcard is pinned across the seam between the wine and the wall. */
	.postcard { grid-column: 1 / 7; grid-row: 1 / 4; z-index: 3; margin-top: clamp(-140px, -8vw, -60px); }
	.snapshot { grid-column: 8 / 12; grid-row: 3; margin-top: clamp(24px, 4vw, 56px); }
	/* Clear of the postcard's column, or the pin would sit on top of the note. */
	.margin-note { grid-column: 3 / 8; grid-row: 4; margin-top: clamp(8px, 2vw, 28px); }

	/*
		From here the eye is walked in a zig-zag rather than down two columns.
		The jukebox holds the right edge for three rows while the left side
		steps heading, lede, book; the last heading then crosses back to the
		right. No two adjacent blocks share a left edge.
	*/
	.title-b { grid-column: 1 / 6; grid-row: 5; margin-top: clamp(50px, 6vw, 92px); }
	.lede-b { grid-column: 1 / 5; grid-row: 6; margin-top: 18px; align-self: start; }
	.music { grid-column: 8 / 13; grid-row: 5 / 8; margin-top: clamp(20px, 3vw, 44px); }
	.reading { grid-column: 1 / 7; grid-row: 7; margin-top: clamp(28px, 4vw, 54px); }
	.title-c { grid-column: 6 / 12; grid-row: 8; margin-top: clamp(34px, 4vw, 64px); }
	.thought { grid-column: 1 / 11; grid-row: 9; margin-top: clamp(24px, 3vw, 48px); }

	/*
		Two hairlines, and only two. A wall of pinned things needs something
		holding it together, but a line for every relation is a diagram, not a
		wall: these tie each heading to the object it is talking about, and
		they go when the collage linearises.
	*/
	.title-a, .title-b { position: relative; }
	.title-a::after, .title-b::after {
		content: '';
		position: absolute;
		top: .58em;
		width: clamp(40px, 7vw, 120px);
		height: 1px;
		background: #c2a478;
	}
	.title-a::after { right: 100%; margin-right: 26px; }
	.title-b::after { left: 100%; margin-left: 26px; }
	.postcard { --rest: -2deg; --loose: -6deg; background: #fffcf5; padding: 16px; transform: rotate(var(--rest)); margin-bottom: 0; box-shadow: 0 18px 44px #4823321f; }
	.postcard > :global(.frame) { aspect-ratio: 4 / 3; }
	.postcard figcaption { padding: 22px 12px 12px; }
	h3 { font-size: 26px; line-height: 1.2; letter-spacing: -.02em; font-weight: 600; }
	.postcard p { font-size: 14px; line-height: 1.75; margin-top: 13px; max-width: 56ch; }
	.snapshot { --rest: 3deg; --loose: 8deg; margin: 0; transform: rotate(var(--rest)); }
	.snapshot > :global(.frame) { aspect-ratio: 1; box-shadow: 0 10px 26px #4823321f; }
	.snapshot figcaption { font-size: 12px; margin-top: 14px; color: #745d61; }
	.margin-note { font: italic clamp(24px, 2.6vw, 32px)/1.25 var(--font-display); max-width: 22ch; color: var(--wine); transform: rotate(-2.5deg); }
	.reading { display: grid; grid-template-columns: minmax(150px,.85fr) 1fr; gap: clamp(22px, 3vw, 40px); align-items: center; }
	.book-cover { background: var(--wine); color: #e2c78e; padding: 25px; min-height: 300px; display: flex; flex-direction: column; justify-content: space-between; transform: rotate(-5deg); box-shadow: 4px 12px 20px #48233222; border-radius: 2px 5px 5px 2px; }
	.book-cover strong { font: 500 38px/1.04 var(--font-display); overflow-wrap: break-word; hyphens: auto; }
	.book-cover span { font-size: 10px; }
	.label { font-size: 11px; color: #71535b; display: block; }
	.book-thought h3 { margin-top: 16px; font-size: 25px; }
	.book-thought p, .music-note { font-size: 14px; line-height: 1.75; margin: 18px 0; max-width: 62ch; }
	small { font-size: 10px; color: #71535b; }
	.music { border-top: 1px solid #a98a53; padding-top: 18px; }
	.thought > p { font-size: clamp(26px,3.2vw,43px); }
	.picks { margin-top: 26px; padding-top: 20px; border-top: 1px solid #cbb894; }
	.picks ul { margin-top: 12px; display: grid; gap: 7px; list-style: none; }
	.picks li { font-size: 14px; line-height: 1.45; text-indent: -14px; padding-left: 14px; }
	.picks li::before { content: '·'; margin-right: 8px; color: #a98a53; }
	.music > small { display: block; margin-top: 22px; }
	.thought > p { font-size: clamp(26px,3.2vw,43px); font-weight: 450; line-height: 1.3; letter-spacing: -.025em; min-height: 175px; }
	.thought-actions { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-top: 25px; }
	.thought button { display: flex; align-items: center; gap: 24px; border-bottom: 1px solid #9c7841; padding: 12px 0; font-size: 13px; cursor: pointer; transition: border-color 200ms; }
	.thought button:hover { border-color: var(--wine); }
	.thought button .icon { transition: transform 300ms cubic-bezier(.22,1,.36,1); }
	.thought button:hover .icon { transform: translate(3px, -3px); }
	.to-top { display: inline-flex; align-items: center; gap: 8px; }
	.to-top .icon { transition: transform 300ms cubic-bezier(.22,1,.36,1); }
	.to-top:hover .icon { transform: translateY(-3px); }
	footer { background: var(--deep-wine); color: var(--paper); padding: 60px clamp(24px,6vw,100px) 0; }
	.footer-inner { display: grid; grid-template-columns: 220px 1fr; align-items: center; gap: 70px; max-width: 1000px; margin: 0 auto 50px; }
	.closing-photo { --rest: -4deg; --loose: -9.5deg; margin: 0; transform: rotate(var(--rest)); }
	.closing-photo > :global(.frame) { aspect-ratio: 4 / 3; box-shadow: 0 10px 26px #1c081059; }
	footer h2 { font-size: clamp(30px,3.8vw,48px); max-width: 630px; }
	footer p { font-size: 14px; color: #dac6ba; margin-top: 18px; max-width: 58ch; }
	.closing-signature { display: block; font: italic 38px var(--font-display); margin-top: 28px; color: var(--gold); }
	.footer-bottom { display: flex; justify-content: space-between; gap: 20px; border-top: 1px solid #7c5145; padding: 22px 0; font-size: 11px; color: #dac6ba; }
	:global(.private-world .photo-placeholder) { position: relative; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 15px; padding: 35px; text-align: center; background: #d8c9b5; color: #65453d; }
	:global(.private-world .portrait .photo-placeholder) { background: #723b49; color: #e2c78e; }
	:global(.private-world .snapshot .photo-placeholder) { background: #bbb39d; color: #423d2c; }
	:global(.private-world .closing-photo .photo-placeholder) { background: #6d4247; color: #e2c78e; padding: 20px; }
	.photo-placeholder > span:not(.crop) { font: 400 clamp(20px,2.5vw,34px)/1.15 var(--font-display); max-width: 240px; }
	.photo-placeholder small { color: inherit; opacity: .9; max-width: 200px; }
	.crop { position: absolute; width: 22px; height: 22px; border-color: currentColor; opacity: .5; }
	.top-left { top: 18px; left: 18px; border-top: 1px solid; border-left: 1px solid; }
	.bottom-right { bottom: 18px; right: 18px; border-bottom: 1px solid; border-right: 1px solid; }
	a, button { text-underline-offset: 5px; }
	/* Gold clears 3:1 on the wine surfaces but only 2.8:1 on paper, so the
	   ring takes the colour of whichever half of the page it lands on. */
	a:focus-visible, button:focus-visible { outline: 3px solid var(--wine); outline-offset: 5px; }
	.bordeaux a:focus-visible, footer a:focus-visible { outline-color: var(--gold); }
	a:hover, button:hover { text-decoration: underline; }
	.explore:hover, .thought button:hover { text-decoration: none; }
	.swap { display: block; animation: swap-in 340ms cubic-bezier(.22,1,.36,1); }
	@keyframes unfold { from { opacity: .4; transform: translateY(18px); } to { opacity: 1; transform: none; } }
	@supports not (view-transition-name: none) { .private-world { animation: unfold 600ms cubic-bezier(.22,1,.36,1); } }

	/*
		The album pass. Every photograph on this page arrives the way a print
		arrives out of a developer tray: soft and loose first, then sharp and
		square. Scroll drives it, so the timing belongs to the reader rather
		than to a timer. The resting state is the default, so without
		scroll-driven animation support the page is simply already developed.
	*/
	@keyframes develop {
		from { opacity: 0; filter: blur(9px) saturate(.55) contrast(.92); transform: rotate(var(--loose)) translateY(30px) scale(.965); }
		to { opacity: 1; filter: blur(0) saturate(1) contrast(1); transform: rotate(var(--rest)) translateY(0) scale(1); }
	}
	@keyframes settle { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
	@keyframes drift { from { translate: 0 -3.5%; } to { translate: 0 3.5%; } }
	@supports (animation-timeline: view()) {
		@media not (prefers-reduced-motion: reduce) {
			.portrait, .postcard, .snapshot, .closing-photo {
				animation: develop linear both;
				animation-timeline: view();
				animation-range: entry 10% entry 85%;
			}
			/* The caption is what someone writes on the back, so it arrives after. */
			.portrait figcaption, .postcard figcaption, .snapshot figcaption, .margin-note {
				animation: settle linear both;
				animation-timeline: view();
				animation-range: entry 45% entry 100%;
			}
			/* Only a real photograph has depth to move through. */
			:global(.private-world .frame > img) {
				scale: 1.12;
				animation: drift linear both;
				animation-timeline: view();
				animation-range: cover;
			}
		}
	}
	@keyframes swap-in { from { opacity: 0; transform: translateY(9px); } to { opacity: 1; transform: none; } }
	/* The wall tightens before it breaks: fewer columns, less overlap. */
	@media(max-width: 1100px) { .demo { display: none; } .title-a { grid-column: 7 / 13; } .lede-a { grid-column: 7 / 13; } .postcard { grid-column: 1 / 7; } .snapshot { grid-column: 8 / 13; } .margin-note { grid-column: 1 / 8; } .title-b { grid-column: 1 / 7; } .lede-b { grid-column: 1 / 6; } .music { grid-column: 7 / 13; } .reading { grid-column: 1 / 7; gap: 22px; grid-template-columns: 1fr; } .book-cover { max-width: 220px; min-height: 270px; } .title-c { grid-column: 5 / 12; } .thought { grid-column: 1 / 12; } }
	/*
		Below the tablet the collage stops being a collage. Overlap, offsets and
		column placement all go; the objects keep only the tilt that belongs to
		them as photographs, and the wall becomes one honest column.
	*/
	@media(max-width: 768px) {
		.board { display: flex; flex-direction: column; gap: 40px; padding-top: 55px; }
		.board > * { grid-column: auto; grid-row: auto; margin-top: 0; margin-bottom: 0; align-self: auto; }
		/* No seam left to cross in a single column, so the pull would only
		   land the postcard on top of the lede above it. */
		.postcard { margin-top: 0; }
		.title-b, .title-c { margin-top: 28px; }
		.title-a::after, .title-b::after { display: none; }
		.margin-note { align-self: flex-start; }
		.lede { max-width: none; }
	}
	@media(max-width: 640px) { header { min-height: 85px; gap: 20px; } nav { gap: 14px; font-size: 11px; } .signature { font-size: 25px; } .opening { grid-template-columns: 1fr; gap: 34px; padding-top: 12px; padding-bottom: 40px; } .portrait > :global(.frame) { aspect-ratio: 4 / 3.4; } h1 { font-size: 55px; max-width: 370px; } .hello > p:not(.handwritten) { margin-top: 22px; } .handwritten { margin: 35px 0 0 20px; font-size: 25px; } .intro-end { font-size: 10px; } .intro-end span:last-child { display: none; } .reading { grid-template-columns: minmax(160px, .8fr) 1fr; gap: 25px; } .book-cover { min-height: 250px; padding: 18px; } .book-cover strong { font-size: 26px; } .book-thought h3 { font-size: 22px; } .book-thought p { font-size: 13px; } .thought > p { min-height: 145px; } .footer-inner { grid-template-columns: 1fr; gap: 40px; margin-bottom: 35px; } .closing-photo { width: 180px; } .footer-bottom { font-size: 10px; } }
	@media(max-width: 520px) { .reading { grid-template-columns: 1fr; gap: 28px; } .book-cover { width: 200px; } }
	@media(max-width: 380px) { nav { gap: 10px; font-size: 10px; } }
	@media(max-width: 1000px) { header { flex-wrap: wrap; column-gap: 20px; row-gap: 0; padding: 16px 0; } .demo { display: block; flex-basis: 100%; margin: 0; font-size: 10px; } }
	@media(prefers-reduced-motion: reduce) { .private-world, .swap { animation: none; } .explore .icon, .thought button .icon, .to-top .icon { transition: none; } }
</style>

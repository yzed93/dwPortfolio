<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { langState } from '$lib/state/lang.svelte';
	import { contentFor } from '$lib/content';
	import List from 'phosphor-svelte/lib/List';
	import X from 'phosphor-svelte/lib/X';

	let content = $derived(contentFor(langState.current));

	let menuOpen = $state(false);
	let observedId = $state('');
	let atEnd = $state(false);
	let beforeFirst = $state(true);
	let hasScrolled = $state(false);
	let menuButton = $state<HTMLButtonElement | null>(null);
	let scrollSentinel = $state<HTMLSpanElement | null>(null);

	/*
		One indicator for the whole navigation, measured from the active link
		rather than one underline per link. Five underlines meant every section
		change played two animations at once, one shrinking and one growing, which
		reads as two things happening. A single rule that travels reads as the
		mechanism it actually is: the page moved, and the marker followed it.
	*/
	let navEl = $state<HTMLElement | null>(null);
	let markX = $state(0);
	let markW = $state(0);
	let markVisible = $state(false);
	/* The first measurement must place the rule, not animate it in from zero. */
	let markArmed = $state(false);

	function measureMark() {
		// A case study has none of these sections, so nothing is marked there.
		if (!navEl || !isOverview) {
			markVisible = false;
			return;
		}
		const active = navEl.querySelector<HTMLElement>(`[data-nav-id="${activeId}"]`);
		if (!active) {
			markVisible = false;
			return;
		}
		const navBox = navEl.getBoundingClientRect();
		const box = active.getBoundingClientRect();
		const cs = getComputedStyle(active);
		const padL = parseFloat(cs.paddingLeft) || 0;
		const padR = parseFloat(cs.paddingRight) || 0;
		// The rule spans the label, not the link's hit area.
		markX = box.left - navBox.left + padL;
		markW = Math.max(0, box.width - padL - padR);
		markVisible = true;
	}

	const SECTION_IDS = ['platforms', 'approach', 'career', 'project', 'contact'];

	// The overview owns the anchors. From a case study page the same labels have
	// to travel back to `/` first, otherwise they resolve against the sub-path
	// and go nowhere.
	let isOverview = $derived(page.url.pathname === '/' || page.url.pathname === '/light');
	let prefix = $derived(isOverview ? '' : '/');

	/*
		The band the observer watches sits between 80px and 30% of the viewport,
		and the last section never reaches it: at maximum scroll contact starts at
		385px while the band ends at 270, so `project` held the marker and the
		final nav item was unreachable by scrolling at all. When the document has
		no more to give, the reader is looking at its last section, whatever the
		band says.
	*/
	let activeId = $derived(
		isOverview && atEnd
			? SECTION_IDS[SECTION_IDS.length - 1]
			: beforeFirst
				? ''
				: observedId
	);

	let links = $derived([
		{ id: 'platforms', label: content.nav.platforms },
		{ id: 'approach', label: content.nav.approach },
		{ id: 'career', label: content.nav.career },
		{ id: 'project', label: content.nav.project },
		{ id: 'contact', label: content.nav.contact }
	]);

	function closeMenu(returnFocus = false) {
		if (!menuOpen) return;
		menuOpen = false;
		// Escape must not strand the keyboard on a control that just disappeared.
		if (returnFocus) menuButton?.focus();
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') closeMenu(true);
	}

	function onPointerDown(event: PointerEvent) {
		if (!menuOpen) return;
		const target = event.target as Node | null;
		if (target && !(target as Element).closest?.('.site-header')) closeMenu();
	}

	onMount(() => {
		const scrollObserver = new IntersectionObserver(([entry]) => {
			hasScrolled = !entry.isIntersecting;
		});
		if (scrollSentinel) scrollObserver.observe(scrollSentinel);

		const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
			(el): el is HTMLElement => el !== null
		);

		// The band sits just under the nav bar. During a fast scroll two sections
		// can cross it in the same callback, so visibility is tracked in a set and
		// the topmost one in document order wins instead of whichever entry the
		// observer happened to report last.
		const visible = new Set<string>();
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) visible.add(entry.target.id);
					else visible.delete(entry.target.id);
				}
				const first = SECTION_IDS.find((id) => visible.has(id));
				if (first) observedId = first;
			},
			{ rootMargin: '-80px 0px -70% 0px' }
		);
		sections.forEach((section) => observer.observe(section));

		/*
			The rule is measured, so anything that changes what it measures has to
			re-measure: the bar resizing, and the real display face arriving, which
			changes every label width under it.
		*/
		const resize = new ResizeObserver(() => measureMark());
		if (navEl) resize.observe(navEl);
		document.fonts?.ready.then(() => {
			measureMark();
			requestAnimationFrame(() => (markArmed = true));
		});

		/*
			Two questions no observer on a section can answer, both about the ends
			of the document rather than about any section in it. Passive and coalesced
			into a frame, because the second one reads layout.

			`beforeFirst` exists because the section observer only ever sets the
			active id and never clears it: hold the marker while scrolling through
			the gaps between sections, which is right, but it also meant that
			returning to the top left the navigation claiming the reader was still
			in whichever section they had left.
		*/
		let frame = 0;
		const onScroll = () => {
			if (frame) return;
			frame = requestAnimationFrame(() => {
				frame = 0;
				const doc = document.documentElement;
				atEnd = doc.scrollHeight - (window.scrollY + window.innerHeight) < 4;
				const first = document.getElementById(SECTION_IDS[0]);
				beforeFirst = first !== null && first.getBoundingClientRect().top > 80;
			});
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });

		return () => {
			observer.disconnect();
			scrollObserver.disconnect();
			resize.disconnect();
			window.removeEventListener('scroll', onScroll);
			if (frame) cancelAnimationFrame(frame);
		};
	});

	/*
		Re-measures on section change and on language change: the labels are
		different words in each language and therefore different widths.
	*/
	$effect(() => {
		activeId;
		links;
		measureMark();
	});
</script>

<svelte:window on:keydown={onKeydown} on:pointerdown={onPointerDown} />

<span bind:this={scrollSentinel} class="scroll-sentinel" aria-hidden="true"></span>

<header
	class="site-header fixed inset-x-0 top-0 z-50 border-b {hasScrolled || menuOpen
		? 'is-scrolled'
		: ''}"
>
	<!--
		Full bleed and not inside the max-width panel: this measures the document,
		so it belongs to the edge of the window rather than to the content column.
	-->
	<span class="scroll-progress" aria-hidden="true"></span>

	<div class="site-nav-panel mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
		<a
			href={isOverview ? '#top' : '/'}
			aria-label={langState.current === 'de'
				? 'Dennis Wiredu - zurück zum Anfang'
				: 'Dennis Wiredu - back to top'}
			class="group flex min-h-11 items-center font-[family-name:var(--font-display)] text-xl font-semibold tracking-[-0.035em] text-ink"
		>
			<span>Dennis <span class="wordmark-accent text-accent-on-paper">Wiredu</span></span>
		</a>

		<nav
			bind:this={navEl}
			aria-label={langState.current === 'de' ? 'Hauptnavigation' : 'Main navigation'}
			class="nav-links relative hidden items-center gap-1 lg:flex"
		>
			{#each links as link (link.id)}
				{@const isActive = isOverview && link.id === activeId}
				<a
					href="{prefix}#{link.id}"
					data-nav-id={link.id}
					aria-current={isActive ? 'true' : undefined}
					class="relative px-3 py-2 text-sm transition-colors {isActive
						? 'font-medium text-ink'
						: 'text-ink-soft hover:text-ink'}"
				>
					{link.label}
				</a>
			{/each}

			<span
				class="nav-mark"
				class:is-visible={markVisible}
				class:is-armed={markArmed}
				style="--mark-x: {markX}px; --mark-w: {markW}"
				aria-hidden="true"
			></span>
		</nav>

		<div class="flex items-center gap-1 border-l border-ink/15 pl-2 sm:pl-3">
			<button
				type="button"
				onclick={() => langState.toggle()}
				class="meta flex h-10 min-w-10 items-center justify-center px-2 font-medium text-ink transition-colors hover:text-accent-on-paper active:scale-[0.98]"
				aria-label={langState.current === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln'}
			>
				{langState.current === 'de' ? 'EN' : 'DE'}
			</button>

			<button
				bind:this={menuButton}
				type="button"
				onclick={() => (menuOpen = !menuOpen)}
				aria-expanded={menuOpen}
				aria-controls="mobile-menu"
				aria-label={langState.current === 'de'
					? menuOpen
						? 'Menü schließen'
						: 'Menü öffnen'
					: menuOpen
						? 'Close menu'
						: 'Open menu'}
				class="flex h-10 w-10 items-center justify-center text-ink transition-colors hover:text-accent-on-paper active:scale-[0.98] lg:hidden"
			>
				{#if menuOpen}
					<X size={20} weight="bold" />
				{:else}
					<List size={20} weight="bold" />
				{/if}
			</button>
		</div>
	</div>

	<!--
		Always rendered and hidden with a class rather than mounted on demand:
		`aria-controls` above has to point at an element that actually exists,
		otherwise the reference dangles whenever the menu is closed.
	-->
	<nav
		id="mobile-menu"
		aria-label={langState.current === 'de' ? 'Mobile Navigation' : 'Mobile navigation'}
		aria-hidden={!menuOpen}
		inert={!menuOpen}
		class="mobile-menu-panel site-nav-panel mx-auto max-w-6xl border-t border-b border-ink/12 bg-paper px-4 py-2 sm:px-6 lg:hidden {menuOpen
			? 'is-open'
			: ''}"
	>
		{#each links as link (link.id)}
			<a
				href="{prefix}#{link.id}"
				onclick={() => closeMenu()}
				aria-current={isOverview && link.id === activeId ? 'true' : undefined}
				class="block border-b border-ink/10 py-4 font-[family-name:var(--font-display)] text-lg font-semibold text-ink transition-colors last:border-b-0 hover:text-accent-on-paper aria-[current=true]:text-accent-on-paper"
			>
				{link.label}
			</a>
		{/each}
	</nav>
</header>

<style>
	.scroll-sentinel {
		position: absolute;
		top: 0;
		left: 0;
		width: 1px;
		height: 13px;
		pointer-events: none;
	}
	.site-header {
		border-bottom-color: transparent;
		background: transparent;
		-webkit-backdrop-filter: none;
		backdrop-filter: none;
		transition:
			background-color 240ms ease,
			border-color 240ms ease,
			backdrop-filter 240ms ease;
	}
	.site-header.is-scrolled {
		border-bottom-color: color-mix(in srgb, var(--color-ink) 15%, transparent);
		background: color-mix(in srgb, var(--color-paper) 52%, transparent);
		-webkit-backdrop-filter: blur(16px) saturate(1.2);
		backdrop-filter: blur(16px) saturate(1.2);
	}
	.wordmark-accent {
		color: var(--color-accent-on-paper);
		font-style: italic;
		transition: color 180ms ease;
	}
	/*
		Colour only. This used to drop the italic on hover as well, and the roman
		and italic of this face do not share an advance width, so the wordmark
		reflowed under the cursor every time it was pointed at. A logo that moves
		when you approach it is a bug wearing the costume of a detail.
	*/
	.group:hover .wordmark-accent {
		color: var(--color-ink);
	}

	/*
		The travelling rule. Width comes from scaleX on a 1px bar rather than an
		animated `width`, so the whole move is one compositor transform: the
		marker slides and stretches to the next label in a single gesture.
	*/
	.nav-mark {
		position: absolute;
		bottom: 4px;
		left: 0;
		width: 1px;
		height: 2px;
		background: var(--color-accent-on-paper);
		opacity: 0;
		transform: translate3d(var(--mark-x), 0, 0) scaleX(var(--mark-w));
		transform-origin: left center;
		pointer-events: none;
	}
	.nav-mark.is-visible {
		opacity: 1;
	}
	/* Armed only after the first measurement, so it is placed rather than flown in. */
	.nav-mark.is-armed {
		transition:
			transform 420ms var(--ease-out-strong),
			opacity 200ms ease;
	}

	/*
		Reading position, drawn by the scroll itself. No script and no scroll
		listener: the timeline is the document. Browsers without scroll-driven
		animations simply never see it, which is why the resting state is a rule
		of zero width rather than a full one.
	*/
	.scroll-progress {
		position: absolute;
		bottom: -1px;
		left: 0;
		width: 100%;
		height: 1px;
		background: var(--color-accent-on-paper);
		transform: scaleX(0);
		transform-origin: left center;
	}

	@supports (animation-timeline: scroll()) {
		.scroll-progress {
			animation: progress-draw linear both;
			animation-timeline: scroll(root block);
		}
	}

	@keyframes progress-draw {
		from {
			transform: scaleX(0);
		}
		to {
			transform: scaleX(1);
		}
	}
	.mobile-menu-panel {
		position: absolute;
		top: 100%;
		right: 0;
		left: 0;
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		transform: translateY(-10px);
		transition:
			opacity 180ms ease,
			transform 220ms var(--ease-out-strong),
			visibility 0s linear 220ms;
	}
	.mobile-menu-panel.is-open {
		opacity: 1;
		visibility: visible;
		pointer-events: auto;
		transform: translateY(0);
		transition-delay: 0s;
	}
	@media (prefers-reduced-motion: reduce) {
		.site-header {
			transition: none;
		}
		/* The marker still marks, it just stops travelling to get there. */
		.nav-mark.is-armed {
			transition: none;
		}
		/*
			The progress rule is kept, and the global reduced-motion rule that sets
			every animation-duration to 0.001ms is overridden for it alone. It does
			not animate on its own: it moves only as far as the reader scrolls,
			exactly like the scrollbar beside it, and a time-based duration would
			collapse it to permanently full instead of stopping it.
		*/
		.scroll-progress {
			animation-duration: auto !important;
		}
		.mobile-menu-panel,
		.mobile-menu-panel.is-open {
			transform: none;
			transition-property: opacity, visibility;
		}
	}
</style>

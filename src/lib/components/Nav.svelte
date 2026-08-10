<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { langState } from '$lib/state/lang.svelte';
	import { contentFor } from '$lib/content';
	import List from 'phosphor-svelte/lib/List';
	import X from 'phosphor-svelte/lib/X';

	let content = $derived(contentFor(langState.current));

	let menuOpen = $state(false);
	let activeId = $state('');
	let hasScrolled = $state(false);
	let menuButton = $state<HTMLButtonElement | null>(null);
	let scrollSentinel = $state<HTMLSpanElement | null>(null);

	const SECTION_IDS = ['platforms', 'approach', 'career', 'project', 'contact'];

	// The overview owns the anchors. From a case study page the same labels have
	// to travel back to `/` first, otherwise they resolve against the sub-path
	// and go nowhere.
	let isOverview = $derived(page.url.pathname === '/' || page.url.pathname === '/light');
	let prefix = $derived(isOverview ? '' : '/');

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
				if (first) activeId = first;
			},
			{ rootMargin: '-80px 0px -70% 0px' }
		);
		sections.forEach((section) => observer.observe(section));
		return () => {
			observer.disconnect();
			scrollObserver.disconnect();
		};
	});
</script>

<svelte:window on:keydown={onKeydown} on:pointerdown={onPointerDown} />

<span bind:this={scrollSentinel} class="scroll-sentinel" aria-hidden="true"></span>

<header
	class="site-header fixed inset-x-0 top-0 z-50 border-b {hasScrolled || menuOpen
		? 'is-scrolled'
		: ''}"
>
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
			aria-label={langState.current === 'de' ? 'Hauptnavigation' : 'Main navigation'}
			class="hidden items-center gap-1 lg:flex"
		>
			{#each links as link (link.id)}
				{@const isActive = isOverview && link.id === activeId}
				<a
					href="{prefix}#{link.id}"
					aria-current={isActive ? 'true' : undefined}
					class="relative px-3 py-2 text-sm transition-colors {isActive
						? 'font-medium text-ink'
						: 'text-ink-soft hover:text-ink'}"
				>
					{link.label}
					<span
						class="absolute right-3 bottom-1 left-3 h-0.5 origin-left bg-accent-on-paper transition-transform duration-300 ease-out {isActive
							? 'scale-x-100'
							: 'scale-x-0'}"
						aria-hidden="true"
					></span>
				</a>
			{/each}
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
	.group:hover .wordmark-accent {
		color: var(--color-ink);
		font-style: normal;
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
		.mobile-menu-panel,
		.mobile-menu-panel.is-open {
			transform: none;
			transition-property: opacity, visibility;
		}
	}
</style>

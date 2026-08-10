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
		const syncScrollState = () => (hasScrolled = window.scrollY > 12);
		syncScrollState();
		window.addEventListener('scroll', syncScrollState, { passive: true });

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
			window.removeEventListener('scroll', syncScrollState);
		};
	});
</script>

<svelte:window on:keydown={onKeydown} on:pointerdown={onPointerDown} />

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
			class="group flex min-h-11 items-center font-[family-name:var(--font-display)] text-lg font-bold tracking-[-0.03em] text-ink"
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
		class="site-nav-panel mx-auto max-w-6xl border-t border-b border-ink/12 bg-paper/88 px-4 py-2 backdrop-blur-2xl sm:px-6 lg:hidden {menuOpen
			? ''
			: 'hidden'}"
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
		text-decoration: underline;
		text-decoration-color: var(--color-signal);
		text-decoration-thickness: 0.14em;
		text-underline-offset: 0.2em;
		transition:
			color 180ms ease,
			text-decoration-color 180ms ease;
	}
	.group:hover .wordmark-accent {
		color: var(--color-ink);
		text-decoration-color: var(--color-accent-on-paper);
	}
	@media (prefers-reduced-motion: reduce) {
		.site-header {
			transition: none;
		}
	}
</style>

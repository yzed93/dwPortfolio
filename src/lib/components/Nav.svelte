<script lang="ts">
	import { onMount } from 'svelte';
	import { langState } from '$lib/state/lang.svelte';
	import type { SiteContent } from '$lib/content';
	import List from 'phosphor-svelte/lib/List';
	import X from 'phosphor-svelte/lib/X';

	let { content }: { content: SiteContent } = $props();

	let menuOpen = $state(false);
	let activeId = $state('');
	let hasScrolled = $state(false);

	let links = $derived([
		{ href: '#projects', label: content.nav.projects },
		{ href: '#skills', label: content.nav.skills },
		{ href: '#career', label: content.nav.career },
		{ href: '#project', label: content.nav.project },
		{ href: '#contact', label: content.nav.contact }
	]);

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') menuOpen = false;
	}

	onMount(() => {
		const syncScrollState = () => (hasScrolled = window.scrollY > 12);
		syncScrollState();
		window.addEventListener('scroll', syncScrollState, { passive: true });

		const ids = ['projects', 'skills', 'career', 'project', 'contact'];
		const sections = ids
			.map((id) => document.getElementById(id))
			.filter((el): el is HTMLElement => el !== null);

		// The band sits just under the nav bar, so whichever section crosses it
		// is the one the reader is actually looking at.
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) activeId = entry.target.id;
				}
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

<svelte:window on:keydown={onKeydown} />

<header
	class="site-header fixed inset-x-0 top-0 z-50 border-b {hasScrolled || menuOpen ? 'is-scrolled' : ''}"
>
	<div
		class="site-nav-panel mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
	>
		<a
			href="#top"
			aria-label={langState.current === 'de'
				? 'Dennis Wiredu - zurück zum Anfang'
				: 'Dennis Wiredu - back to top'}
			class="group flex min-h-11 items-center font-[family-name:var(--font-display)] text-xl font-extrabold tracking-[-0.045em] text-ink"
		>
			<span>Dennis <span class="wordmark-accent text-accent-on-paper">Wiredu</span></span>
		</a>

		<nav
			aria-label={langState.current === 'de' ? 'Hauptnavigation' : 'Main navigation'}
			class="hidden items-center gap-1 lg:flex"
		>
			{#each links as link (link.href)}
				{@const isActive = link.href === `#${activeId}`}
				<a
					href={link.href}
					aria-current={isActive ? 'true' : undefined}
					class="relative px-3 py-2 text-sm transition-colors {isActive
						? 'font-semibold text-ink'
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
				class="flex h-10 min-w-10 items-center justify-center px-2 text-xs font-bold tracking-[0.14em] text-ink transition-colors hover:text-accent-on-paper active:scale-[0.98]"
				aria-label={langState.current === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln'}
			>
				{langState.current === 'de' ? 'EN' : 'DE'}
			</button>

			<button
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

	{#if menuOpen}
		<nav
			id="mobile-menu"
			aria-label={langState.current === 'de' ? 'Mobile Navigation' : 'Mobile navigation'}
			class="site-nav-panel mx-auto max-w-6xl border-t border-b border-ink/12 bg-paper/88 px-4 py-2 backdrop-blur-2xl lg:hidden sm:px-6"
		>
			{#each links as link (link.href)}
				<a
					href={link.href}
					onclick={() => (menuOpen = false)}
					aria-current={link.href === `#${activeId}` ? 'true' : undefined}
					class="block border-b border-ink/10 py-4 font-[family-name:var(--font-display)] text-xl font-bold text-ink transition-colors last:border-b-0 hover:text-accent-on-paper aria-[current=true]:text-accent-on-paper"
				>
					{link.label}
				</a>
			{/each}
		</nav>
	{/if}
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
		text-decoration-thickness: 0.16em;
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

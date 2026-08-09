<script lang="ts">
	import { onMount } from 'svelte';
	import { langState } from '$lib/state/lang.svelte';
	import type { SiteContent } from '$lib/content';
	import List from 'phosphor-svelte/lib/List';
	import X from 'phosphor-svelte/lib/X';

	let { content }: { content: SiteContent } = $props();

	let menuOpen = $state(false);
	let activeId = $state('');

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
		return () => observer.disconnect();
	});
</script>

<svelte:window on:keydown={onKeydown} />

<header class="fixed inset-x-0 top-0 z-50 border-b border-ink/12 bg-paper/88 backdrop-blur-xl">
	<div
		class="site-nav-panel mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
	>
		<a
			href="#top"
			aria-label={langState.current === 'de'
				? 'Dennis Wiredu - zurück zum Anfang'
				: 'Dennis Wiredu - back to top'}
			class="group flex min-h-11 items-center gap-2.5 text-ink"
		>
			<span
				class="flex h-9 w-9 items-center justify-center rounded-md bg-ink font-[family-name:var(--font-display)] text-sm font-extrabold tracking-tight text-paper transition-transform duration-300 group-hover:-rotate-3"
				aria-hidden="true">DW</span
			>
			<span class="hidden font-[family-name:var(--font-display)] text-sm font-bold sm:inline">
				Dennis Wiredu
			</span>
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

		<div class="flex items-center gap-1.5">
			<button
				type="button"
				onclick={() => langState.toggle()}
				class="flex h-10 min-w-10 items-center justify-center rounded-md border border-ink/15 px-3 text-xs font-semibold text-ink transition-colors hover:border-accent-on-paper hover:bg-ink/5 hover:text-accent-on-paper active:scale-[0.98]"
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
				class="flex h-10 w-10 items-center justify-center rounded-md text-ink transition-colors hover:bg-ink/10 active:scale-[0.98] lg:hidden"
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
			class="site-nav-panel mx-auto max-w-6xl border-x border-b border-ink/12 bg-paper/96 p-3 backdrop-blur-xl lg:hidden"
		>
			{#each links as link (link.href)}
				<a
					href={link.href}
					onclick={() => (menuOpen = false)}
					aria-current={link.href === `#${activeId}` ? 'true' : undefined}
					class="block rounded-md px-4 py-3 font-[family-name:var(--font-display)] text-xl font-bold text-ink transition-colors hover:bg-ink/5 aria-[current=true]:bg-ink/7 aria-[current=true]:text-accent-on-paper"
				>
					{link.label}
				</a>
			{/each}
		</nav>
	{/if}
</header>

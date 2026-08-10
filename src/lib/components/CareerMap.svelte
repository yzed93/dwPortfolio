<script lang="ts">
	import { onMount, onDestroy, untrack } from 'svelte';
	import { slide } from 'svelte/transition';
	import 'maplibre-gl/dist/maplibre-gl.css';
	/*
		MapLibre derives its worker URL at runtime from `import.meta.url`, expecting
		`maplibre-gl-worker.mjs` to sit next to its own file. After bundling into a
		hashed chunk that sibling does not exist, the worker 404s, and without a
		worker no vector tile is ever parsed: the map stays blank while the style
		itself loads fine. Because the URL is assembled from a string at runtime no
		bundler can see it, so the worker is emitted deliberately here and handed to
		MapLibre. `?worker&url` bundles its own sibling import along with it.
	*/
	import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
	import type { SiteContent, Station } from '$lib/content';
	import { reveal } from '$lib/actions/reveal';

	let { content }: { content: SiteContent } = $props();

	let mapContainer: HTMLDivElement;
	let map: import('maplibre-gl').Map | null = null;
	let markers: import('maplibre-gl').Marker[] = [];
	const markerElements = new Map<string, HTMLButtonElement>();

	// Stations are chronological, so the current role is last. That is the one
	// worth showing first.
	let selectedId = $state(
		untrack(() => content.career.stations[content.career.stations.length - 1].id)
	);
	let mapReady = $state(false);

	let selected = $derived(
		content.career.stations.find((s) => s.id === selectedId) ?? content.career.stations[0]
	);
	// Content is stored oldest-first; the Werdegang reads newest-first, like a CV.
	// filter() already returns a copy, so reverse() does not touch the source.
	let itStations = $derived(content.career.stations.filter((s) => s.track === 'it').reverse());
	let commercialStations = $derived(
		content.career.stations.filter((s) => s.track === 'commercial').reverse()
	);
	let mobileStations = $derived([...content.career.stations].reverse());

	function chipClass(station: Station) {
		if (selectedId === station.id) return 'border-on-signal bg-on-signal text-signal';
		return station.track === 'commercial'
			? 'border-on-signal/40 bg-transparent text-on-signal hover:border-on-signal'
			: 'border-transparent bg-on-signal/10 text-on-signal hover:bg-on-signal/20';
	}

	function selectStation(station: Station, fly = true) {
		selectedId = station.id;
		if (map && fly) {
			map.flyTo({ center: [station.lng, station.lat], zoom: 13.2, duration: 900 });
		}
	}

	function renderMarkers(maplibregl: typeof import('maplibre-gl')) {
		markers.forEach((m) => m.remove());
		markerElements.clear();

		markers = content.career.stations.map((station) => {
			const el = document.createElement('button');
			el.type = 'button';
			el.setAttribute('aria-label', station.company);
			el.className = 'career-marker';
			markerElements.set(station.id, el);

			const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
				.setLngLat([station.lng, station.lat])
				.addTo(map!);
			// Look the station up by id on click so the handler stays correct
			// after a language switch replaces the station objects.
			el.addEventListener('click', () => {
				const current = content.career.stations.find((s) => s.id === station.id);
				if (current) selectStation(current);
			});
			return marker;
		});
	}

	// Markers are built once on map load, so track, selection and labels have to
	// be pushed onto the existing elements whenever state or language changes.
	// `markerElements` is a plain Map, so `mapReady` is what re-runs this once
	// the markers actually exist.
	$effect(() => {
		if (!mapReady) return;
		for (const station of content.career.stations) {
			const el = markerElements.get(station.id);
			if (!el) continue;
			el.setAttribute('aria-label', station.company);
			el.classList.toggle('is-solid', station.track === 'it');
			el.classList.toggle('is-selected', station.id === selectedId);
		}
	});

	onMount(() => {
		let cancelled = false;
		let loadStarted = false;
		let observer: IntersectionObserver | null = null;
		const desktopMedia = window.matchMedia('(min-width: 768px)');

		async function loadMap() {
			if (loadStarted) return;
			loadStarted = true;
			const maplibregl = await import('maplibre-gl');
			if (cancelled || !mapContainer) return;

			// Has to happen before the first map is constructed, otherwise the
			// workers are already spawned from the broken default URL.
			maplibregl.setWorkerUrl(maplibreWorkerUrl);

			map = new maplibregl.Map({
				container: mapContainer,
				style: 'https://tiles.openfreemap.org/styles/positron',
				center: [11.565, 48.148],
				zoom: 11.2,
				attributionControl: { compact: true }
			});

			map.scrollZoom.disable();
			map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

			map.on('load', () => {
				mapReady = true;
				renderMarkers(maplibregl);
			});
		}

		// The mobile experience is a swipeable CV and never needs the heavy map.
		// On desktop, keep loading MapLibre shortly before the workspace appears.
		function observeMap() {
			if (!desktopMedia.matches || observer || loadStarted || !mapContainer) return;
			observer = new IntersectionObserver(
				([entry]) => {
					if (!entry.isIntersecting) return;
					observer?.disconnect();
					observer = null;
					void loadMap();
				},
				{ rootMargin: '320px 0px' }
			);
			observer.observe(mapContainer);
		}

		const handleViewportChange = () => {
			if (!desktopMedia.matches) {
				observer?.disconnect();
				observer = null;
				return;
			}
			observeMap();
		};
		observeMap();
		desktopMedia.addEventListener('change', handleViewportChange);

		return () => {
			cancelled = true;
			observer?.disconnect();
			desktopMedia.removeEventListener('change', handleViewportChange);
		};
	});

	onDestroy(() => {
		markers.forEach((m) => m.remove());
		map?.remove();
	});
</script>

<section id="career" class="relative px-4 py-4 sm:px-6">
	<div class="facet-rise mx-auto max-w-6xl bg-signal px-6 py-16 sm:px-10 md:py-20">
		<h2
			use:reveal
			class="font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-tight text-on-signal md:text-6xl"
		>
			{content.career.title}
		</h2>
		<p class="mt-3 max-w-[58ch] text-lg font-medium text-on-signal">{content.career.intro}</p>

		<div
			class="career-swipe -mx-6 mt-8 snap-x snap-mandatory scroll-px-6 overflow-x-auto overscroll-x-contain px-6 pb-3 touch-pan-x md:hidden"
			aria-label={content.career.title}
		>
			<div class="flex gap-4">
				{#each mobileStations as station (station.id)}
					<article class="facet-card w-[84vw] max-w-[21rem] shrink-0 snap-start bg-card p-6">
						<div class="flex items-start justify-between gap-4 border-b border-card-line pb-4">
							<h3
								class="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-card-ink"
							>
								{station.company}
							</h3>
							<span class="shrink-0 pt-1 text-xs font-medium text-card-ink-faint">
								{station.period}
							</span>
						</div>
						<p class="mt-4 font-semibold text-card-accent">{station.role}</p>
						<p class="mt-3 text-sm leading-relaxed text-card-ink-soft">{station.summary}</p>

						<ul class="mt-5 space-y-2.5">
							{#each station.bullets as bullet (bullet)}
								<li class="flex gap-2.5 text-sm leading-relaxed text-card-ink-soft">
									<span class="mt-2 h-1 w-1 shrink-0 rounded-full bg-card-accent"></span>
									{bullet}
								</li>
							{/each}
						</ul>
					</article>
				{/each}
			</div>
		</div>

		<div class="hidden md:block">
			<!-- The rule between the two chip groups carries the career change. -->
			<div class="mt-8 flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-5">
			<div class="flex flex-wrap gap-2 lg:max-w-[58%]">
				{#each itStations as station (station.id)}
					<button
						type="button"
						aria-pressed={selectedId === station.id}
						onclick={() => selectStation(station)}
						class="rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-colors {chipClass(
							station
						)}"
					>
						{station.company}
					</button>
				{/each}
			</div>

			<span
				class="h-0.5 w-14 self-start bg-on-signal/35 lg:h-auto lg:w-0.5 lg:self-stretch"
				aria-hidden="true"
			></span>

			<div class="flex flex-wrap gap-2">
				{#each commercialStations as station (station.id)}
					<button
						type="button"
						aria-pressed={selectedId === station.id}
						onclick={() => selectStation(station)}
						class="rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-colors {chipClass(
							station
						)}"
					>
						{station.company}
					</button>
				{/each}
			</div>
			</div>

			<div class="mt-8 grid overflow-hidden border border-on-signal/20 bg-card lg:grid-cols-[1.1fr_1fr]">
			<div
				use:reveal
				class="relative border-b border-card-line lg:border-r lg:border-b-0"
			>
				<div
					class="career-map relative h-[320px] w-full overflow-hidden md:h-[420px]"
					bind:this={mapContainer}
				>
					{#if !mapReady}
						<div class="absolute inset-0 grid grid-cols-[1fr_0.38fr] gap-3 bg-card p-4" aria-hidden="true">
							<div class="map-skeleton rounded-xl"></div>
							<div class="flex flex-col gap-3 py-2">
								<div class="map-skeleton h-5 rounded-lg"></div>
								<div class="map-skeleton h-14 rounded-xl"></div>
								<div class="map-skeleton h-14 rounded-xl"></div>
								<div class="map-skeleton h-20 rounded-xl"></div>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<div use:reveal={100} aria-live="polite" class="p-7 md:p-9">
				{#key selected.id}
					<div in:slide={{ duration: 200 }}>
						<div class="flex flex-wrap items-baseline justify-between gap-2">
							<h3 class="font-[family-name:var(--font-display)] text-2xl font-bold text-card-ink">
								{selected.company}
							</h3>
							<span class="text-sm text-card-ink-faint">{selected.period}</span>
						</div>
						<p class="mt-1 font-semibold text-card-accent">{selected.role}</p>
						<p class="mt-3 text-sm leading-relaxed text-card-ink-soft">{selected.summary}</p>

						<ul class="mt-4 space-y-1.5">
							{#each selected.bullets as bullet (bullet)}
								<li class="flex gap-2.5 text-sm text-card-ink-soft">
									<span class="mt-2 h-1 w-1 shrink-0 rounded-full bg-card-accent"></span>
									{bullet}
								</li>
							{/each}
						</ul>

						{#if selected.id === 'provectus'}
							<a
								href="#projects"
								class="group mt-6 inline-flex items-center gap-1.5 border-t border-card-line pt-6 text-sm font-semibold text-card-accent transition-opacity hover:opacity-80"
							>
								{content.projects.title}
								<span class="transition-transform group-hover:translate-x-1">→</span>
							</a>
						{/if}
					</div>
				{/key}
			</div>
			</div>
		</div>
	</div>
</section>

<style>
	.career-swipe {
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
	}
	.career-swipe::-webkit-scrollbar {
		display: none;
	}

	/*
		Pin shape is a rotated rounded square, so every transform has to keep the
		45deg rotation. Hollow = the years before IT, filled = the IT career.
	*/
	:global(.career-marker) {
		width: 20px;
		height: 20px;
		padding: 0;
		cursor: pointer;
		border-radius: 999px 999px 999px 2px;
		transform: rotate(45deg);
		background-color: var(--color-card);
		border: 3px solid var(--color-card-ink);
		box-shadow: 0 2px 6px rgba(14, 13, 11, 0.3);
		transition:
			transform 0.18s cubic-bezier(0.16, 1, 0.3, 1),
			background-color 0.18s ease;
	}
	:global(.career-marker.is-solid) {
		background-color: var(--color-card-ink);
	}
	:global(.career-marker.is-selected) {
		background-color: var(--color-signal);
		transform: rotate(45deg) scale(1.3);
		z-index: 2;
	}
	:global(.career-marker:hover) {
		transform: rotate(45deg) scale(1.2);
	}
	:global(.career-marker.is-selected:hover) {
		transform: rotate(45deg) scale(1.4);
	}
	:global(.career-map .maplibregl-canvas) {
		filter: saturate(1.15) contrast(1.02);
	}
	.map-skeleton {
		background: linear-gradient(
			100deg,
			var(--color-card-line) 20%,
			color-mix(in srgb, var(--color-card-line) 48%, var(--color-card)) 42%,
			var(--color-card-line) 64%
		);
		background-size: 220% 100%;
		animation: skeleton-shift 1.4s ease-in-out infinite;
	}
	@keyframes skeleton-shift {
		to {
			background-position: -220% 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		:global(.career-marker) {
			transition: none;
		}
	}
</style>

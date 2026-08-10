<script lang="ts">
	import { langState } from '$lib/state/lang.svelte';
	import { page } from '$app/state';
	import { contentFor } from '$lib/content';
	import Hero from '$lib/components/Hero.svelte';
	import Platforms from '$lib/components/Platforms.svelte';
	import Approach from '$lib/components/Approach.svelte';
	import CareerAxis from '$lib/components/CareerAxis.svelte';
	import SideProject from '$lib/components/SideProject.svelte';
	import Contact from '$lib/components/Contact.svelte';

	let content = $derived(contentFor(langState.current));

	/*
		The pages are prerendered, so `page.url.origin` is the build-time
		placeholder `http://sveltekit-prerender` in the emitted HTML. Link preview
		crawlers do not run JavaScript and would read exactly that, so canonical
		and social URLs are pinned to the real site instead.
	*/
	const SITE_URL = 'https://dennis.wiredu.cloud';
	let canonical = $derived(`${SITE_URL}${page.url.pathname}`);
	const ogImage = `${SITE_URL}/images/portfolio-og.jpg`;
</script>

<svelte:head>
	<title>{content.meta.title}</title>
	<meta name="description" content={content.meta.description} />
	<link rel="canonical" href={canonical} />

	<meta property="og:type" content="profile" />
	<meta property="og:site_name" content="Dennis Wiredu" />
	<meta property="og:title" content={content.meta.title} />
	<meta property="og:description" content={content.meta.description} />
	<meta property="og:locale" content={langState.current === 'de' ? 'de_DE' : 'en_US'} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta
		property="og:image:alt"
		content={langState.current === 'de'
			? 'Abstraktes Partikelobjekt in Bordeaux und tiefem Blau'
			: 'Abstract particle object in bordeaux and deep blue'}
	/>
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={content.meta.title} />
	<meta name="twitter:description" content={content.meta.description} />
	<meta name="twitter:image" content={ogImage} />
</svelte:head>

<Hero {content} />
<Platforms {content} />
<Approach {content} />
<CareerAxis {content} />
<SideProject {content} />
<Contact {content} />

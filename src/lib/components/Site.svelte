<script lang="ts">
	import { langState } from '$lib/state/lang.svelte';
	import { page } from '$app/state';
	import { contentFor } from '$lib/content';
	import Nav from '$lib/components/Nav.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import ClientProjects from '$lib/components/ClientProjects.svelte';
	import Skills from '$lib/components/Skills.svelte';
	import CareerMap from '$lib/components/CareerMap.svelte';
	import Project from '$lib/components/Project.svelte';
	import Certifications from '$lib/components/Certifications.svelte';
	import Contact from '$lib/components/Contact.svelte';

	let content = $derived(contentFor(langState.current));
</script>

<svelte:head>
	<title>{content.meta.title}</title>
	<meta name="description" content={content.meta.description} />
	<link rel="canonical" href={page.url.href} />

	<!-- The request origin keeps canonical and social URLs absolute in every environment. -->
	<meta property="og:type" content="profile" />
	<meta property="og:site_name" content="Dennis Wiredu" />
	<meta property="og:title" content={content.meta.title} />
	<meta property="og:description" content={content.meta.description} />
	<meta property="og:locale" content={langState.current === 'de' ? 'de_DE' : 'en_US'} />
	<meta property="og:url" content={page.url.href} />
	<meta property="og:image" content={`${page.url.origin}/images/portfolio-og.jpg`} />
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
	<meta name="twitter:image" content={`${page.url.origin}/images/portfolio-og.jpg`} />
</svelte:head>

<a
	href="#main-content"
	class="fixed top-3 left-3 z-[60] -translate-y-24 rounded-xl bg-ink px-4 py-3 font-semibold text-paper transition-transform focus:translate-y-0"
>
	{langState.current === 'de' ? 'Zum Inhalt springen' : 'Skip to content'}
</a>
<Nav {content} />
<main id="main-content" tabindex="-1">
	<Hero {content} />
	<ClientProjects {content} />
	<Skills {content} />
	<CareerMap {content} />
	<Project {content} />
	<Certifications {content} />
	<Contact {content} />
</main>

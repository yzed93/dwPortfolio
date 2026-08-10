<script lang="ts">
	import '../app.css';
	import { langState } from '$lib/state/lang.svelte';
	import Nav from '$lib/components/Nav.svelte';

	let { children } = $props();

	// app.html ships lang="en"; keep the document in sync with both the
	// initial detection and every later switch, for screen readers and SEO.
	$effect(() => {
		document.documentElement.lang = langState.current;
	});
</script>

<!--
	The shell lives here rather than in a page component, because the case
	study pages under /projekte/ need the same header and skip link as the
	overview and should not have to reassemble them.
-->
<a
	href="#main-content"
	class="fixed top-3 left-3 z-[60] -translate-y-24 rounded-xl bg-ink px-4 py-3 font-semibold text-paper transition-transform focus:translate-y-0"
>
	{langState.current === 'de' ? 'Zum Inhalt springen' : 'Skip to content'}
</a>
<Nav />
<main id="main-content" tabindex="-1">
	{@render children()}
</main>

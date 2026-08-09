<script lang="ts">
	import '../app.css';
	import { langState } from '$lib/state/lang.svelte';

	let { children } = $props();

	// app.html ships lang="en"; keep the document in sync with both the
	// initial detection and every later switch, for screen readers and SEO.
	$effect(() => {
		document.documentElement.lang = langState.current;
	});
</script>

{@render children()}

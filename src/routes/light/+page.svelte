<script lang="ts">
	import Site from '$lib/components/Site.svelte';

	// Comparison route for the light palette. Same markup and the same
	// components as `/`; only the theme tokens in app.css are swapped, which is
	// what makes the two versions comparable. Set on <html> so the body
	// background follows too.
	$effect(() => {
		document.documentElement.dataset.theme = 'light';
		return () => {
			delete document.documentElement.dataset.theme;
		};
	});
</script>

<Site />

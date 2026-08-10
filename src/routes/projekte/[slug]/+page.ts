import { error } from '@sveltejs/kit';
import { platformSlugs } from '$lib/content';
import type { EntryGenerator, PageLoad } from './$types';

/*
	adapter-static runs in strict mode, so every dynamic route has to name the
	pages it produces. Slugs are language independent, which is why one list
	covers both the German and the English rendering of a case study.
*/
export const entries: EntryGenerator = () => platformSlugs.map((slug) => ({ slug }));

export const load: PageLoad = ({ params }) => {
	if (!platformSlugs.includes(params.slug)) {
		error(404, 'Unknown platform');
	}
	return { slug: params.slug };
};

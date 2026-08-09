export type Lang = 'de' | 'en';

const STORAGE_KEY = 'portfolio-lang';

function detectInitial(): Lang {
	if (typeof window === 'undefined') return 'de';
	const stored = window.localStorage.getItem(STORAGE_KEY);
	if (stored === 'de' || stored === 'en') return stored;
	return navigator.language.toLowerCase().startsWith('de') ? 'de' : 'en';
}

class LangState {
	current = $state<Lang>('de');

	constructor() {
		this.current = detectInitial();
	}

	// The document's lang attribute is bound declaratively in +layout.svelte,
	// so it tracks both the initial detection and every later switch.
	set(lang: Lang) {
		this.current = lang;
		if (typeof window !== 'undefined') {
			window.localStorage.setItem(STORAGE_KEY, lang);
		}
	}

	toggle() {
		this.set(this.current === 'de' ? 'en' : 'de');
	}
}

export const langState = new LangState();

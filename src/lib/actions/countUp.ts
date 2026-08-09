type CountUpOptions = {
	/** The final string, e.g. "15.000+" or "3+". Non-digit parts are kept as a suffix. */
	text: string;
	/** Drives thousands separators, so the English copy does not render German grouping. */
	locale: 'de' | 'en';
};

const LOCALE_TAG: Record<CountUpOptions['locale'], string> = {
	de: 'de-DE',
	en: 'en-US'
};

export function countUp(node: HTMLElement, options: CountUpOptions) {
	let observer: IntersectionObserver | null = null;
	let frame = 0;

	function run({ text, locale }: CountUpOptions) {
		observer?.disconnect();
		cancelAnimationFrame(frame);

		const match = text.match(/[\d.,]+/);
		const target = match ? parseInt(match[0].replace(/[.,]/g, ''), 10) : NaN;
		const suffix = match ? text.slice(match.index! + match[0].length) : '';

		if (
			!match ||
			Number.isNaN(target) ||
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		) {
			node.textContent = text;
			return;
		}

		const format = new Intl.NumberFormat(LOCALE_TAG[locale]);
		node.textContent = `${format.format(0)}${suffix}`;

		observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				observer?.disconnect();

				const duration = 1100;
				const start = performance.now();

				function tick(now: number) {
					const progress = Math.min((now - start) / duration, 1);
					const eased = 1 - Math.pow(1 - progress, 3);
					node.textContent = `${format.format(Math.round(target * eased))}${suffix}`;
					if (progress < 1) frame = requestAnimationFrame(tick);
				}
				frame = requestAnimationFrame(tick);
			},
			{ threshold: 0.4 }
		);
		observer.observe(node);
	}

	run(options);

	return {
		update: run,
		destroy() {
			observer?.disconnect();
			cancelAnimationFrame(frame);
		}
	};
}

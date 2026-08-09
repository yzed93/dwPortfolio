export function reveal(node: HTMLElement, delay = 0) {
	node.classList.add('reveal');
	node.style.transitionDelay = `${delay}ms`;

	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry.isIntersecting) {
				node.classList.add('is-visible');
				observer.unobserve(node);
			}
		},
		{ threshold: 0.15 }
	);
	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}

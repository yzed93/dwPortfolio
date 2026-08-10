<script lang="ts">
	import { onMount } from 'svelte';

	/**
	 * The section the field measures itself against. Progress is how far the
	 * reader has travelled through it, which is what drives the transformation.
	 */
	let { section }: { section: HTMLElement | null } = $props();

	let wrap = $state<HTMLDivElement | null>(null);
	let canvas = $state<HTMLCanvasElement | null>(null);

	const COLS = 26;
	const ROWS = 16;
	const COUNT = COLS * ROWS;

	/*
		Deterministic scatter. Math.random would reshuffle the field on every
		resize, so the same layout has to fall out of the index each time.
	*/
	function noise(seed: number) {
		const x = Math.sin(seed * 127.1) * 43758.5453;
		return x - Math.floor(x);
	}

	onMount(() => {
		if (!canvas || !wrap) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

		let width = 0;
		let height = 0;
		let frame = 0;
		let visible = false;

		// Colours come from the theme tokens rather than literals, so the field
		// follows the palette and the light route without a second definition.
		const probe = document.createElement('span');
		probe.style.display = 'none';
		wrap.appendChild(probe);
		function readColor(token: string) {
			probe.style.color = `var(${token})`;
			const parsed = getComputedStyle(probe).color.match(/[\d.]+/g);
			if (!parsed) return [255, 255, 255] as const;
			return [Number(parsed[0]), Number(parsed[1]), Number(parsed[2])] as const;
		}
		let wine = readColor('--color-hero-wine-light');
		let blue = readColor('--color-hero-blue-light');
		let faint = readColor('--color-ink-faint');

		function resize() {
			if (!canvas || !wrap) return;
			const rect = wrap.getBoundingClientRect();
			const dpr = Math.min(window.devicePixelRatio, 2);
			width = rect.width;
			height = rect.height;
			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
		}

		/*
			A canvas that only ever paints from inside the frame loop is blank
			whenever the loop does not run: a background tab, a browser that
			throttles rAF while the page is occluded, or the moment between mount
			and the first frame. Painting once outside the loop means the field is
			always in a correct state, and the loop only keeps it current.
		*/
		function paintOnce() {
			draw(reduceMotion.matches ? 1 : readProgress());
		}

		/**
		 * 0 as the section enters, 1 as its foot reaches the bottom of the
		 * viewport, so the field resolves exactly across the eight stations
		 * rather than finishing halfway down them. Read inside the animation
		 * frame from the section's own rect, which avoids a scroll listener
		 * entirely.
		 */
		const ENTER = 0.85; // section top, as a fraction of the viewport, at p=0
		function readProgress() {
			if (!section) return 1;
			const rect = section.getBoundingClientRect();
			const viewport = window.innerHeight;
			// Section bottom parks at the viewport bottom when p reaches 1.
			const travel = rect.height - viewport * (1 - ENTER);
			if (travel <= 0) return 1;
			const scrolled = viewport * ENTER - rect.top;
			return Math.min(Math.max(scrolled / travel, 0), 1);
		}

		function draw(progress: number) {
			if (!ctx) return;
			ctx.clearRect(0, 0, width, height);

			// The lattice is inset so the outermost points do not sit on the edge.
			const padX = width * 0.06;
			const padY = height * 0.08;
			const stepX = (width - padX * 2) / (COLS - 1);
			const stepY = (height - padY * 2) / (ROWS - 1);

			for (let i = 0; i < COUNT; i++) {
				const col = i % COLS;
				const row = Math.floor(i / COLS);

				const orderedX = padX + col * stepX;
				const orderedY = padY + row * stepY;

				const scatteredX = noise(i + 1) * width;
				const scatteredY = noise(i + 91.7) * height;

				/*
					Per-point stagger, so the field resolves in a wave from left to
					right instead of every point snapping home on the same frame.
					The column drives the offset; the small noise term keeps the
					wavefront from reading as a hard vertical line.

					The budget has to close: the latest point starts at MAX_DELAY and
					needs SETTLE to finish, so the two must sum to 1. Otherwise the
					last columns are still short of their place at progress 1 and the
					lattice never actually completes.
				*/
				const MAX_DELAY = 0.5;
				const SETTLE = 1 - MAX_DELAY;
				const delay = (col / (COLS - 1)) * (MAX_DELAY * 0.84) + noise(i + 17.3) * (MAX_DELAY * 0.16);
				const local = Math.min(Math.max((progress - delay) / SETTLE, 0), 1);
				// easeOutCubic
				const t = 1 - Math.pow(1 - local, 3);

				const x = scatteredX + (orderedX - scatteredX) * t;
				const y = scatteredY + (orderedY - scatteredY) * t;

				// Scattered points are grey and faint; as they find their place they
				// take on the palette and gain weight.
				const ramp = col / (COLS - 1);
				const target = [
					wine[0] + (blue[0] - wine[0]) * ramp,
					wine[1] + (blue[1] - wine[1]) * ramp,
					wine[2] + (blue[2] - wine[2]) * ramp
				];
				const r = Math.round(faint[0] + (target[0] - faint[0]) * t);
				const g = Math.round(faint[1] + (target[1] - faint[1]) * t);
				const b = Math.round(faint[2] + (target[2] - faint[2]) * t);

				const radius = 0.9 + t * 0.9;
				const alpha = 0.28 + t * 0.52;

				ctx.beginPath();
				ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
				ctx.arc(x, y, radius, 0, Math.PI * 2);
				ctx.fill();
			}
		}

		function tick() {
			draw(readProgress());
			frame = requestAnimationFrame(tick);
		}

		function start() {
			if (frame || reduceMotion.matches) return;
			frame = requestAnimationFrame(tick);
		}

		function stop() {
			cancelAnimationFrame(frame);
			frame = 0;
		}

		function applyMotionPreference() {
			if (reduceMotion.matches) {
				// No transformation, no frame loop: the reader gets the resolved
				// state, which is the one that carries the meaning anyway.
				stop();
			} else if (visible) {
				start();
			}
			paintOnce();
		}

		resize();
		applyMotionPreference();

		const resizeObserver = new ResizeObserver(() => {
			resize();
			paintOnce();
		});
		resizeObserver.observe(wrap);

		// The loop only runs while the field is on screen. Everywhere else it
		// costs nothing.
		const visibilityObserver = new IntersectionObserver(
			([entry]) => {
				visible = entry.isIntersecting;
				if (visible) applyMotionPreference();
				else stop();
			},
			{ rootMargin: '120px 0px' }
		);
		visibilityObserver.observe(wrap);

		const onThemeOrMotionChange = () => {
			wine = readColor('--color-hero-wine-light');
			blue = readColor('--color-hero-blue-light');
			faint = readColor('--color-ink-faint');
			applyMotionPreference();
		};
		reduceMotion.addEventListener('change', onThemeOrMotionChange);

		return () => {
			stop();
			resizeObserver.disconnect();
			visibilityObserver.disconnect();
			reduceMotion.removeEventListener('change', onThemeOrMotionChange);
			probe.remove();
		};
	});
</script>

<div bind:this={wrap} class="relative h-full w-full" aria-hidden="true">
	<canvas bind:this={canvas} class="block h-full w-full"></canvas>
</div>

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
		Points are drawn in quantised bands rather than one at a time. Every
		`fillStyle` assignment and every `fill()` is a context state change, so
		416 individual arcs cost 416 of each per frame. Bucketing by how far a
		point has settled collapses that to one path and one fill per band,
		because everything inside a band shares colour, alpha and radius.
	*/
	const BANDS = 14;

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

		/*
			Section geometry is cached instead of measured per frame.
			getBoundingClientRect forces the browser to flush pending layout, and
			doing that inside every animation frame is exactly the kind of work
			that turns a smooth field into a stuttering one.
		*/
		let sectionTop = 0;
		let sectionHeight = 0;
		function measureSection() {
			if (!section) return;
			const rect = section.getBoundingClientRect();
			sectionTop = rect.top + window.scrollY;
			sectionHeight = rect.height;
		}

		function resize() {
			if (!canvas || !wrap) return;
			const rect = wrap.getBoundingClientRect();
			const dpr = Math.min(window.devicePixelRatio, 2);
			width = rect.width;
			height = rect.height;
			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
			measureSection();
		}

		/**
		 * 0 as the section enters, 1 as its foot reaches the bottom of the
		 * viewport, so the field resolves exactly across the eight stations
		 * rather than finishing halfway down them. Derived from cached geometry
		 * and window.scrollY, so no scroll listener and no layout flush.
		 */
		const ENTER = 0.85; // section top, as a fraction of the viewport, at p=0
		function readTarget() {
			if (!section) return 1;
			const viewport = window.innerHeight;
			const travel = sectionHeight - viewport * (1 - ENTER);
			if (travel <= 0) return 1;
			const top = sectionTop - window.scrollY;
			return Math.min(Math.max((viewport * ENTER - top) / travel, 0), 1);
		}

		/*
			The rendered progress follows the scroll progress on a spring rather
			than tracking it exactly. Scroll input arrives in discrete jumps: a
			wheel notch, a trackpad flick, a jump to an anchor. Mapping those
			straight onto point positions puts every one of those jumps on screen.
			The spring gives the field its own momentum, so it reads as a physical
			thing being carried along instead of a value being assigned.

			Critically damped on purpose. Bounce here would read as wobble, since
			the reader is holding the scroll position steady and expects the field
			to arrive and stay.
		*/
		/*
			Tuned by measurement, not by feel. Against a hard 0.5 step input these
			values settle in ~450ms with zero overshoot (damping ratio 1.02) and
			cap per-frame movement at 0.05, so a wheel notch that would otherwise
			land as a single jump is spread across roughly ten frames. Softer
			settings smooth more but start to feel detached from the scroll;
			stiffer ones creep back towards showing the raw input.
		*/
		const STIFFNESS = 260;
		const DAMPING = 33;
		const STEP = 1 / 120; // fixed integration step, independent of frame rate
		let progress = 0;
		let velocity = 0;
		let lastTime = 0;
		let accumulator = 0;

		function advance(now: number) {
			const target = readTarget();
			// A tab that was in the background can hand back a huge delta. Capping
			// it keeps the spring from being launched across the whole field.
			let dt = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : STEP;
			lastTime = now;

			accumulator += dt;
			while (accumulator >= STEP) {
				const force = (target - progress) * STIFFNESS;
				velocity += (force - velocity * DAMPING) * STEP;
				progress += velocity * STEP;
				accumulator -= STEP;
			}

			return Math.abs(target - progress) < 0.0005 && Math.abs(velocity) < 0.0005;
		}

		function draw(value: number) {
			if (!ctx) return;
			ctx.clearRect(0, 0, width, height);

			// The lattice is inset so the outermost points do not sit on the edge.
			const padX = width * 0.06;
			const padY = height * 0.08;
			const stepX = (width - padX * 2) / (COLS - 1);
			const stepY = (height - padY * 2) / (ROWS - 1);

			// One bucket per settle band; each collects the points that share a
			// colour, alpha and radius this frame.
			const bands: { x: number; y: number }[][] = Array.from({ length: BANDS }, () => []);

			for (let i = 0; i < COUNT; i++) {
				const col = i % COLS;
				const row = (i / COLS) | 0;

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
				const delay =
					(col / (COLS - 1)) * (MAX_DELAY * 0.84) + noise(i + 17.3) * (MAX_DELAY * 0.16);
				const local = Math.min(Math.max((value - delay) / SETTLE, 0), 1);
				// easeOutCubic: entering elements start fast, which is what makes
				// arrival read as arrival rather than as drift.
				const t = 1 - Math.pow(1 - local, 3);

				const band = Math.min(BANDS - 1, (t * BANDS) | 0);
				bands[band].push({
					x: scatteredX + (orderedX - scatteredX) * t,
					y: scatteredY + (orderedY - scatteredY) * t
				});
			}

			for (let b = 0; b < BANDS; b++) {
				const points = bands[b];
				if (points.length === 0) continue;

				// Band centre, so a band's look matches the average of its members.
				const t = (b + 0.5) / BANDS;

				// Scattered points are grey and faint; as they find their place they
				// take on the palette and gain weight.
				const ramp = t;
				const r = Math.round(faint[0] + ((wine[0] + (blue[0] - wine[0]) * ramp) - faint[0]) * t);
				const g = Math.round(faint[1] + ((wine[1] + (blue[1] - wine[1]) * ramp) - faint[1]) * t);
				const bl = Math.round(faint[2] + ((wine[2] + (blue[2] - wine[2]) * ramp) - faint[2]) * t);

				ctx.fillStyle = `rgba(${r}, ${g}, ${bl}, ${0.28 + t * 0.52})`;
				ctx.beginPath();
				const radius = 0.9 + t * 0.9;
				for (const point of points) {
					ctx.moveTo(point.x + radius, point.y);
					ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
				}
				ctx.fill();
			}
		}

		/*
			A canvas that only ever paints from inside the frame loop is blank
			whenever the loop does not run: a background tab, a browser that
			throttles rAF while the page is occluded, or the moment between mount
			and the first frame. Painting once outside the loop means the field is
			always in a correct state, and the loop only keeps it current.
		*/
		function paintOnce() {
			if (reduceMotion.matches) {
				progress = 1;
			} else {
				// Settle instantly rather than springing in from wherever the last
				// frame left off, so a resize does not look like a re-entry.
				progress = readTarget();
				velocity = 0;
			}
			draw(progress);
		}

		function tick(now: number) {
			const settled = advance(now);
			draw(progress);
			// Once the spring has arrived there is nothing left to redraw. The loop
			// keeps running so a scroll picks it straight back up, but the draw is
			// the expensive half and it is skipped below.
			frame = requestAnimationFrame(settled ? idle : tick);
		}

		function idle(now: number) {
			const settled = advance(now);
			if (!settled) {
				frame = requestAnimationFrame(tick);
				return;
			}
			frame = requestAnimationFrame(idle);
		}

		function start() {
			if (frame || reduceMotion.matches) return;
			lastTime = 0;
			accumulator = 0;
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
		if (section) resizeObserver.observe(section);

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

		const onPreferenceChange = () => {
			wine = readColor('--color-hero-wine-light');
			blue = readColor('--color-hero-blue-light');
			faint = readColor('--color-ink-faint');
			applyMotionPreference();
		};
		reduceMotion.addEventListener('change', onPreferenceChange);

		return () => {
			stop();
			resizeObserver.disconnect();
			visibilityObserver.disconnect();
			reduceMotion.removeEventListener('change', onPreferenceChange);
			probe.remove();
		};
	});
</script>

<div bind:this={wrap} class="relative h-full w-full" aria-hidden="true">
	<canvas bind:this={canvas} class="block h-full w-full"></canvas>
</div>

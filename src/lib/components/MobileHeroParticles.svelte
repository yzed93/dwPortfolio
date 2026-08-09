<script lang="ts">
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;
	let wrap: HTMLDivElement;

	type Particle = {
		x: number;
		y: number;
		r: number;
		g: number;
		b: number;
		phase: number;
		amplitude: number;
		size: number;
	};

	// A deterministic hash keeps the sampled point field stable between renders.
	function hash(value: number) {
		const x = Math.sin(value * 91.3458) * 47453.5453;
		return x - Math.floor(x);
	}

	function readHexColor(value: string): [number, number, number] {
		const hex = value.trim().replace('#', '');
		if (hex.length !== 6) return [122, 20, 58];
		return [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16)) as [
			number,
			number,
			number
		];
	}

	onMount(() => {
		const context = canvas.getContext('2d') as CanvasRenderingContext2D | null;
		if (!context) return;
		const drawingContext = context;

		let particles: Particle[] = [];
		let frame = 0;
		let width = 0;
		let height = 0;
		let imageWidth = 0;
		let imageHeight = 0;
		let imageReady = false;
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
		const source = new Image();

		function sampleImage() {
			const sampleWidth = 260;
			const sampleHeight = Math.round(sampleWidth * (source.naturalHeight / source.naturalWidth));
			const sample = document.createElement('canvas');
			sample.width = sampleWidth;
			sample.height = sampleHeight;
			const sampleContext = sample.getContext('2d', { willReadFrequently: true });
			if (!sampleContext) return;
			sampleContext.drawImage(source, 0, 0, sampleWidth, sampleHeight);
			const pixels = sampleContext.getImageData(0, 0, sampleWidth, sampleHeight).data;
			const candidates: Particle[] = [];
			const styles = getComputedStyle(document.documentElement);
			const wine = readHexColor(styles.getPropertyValue('--color-hero-wine'));
			const wineLight = readHexColor(styles.getPropertyValue('--color-hero-wine-light'));

			for (let y = 0; y < sampleHeight; y += 2) {
				for (let x = 0; x < sampleWidth; x += 2) {
					const index = (y * sampleWidth + x) * 4;
					let r = pixels[index];
					let g = pixels[index + 1];
					let b = pixels[index + 2];
					const brightness = Math.max(r, g, b);
					if (brightness < 42) continue;

					const seed = y * sampleWidth + x;
					const keepChance = Math.min(0.92, 0.22 + (brightness / 255) * 0.78);
					if (hash(seed) > keepChance) continue;

					// Warm source pixels are remapped to the deliberate bordeaux ramp,
					// preventing pale salmon highlights from returning in the mobile hero.
					if (r > g * 1.2 && r > b * 0.92) {
						const intensity = Math.min(1, Math.max(0.16, brightness / 255));
						r = Math.round(wine[0] + (wineLight[0] - wine[0]) * intensity);
						g = Math.round(wine[1] + (wineLight[1] - wine[1]) * intensity);
						b = Math.round(wine[2] + (wineLight[2] - wine[2]) * intensity);
					}

					candidates.push({
						x: x / sampleWidth,
						y: y / sampleHeight,
						r,
						g,
						b,
						phase: hash(seed + 13) * Math.PI * 2,
						amplitude: 0.8 + hash(seed + 29) * 2.8,
						size: 0.55 + (brightness / 255) * 0.95
					});
				}
			}

			// Keep mobile paint work bounded while retaining the brighter edge points.
			const stride = Math.max(1, Math.ceil(candidates.length / 1750));
			particles = candidates.filter((_, index) => index % stride === 0);
			imageWidth = source.naturalWidth;
			imageHeight = source.naturalHeight;
			imageReady = true;
			resize();
		}

		function resize() {
			const bounds = wrap.getBoundingClientRect();
			width = Math.max(1, bounds.width);
			height = Math.max(1, bounds.height);
			const dpr = Math.min(window.devicePixelRatio, 2);
			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			drawingContext.setTransform(dpr, 0, 0, dpr, 0, 0);
			if (imageReady && reduceMotion.matches) draw(0);
		}

		function draw(timestamp: number) {
			if (!imageReady || imageWidth === 0 || imageHeight === 0) {
				drawingContext.clearRect(0, 0, width, height);
				return;
			}
			const paper = getComputedStyle(document.documentElement).getPropertyValue('--color-paper').trim();
			drawingContext.fillStyle = paper || '#070a14';
			drawingContext.fillRect(0, 0, width, height);

			const scale = Math.max(width / imageWidth, height / imageHeight);
			const drawnWidth = imageWidth * scale;
			const drawnHeight = imageHeight * scale;
			const offsetX = (width - drawnWidth) / 2;
			const offsetY = (height - drawnHeight) / 2;
			const loop = ((timestamp % 8000) / 8000) * Math.PI * 2;

			for (let index = 0; index < particles.length; index++) {
				const particle = particles[index];
				const baseX = offsetX + particle.x * drawnWidth;
				const baseY = offsetY + particle.y * drawnHeight;
				const local = loop + particle.phase;
				// Individual motion plus a coherent wave through the point field. The
				// base coordinates never change, so the triangle itself does not drift.
				const wave = Math.sin(loop * 2 + particle.x * 13 - particle.y * 9);
				const x = baseX + Math.cos(local) * particle.amplitude * 0.55 + wave * 0.7;
				const y = baseY + Math.sin(local * 2) * particle.amplitude + wave * 1.15;
				const pulse = 0.88 + 0.18 * Math.sin(local + loop);

				drawingContext.beginPath();
				drawingContext.arc(x, y, particle.size * pulse, 0, Math.PI * 2);
				drawingContext.fillStyle = `rgba(${particle.r}, ${particle.g}, ${particle.b}, ${0.68 + pulse * 0.24})`;
				drawingContext.fill();
			}
		}

		function animate(timestamp: number) {
			draw(timestamp);
			if (!reduceMotion.matches) frame = requestAnimationFrame(animate);
		}

		function syncMotion() {
			cancelAnimationFrame(frame);
			if (reduceMotion.matches) {
				draw(0);
			} else {
				frame = requestAnimationFrame(animate);
			}
		}

		source.addEventListener('load', sampleImage);
		source.src = '/images/portfolio-mobile-hero.jpg';
		const resizeObserver = new ResizeObserver(resize);
		resizeObserver.observe(wrap);
		reduceMotion.addEventListener('change', syncMotion);
		frame = requestAnimationFrame(animate);

		return () => {
			cancelAnimationFrame(frame);
			source.removeEventListener('load', sampleImage);
			resizeObserver.disconnect();
			reduceMotion.removeEventListener('change', syncMotion);
		};
	});
</script>

<div bind:this={wrap} class="relative h-full w-full overflow-hidden">
	<img
		src="/images/portfolio-mobile-hero.jpg"
		alt=""
		width="941"
		height="1672"
		loading="eager"
		fetchpriority="high"
		decoding="async"
		class="absolute inset-0 h-full w-full object-cover object-center"
	/>
	<canvas bind:this={canvas} class="absolute inset-0 h-full w-full" aria-hidden="true"></canvas>
</div>

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let canvas: HTMLCanvasElement;
	let wrap: HTMLDivElement;
	let cleanup: (() => void) | null = null;

	// Barycentric lattice per face. Rows stay aligned, so each face reads as a
	// triangle and the shared edges come out as crisp lines.
	const DIVISIONS = 78;
	const RADIUS = 2.55;
	// Small on purpose: the solid should breathe without losing its facets.
	const WAVE = 0.17;

	onMount(() => {
		let cancelled = false;

		(async () => {
			const THREE = await import('three');
			if (cancelled || !canvas || !wrap) return;

			const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

			const scene = new THREE.Scene();
			const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
			camera.position.set(0, 0, 8);

			const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

			const group = new THREE.Group();
			scene.add(group);

			// Colours come from the theme tokens rather than literals, so the scene
			// follows the palette. Reading them off a probe element yields rgb(),
			// which THREE.Color parses; the raw custom property may be oklab().
			const probe = document.createElement('span');
			probe.style.display = 'none';
			document.body.appendChild(probe);
			function readColor(token: string) {
				probe.style.color = `var(${token})`;
				return new THREE.Color(getComputedStyle(probe).color);
			}

			const paper = new THREE.Color();
			// Two related ramps let every facet drift slowly between wine and blue
			// without collapsing into one flat tint.
			const wineRamp = [new THREE.Color(), new THREE.Color(), new THREE.Color()];
			const blueRamp = [new THREE.Color(), new THREE.Color(), new THREE.Color()];
			function readPalette() {
				paper.copy(readColor('--color-paper'));
				wineRamp[0].copy(readColor('--color-hero-wine'));
				wineRamp[1].copy(readColor('--color-hero-wine-light'));
				wineRamp[2].copy(readColor('--color-accent-on-paper'));
				blueRamp[0].copy(readColor('--color-hero-blue'));
				blueRamp[1].copy(readColor('--color-hero-blue-light'));
				blueRamp[2].copy(readColor('--color-ink-soft'));
			}
			readPalette();

			const rampPick = new THREE.Color();
			function sampleRamp(t: number, ramp: import('three').Color[], out: import('three').Color) {
				const clamped = t < 0 ? 0 : t > 1 ? 1 : t;
				const scaled = clamped * (ramp.length - 1);
				const i = Math.min(ramp.length - 2, Math.floor(scaled));
				return out.copy(ramp[i]).lerp(ramp[i + 1], scaled - i);
			}

			// Round dots. A generated texture keeps the component self-contained.
			const dot = document.createElement('canvas');
			dot.width = dot.height = 64;
			const dctx = dot.getContext('2d')!;
			dctx.beginPath();
			dctx.arc(32, 32, 28, 0, Math.PI * 2);
			dctx.fillStyle = '#ffffff';
			dctx.fill();
			const dotTexture = new THREE.CanvasTexture(dot);

			// Regular tetrahedron from alternating cube corners.
			const s = RADIUS / Math.sqrt(3);
			const corners = [
				new THREE.Vector3(s, s, s),
				new THREE.Vector3(s, -s, -s),
				new THREE.Vector3(-s, s, -s),
				new THREE.Vector3(-s, -s, s)
			];
			const faces = [
				[0, 1, 2],
				[0, 1, 3],
				[0, 2, 3],
				[1, 2, 3]
			];

			// Faces share edges, so points are deduplicated by quantised position.
			// Without this every edge would be drawn twice and read heavier than
			// the surfaces around it.
			const seen = new Map<string, number>();
			const xs: number[] = [];
			const ys: number[] = [];
			const zs: number[] = [];
			const edgeFlags: number[] = [];
			const faceOf: number[] = [];
			const tmp = new THREE.Vector3();

			faces.forEach(([ia, ib, ic], faceIndex) => {
				const a = corners[ia];
				const b = corners[ib];
				const c = corners[ic];
				for (let i = 0; i <= DIVISIONS; i++) {
					for (let j = 0; j <= DIVISIONS - i; j++) {
						const m = DIVISIONS - i - j;
						const wa = i / DIVISIONS;
						const wb = j / DIVISIONS;
						const wc = m / DIVISIONS;
						tmp.set(
							a.x * wa + b.x * wb + c.x * wc,
							a.y * wa + b.y * wb + c.y * wc,
							a.z * wa + b.z * wb + c.z * wc
						);
						const key = `${tmp.x.toFixed(3)}|${tmp.y.toFixed(3)}|${tmp.z.toFixed(3)}`;
						const onEdge = i === 0 || j === 0 || m === 0 ? 1 : 0;
						const hit = seen.get(key);
						if (hit !== undefined) {
							if (onEdge) edgeFlags[hit] = 1;
							continue;
						}
						seen.set(key, xs.length);
						xs.push(tmp.x);
						ys.push(tmp.y);
						zs.push(tmp.z);
						edgeFlags.push(onEdge);
						faceOf.push(faceIndex);
					}
				}
			});

			const count = xs.length;
			const baseX = Float32Array.from(xs);
			const baseY = Float32Array.from(ys);
			const baseZ = Float32Array.from(zs);
			const isEdge = Uint8Array.from(edgeFlags);
			const faceIdx = Uint8Array.from(faceOf);

			// Displacement runs along the outward direction, so the solid inflates
			// and deflates instead of shearing.
			const dirX = new Float32Array(count);
			const dirY = new Float32Array(count);
			const dirZ = new Float32Array(count);

			// Wave terms split with the angle-addition identities, so the per-frame
			// loop needs no trigonometry at all.
			const sinA = new Float32Array(count);
			const cosA = new Float32Array(count);
			const sinB = new Float32Array(count);
			const cosB = new Float32Array(count);
			const sinC = new Float32Array(count);
			const cosC = new Float32Array(count);

			// Where each point sits on the colour ramp. Height carries the main
			// gradient, the face index separates the facets, and a slow swirl keeps
			// neighbouring points from banding into flat stripes.
			const rampT = new Float32Array(count);
			const wineR = new Float32Array(count);
			const wineG = new Float32Array(count);
			const wineB = new Float32Array(count);
			const blueR = new Float32Array(count);
			const blueG = new Float32Array(count);
			const blueB = new Float32Array(count);
			const colorPhaseSin = new Float32Array(count);
			const colorPhaseCos = new Float32Array(count);

			for (let n = 0; n < count; n++) {
				const x = baseX[n];
				const y = baseY[n];
				const z = baseZ[n];
				const len = Math.hypot(x, y, z) || 1;
				dirX[n] = x / len;
				dirY[n] = y / len;
				dirZ[n] = z / len;

				sinA[n] = Math.sin(x * 1.35);
				cosA[n] = Math.cos(x * 1.35);
				sinB[n] = Math.sin(y * 1.1);
				cosB[n] = Math.cos(y * 1.1);
				sinC[n] = Math.sin(z * 1.5);
				cosC[n] = Math.cos(z * 1.5);

				const height = 1 - THREE.MathUtils.clamp((y / RADIUS + 1) / 2, 0, 1);
				const facet = faceIdx[n] / (faces.length - 1);
				const swirl = 0.5 + 0.5 * Math.sin(x * 1.6 + z * 1.9);
				rampT[n] = THREE.MathUtils.clamp(0.56 * height + 0.29 * facet + 0.15 * swirl, 0, 1);
				const colorPhase = rampT[n] * Math.PI * 2;
				colorPhaseSin[n] = Math.sin(colorPhase);
				colorPhaseCos[n] = Math.cos(colorPhase);
			}

			let paperR = 0;
			let paperG = 0;
			let paperB = 0;
			function bakeTints() {
				for (let n = 0; n < count; n++) {
					sampleRamp(rampT[n], wineRamp, rampPick);
					if (isEdge[n] === 1) rampPick.lerp(wineRamp[2], 0.38);
					wineR[n] = rampPick.r;
					wineG[n] = rampPick.g;
					wineB[n] = rampPick.b;

					sampleRamp(1 - rampT[n] * 0.82, blueRamp, rampPick);
					if (isEdge[n] === 1) rampPick.lerp(blueRamp[1], 0.38);
					blueR[n] = rampPick.r;
					blueG[n] = rampPick.g;
					blueB[n] = rampPick.b;
				}
				paperR = paper.r;
				paperG = paper.g;
				paperB = paper.b;
			}
			bakeTints();

			// pow(depth, 0.62) as a lookup, so the colour curve costs an index.
			const FADE_STEPS = 256;
			const fadeLut = new Float32Array(FADE_STEPS + 1);
			for (let i = 0; i <= FADE_STEPS; i++) {
				fadeLut[i] = 0.18 + Math.pow(i / FADE_STEPS, 0.62) * 0.82;
			}

			/*
				Pointer ripples. Each one is a band travelling outward from the point
				the cursor touched, stored in the object's own space so it rides along
				with the rotation. The profile is a lookup as well, which keeps the
				per-point cost to a subtraction, a compare and an array read.
			*/
			const RIPPLE_LIFE = 2.3; // seconds until a ripple is spent
			const RIPPLE_SPEED = 2.1; // world units per second
			const RIPPLE_WIDTH = 0.85; // half-width of the travelling band
			const RIPPLE_AMP = 0.4;
			const RIPPLE_STEPS = 128;
			const rippleLut = new Float32Array(RIPPLE_STEPS + 1);
			for (let i = 0; i <= RIPPLE_STEPS; i++) {
				const t = (i / RIPPLE_STEPS) * 2 - 1; // -1 .. 1 across the band
				const window = (1 - t * t) * (1 - t * t);
				rippleLut[i] = Math.sin(t * Math.PI) * window;
			}

			// A single reusable ripple guarantees that pointer movement cannot layer
			// several waves on top of each other.
			const ripple = { x: 0, y: 0, z: 0, born: -Infinity };

			function spawnRipple(x: number, y: number, z: number, time: number) {
				ripple.x = x;
				ripple.y = y;
				ripple.z = z;
				ripple.born = time;
			}

			const positions = new Float32Array(count * 3);
			const colors = new Float32Array(count * 3);
			const geometry = new THREE.BufferGeometry();
			geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
			geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

			const material = new THREE.PointsMaterial({
				size: 0.03,
				sizeAttenuation: true,
				map: dotTexture,
				transparent: true,
				alphaTest: 0.45,
				vertexColors: true,
				depthWrite: false
			});
			const points = new THREE.Points(geometry, material);
			group.add(points);

			// Positions and colours are rebuilt in one pass; depth is mixed toward
			// the page colour so the far side recedes without alpha sorting.
			function build(time: number, rotY: number) {
				const cos = Math.cos(rotY);
				const sin = Math.sin(rotY);
				const span = RADIUS * 2.3;
				const invSpan = 1 / span;

				const ca = Math.cos(time * 0.5);
				const sa = Math.sin(time * 0.5);
				const cb = Math.cos(time * 0.35);
				const sb = Math.sin(time * 0.35);
				const cc = Math.cos(time * 0.7);
				const sc = Math.sin(time * 0.7);
				// One full colour cycle takes roughly 24 seconds. Per-point phase
				// offsets keep both families visible during the transition.
				const colorAngle = time * 0.26;
				const colorSin = Math.sin(colorAngle);
				const colorCos = Math.cos(colorAngle);

				const rippleAge = time - ripple.born;
				const rippleLive = rippleAge >= 0 && rippleAge <= RIPPLE_LIFE;
				const rippleFront = rippleAge * RIPPLE_SPEED;
				const rippleDecay = rippleLive ? 1 - rippleAge / RIPPLE_LIFE : 0;
				const rippleStrength = rippleDecay * rippleDecay;

				for (let n = 0; n < count; n++) {
					const termA = sinA[n] * ca + cosA[n] * sa;
					const termB = cosB[n] * cb + sinB[n] * sb;
					const termC = sinC[n] * cc + cosC[n] * sc;
					let d = WAVE * (termA * termB + 0.5 * termC);

					const bx = baseX[n];
					const by = baseY[n];
					const bz = baseZ[n];

					let energy = 0;
					if (rippleLive) {
						const dx = bx - ripple.x;
						const dy = by - ripple.y;
						const dz = bz - ripple.z;
						const dist2 = dx * dx + dy * dy + dz * dz;
						// Cheap rejects first: the band only covers a shell, so most
						// points never need the square root.
						const outer = rippleFront + RIPPLE_WIDTH;
						const inner = rippleFront - RIPPLE_WIDTH;
						if (dist2 <= outer * outer && (inner <= 0 || dist2 >= inner * inner)) {
							const t = (Math.sqrt(dist2) - rippleFront) / RIPPLE_WIDTH; // -1 .. 1
							let idx = ((t + 1) * 0.5 * RIPPLE_STEPS) | 0;
							if (idx < 0) idx = 0;
							else if (idx > RIPPLE_STEPS) idx = RIPPLE_STEPS;
							const w = rippleLut[idx] * rippleStrength;
							d += RIPPLE_AMP * w;
							energy += w < 0 ? -w : w;
						}
					}

					const i3 = n * 3;
					const x = bx + dirX[n] * d;
					const y = by + dirY[n] * d;
					const z = bz + dirZ[n] * d;

					positions[i3] = x;
					positions[i3 + 1] = y;
					positions[i3 + 2] = z;

					// z after the group's Y rotation, without a full matrix transform
					const zr = z * cos - x * sin;
					let depth = (zr + span * 0.5) * invSpan;
					depth = depth < 0 ? 0 : depth > 1 ? 1 : depth;

					// The crest also brightens, so the wave is visible head-on and not
					// only in the silhouette.
					let fade = fadeLut[(depth * FADE_STEPS) | 0] + energy * 0.75;
					if (fade > 1) fade = 1;

					const colorMix =
						0.5 + 0.5 * (colorPhaseSin[n] * colorCos + colorPhaseCos[n] * colorSin);
					const mixedR = wineR[n] + (blueR[n] - wineR[n]) * colorMix;
					const mixedG = wineG[n] + (blueG[n] - wineG[n]) * colorMix;
					const mixedB = wineB[n] + (blueB[n] - wineB[n]) * colorMix;
					colors[i3] = paperR + (mixedR - paperR) * fade;
					colors[i3 + 1] = paperG + (mixedG - paperG) * fade;
					colors[i3 + 2] = paperB + (mixedB - paperB) * fade;
				}
				geometry.attributes.position.needsUpdate = true;
				geometry.attributes.color.needsUpdate = true;
			}

			let pointerX = 0;
			let pointerY = 0;
			let easedX = 0;
			let easedY = 0;

			/*
				Touching the solid spawns a ripple. Rather than raycasting against
				every point, the cursor ray is intersected with the sphere the
				tetrahedron sits in, which is a closed-form solution and accurate
				enough to place a wave origin. The hit is converted into the group's
				own space so the ripple travels with the rotation.
			*/
			const raycaster = new THREE.Raycaster();
			const ndc = new THREE.Vector2();
			const bounds = new THREE.Sphere(new THREE.Vector3(0, 0, 0), RADIUS * 0.92);
			const hit = new THREE.Vector3();
			let lastSpawn = -Infinity;
			let clock = 0; // mirrors `elapsed` so the handler can stamp ripples

			function tryRipple(ndcX: number, ndcY: number) {
				if (ndcX < -1 || ndcX > 1 || ndcY < -1 || ndcY > 1) return;
				// Debounce for the full lifetime: a second contact can only trigger
				// after the previous wave has completely dissipated.
				if (clock - lastSpawn < RIPPLE_LIFE) return;
				ndc.set(ndcX, ndcY);
				raycaster.setFromCamera(ndc, camera);
				if (!raycaster.ray.intersectSphere(bounds, hit)) return;
				group.updateMatrixWorld();
				group.worldToLocal(hit);
				spawnRipple(hit.x, hit.y, hit.z, clock);
				lastSpawn = clock;
			}

			// The scene sits behind the copy with pointer-events off, so the pointer
			// is tracked on window and mapped into the wrapper's box.
			const clamp = (v: number) => (v < -1.4 ? -1.4 : v > 1.4 ? 1.4 : v);
			function onPointerMove(e: PointerEvent) {
				const rect = wrap.getBoundingClientRect();
				if (rect.width === 0 || rect.height === 0) return;
				const relX = (e.clientX - rect.left) / rect.width;
				const relY = (e.clientY - rect.top) / rect.height;
				pointerX = clamp((relX - 0.5) * 2);
				pointerY = clamp((relY - 0.5) * 2);
				tryRipple(relX * 2 - 1, -(relY * 2 - 1));
			}
			function onPointerLeave() {
				pointerX = 0;
				pointerY = 0;
			}
			window.addEventListener('pointermove', onPointerMove, { passive: true });
			document.addEventListener('pointerleave', onPointerLeave);

			// Re-bake when the palette changes (the light test route flips the tokens).
			const themeObserver = new MutationObserver(() => {
				readPalette();
				bakeTints();
			});
			themeObserver.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ['data-theme']
			});

			function resize() {
				const { width, height } = wrap.getBoundingClientRect();
				if (width === 0 || height === 0) return;
				renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
				renderer.setSize(width, height, false);
				camera.aspect = width / height;
				camera.updateProjectionMatrix();
			}
			resize();
			const ro = new ResizeObserver(resize);
			ro.observe(wrap);

			// A solid reads from every angle, so it turns continuously.
			let spin = 0.6;
			let elapsed = 0;
			let last = performance.now();
			let frame = 0;

			function tick(now: number) {
				const delta = Math.min((now - last) / 1000, 0.1);
				last = now;
				elapsed += delta;
				clock = elapsed;
				spin += delta * 0.14;

				easedX += (pointerX - easedX) * 0.05;
				easedY += (pointerY - easedY) * 0.05;

				const rotY = spin + easedX * 0.32;
				group.rotation.y = rotY;
				group.rotation.x = -0.15 + Math.sin(elapsed * 0.19) * 0.07 + easedY * 0.15;

				build(elapsed, rotY);
				renderer.render(scene, camera);
				frame = requestAnimationFrame(tick);
			}

			function start() {
				if (frame) return;
				last = performance.now();
				frame = requestAnimationFrame(tick);
			}
			function stop() {
				cancelAnimationFrame(frame);
				frame = 0;
			}

			// No reason to keep a render loop alive once the hero is scrolled past.
			const io = new IntersectionObserver(
				([entry]) => {
					if (reduceMotion) return;
					if (entry.isIntersecting) start();
					else stop();
				},
				{ threshold: 0 }
			);
			io.observe(wrap);

			if (reduceMotion) {
				group.rotation.y = 0.6;
				group.rotation.x = -0.15;
				build(0, 0.6);
				renderer.render(scene, camera);
			} else {
				start();
			}

			cleanup = () => {
				stop();
				io.disconnect();
				ro.disconnect();
				themeObserver.disconnect();
				probe.remove();
				window.removeEventListener('pointermove', onPointerMove);
				document.removeEventListener('pointerleave', onPointerLeave);
				geometry.dispose();
				material.dispose();
				dotTexture.dispose();
				renderer.dispose();
			};
		})();

		return () => {
			cancelled = true;
		};
	});

	onDestroy(() => {
		cleanup?.();
	});
</script>

<div bind:this={wrap} class="h-full w-full" aria-hidden="true">
	<canvas bind:this={canvas} class="h-full w-full"></canvas>
</div>

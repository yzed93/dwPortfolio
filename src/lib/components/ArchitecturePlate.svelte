<script lang="ts">
	import { onMount } from 'svelte';
	import { langState } from '$lib/state/lang.svelte';

	let labels = $derived(
		langState.current === 'de'
			? {
					title: 'Plattformarchitektur',
					nodes: [
						{ label: 'Zugang', name: 'NetScaler', detail: 'Gateway + Sicherheit' },
						{ label: 'Delivery', name: 'Citrix CVAD', detail: 'Steuerung + Images' },
						{ label: 'Workloads', name: 'Azure + On-Prem', detail: 'Desktops + Apps' }
					],
					automation: 'Automatisierung',
					orchestration: 'PowerShell-Orchestrierung',
					steps: ['Build', 'Update', 'Restore'],
					operations: 'Regelbetrieb',
					operationSteps: ['Monitoring', 'Change', 'SOPs'],
					note: 'Vom sicheren Zugang bis zum dokumentierten Betrieb'
				}
			: {
					title: 'Platform architecture',
					nodes: [
						{ label: 'Access', name: 'NetScaler', detail: 'Gateway + security' },
						{ label: 'Delivery', name: 'Citrix CVAD', detail: 'Control + images' },
						{ label: 'Workloads', name: 'Azure + on-prem', detail: 'Desktops + apps' }
					],
					automation: 'Automation',
					orchestration: 'PowerShell orchestration',
					steps: ['Build', 'Update', 'Recover'],
					operations: 'Operations',
					operationSteps: ['Monitoring', 'Change', 'SOPs'],
					note: 'From secure access to documented operations'
				}
	);

	let plate = $state<HTMLElement | null>(null);
	/*
		The whole plate runs on one clock. `is-running` gates every animation at
		once, so the signal, the pipeline and the status mark can never drift apart
		and nothing burns frames while the hero is scrolled past.
	*/
	let running = $state(false);

	onMount(() => {
		const node = plate;
		if (!node) return;

		const cleanups: Array<() => void> = [];

		const visibility = new IntersectionObserver(
			([entry]) => {
				running = entry.isIntersecting;
			},
			{ rootMargin: '80px' }
		);
		visibility.observe(node);
		cleanups.push(() => visibility.disconnect());

		/*
			The tilt is a pointer affordance, not a toy: it exists so the plate reads
			as a physical object on the paper rather than a printed panel.

			The gate is per event, not per mount. A touch that happens to emit
			pointermove must not tilt anything, and a hybrid laptop where the media
			query says coarse but the user is on a mouse should still get it, so the
			only reliable signal is the pointer type of the event in hand.
		*/
		const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
		let frame = 0;

		const onMove = (event: PointerEvent) => {
			if (frame || event.pointerType !== 'mouse' || reducedMotion.matches) return;
			frame = requestAnimationFrame(() => {
				frame = 0;
				const box = node.getBoundingClientRect();
				// -0.5 to 0.5 from the plate's own centre, so the tilt is independent
				// of where the plate happens to sit in the layout.
				const x = (event.clientX - box.left) / box.width - 0.5;
				const y = (event.clientY - box.top) / box.height - 0.5;
				node.style.setProperty('--tilt-x', `${(-y * 3.4).toFixed(2)}deg`);
				node.style.setProperty('--tilt-y', `${(x * 4.2).toFixed(2)}deg`);
				node.style.setProperty('--shadow-x', `${(18 - x * 16).toFixed(1)}px`);
				node.style.setProperty('--shadow-y', `${(24 - y * 12).toFixed(1)}px`);
			});
		};

		const onLeave = () => {
			if (frame) cancelAnimationFrame(frame);
			frame = 0;
			node.style.removeProperty('--tilt-x');
			node.style.removeProperty('--tilt-y');
			node.style.removeProperty('--shadow-x');
			node.style.removeProperty('--shadow-y');
		};

		node.addEventListener('pointermove', onMove);
		node.addEventListener('pointerleave', onLeave);
		cleanups.push(() => {
			node.removeEventListener('pointermove', onMove);
			node.removeEventListener('pointerleave', onLeave);
			onLeave();
		});

		return () => cleanups.forEach((fn) => fn());
	});
</script>

<aside
	bind:this={plate}
	class="plate"
	class:is-running={running}
	aria-label={labels.title}
>
	<div class="plate-head">
		<span class="meta">{labels.title}</span>
	</div>

	<div class="flow-wrap">
		<!--
			The travelling signal is decoration over a structure that already reads
			without it, so it stays out of the accessibility tree entirely.
		-->
		<span class="signal-rail" aria-hidden="true"><span class="signal-pulse"></span></span>

		<ol class="system-flow" aria-label={labels.title}>
			{#each labels.nodes as node, i (node.name)}
				<li class:is-core={i === 1} style="--node: {i}">
					<span class="node-live" aria-hidden="true"></span>
					<span class="meta node-label">{node.label}</span>
					<strong>{node.name}</strong>
					<span class="meta node-detail">{node.detail}</span>
				</li>
			{/each}
		</ol>
	</div>

	<div class="automation-band">
		<div>
			<span class="meta">{labels.automation}</span>
			<strong>{labels.orchestration}</strong>
		</div>
		<ol class="automation-steps meta">
			{#each labels.steps as step, i (step)}
				<li style="--step: {i}">
					<span class="step-track" aria-hidden="true"></span>
					{step}
				</li>
			{/each}
		</ol>
	</div>

	<div class="operations-block">
		<span class="meta operations-label">{labels.operations}</span>
		<ol>
			{#each labels.operationSteps as step (step)}
				<li>
					<strong>{step}</strong>
				</li>
			{/each}
		</ol>
	</div>

	<div class="plate-foot">
		<p class="meta">{labels.note}</p>
		<span class="status-mark" aria-hidden="true"></span>
	</div>
</aside>

<style>
	/*
		One cycle for the whole plate: signal traverses the topology, hands off to
		the orchestration pipeline, the pipeline runs its three steps, the status
		mark acknowledges, then the plate rests. Every keyframe below is written as
		a percentage of this single duration, which is what keeps the sequence
		reading as one machine rather than four loops that happen to share a box.

		The rest at the end is deliberate and long. A diagram that never stops
		moving is a nag; a system that reports in and goes quiet is credible.
	*/
	.plate {
		--cycle: 9s;
		--tilt-x: 0deg;
		--tilt-y: 0deg;
		--shadow-x: 18px;
		--shadow-y: 24px;

		position: relative;
		padding: clamp(1.25rem, 3vw, 2rem);
		border: 1px solid var(--color-line);
		background: color-mix(in srgb, #fff 38%, var(--color-paper));
		box-shadow:
			var(--shadow-x) var(--shadow-y) 60px -28px color-mix(in srgb, var(--color-ink) 42%, transparent),
			calc(var(--shadow-x) * 0.18) calc(var(--shadow-y) * 0.18) 14px -10px
				color-mix(in srgb, var(--color-ink) 30%, transparent);
		transform: perspective(1400px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y));
		transform-style: preserve-3d;
		transition:
			transform 400ms var(--ease-out-strong),
			box-shadow 400ms var(--ease-out-strong);
		will-change: transform;
	}

	.plate::before {
		position: absolute;
		top: -1px;
		left: -1px;
		width: 4.5rem;
		height: 4px;
		content: '';
		background: var(--color-accent-on-paper);
	}

	.plate-head,
	.plate-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
	}

	.plate-foot .meta {
		color: var(--color-ink-faint);
	}

	.flow-wrap {
		position: relative;
		margin-top: 2.25rem;
	}

	/*
		The rail spans the full row, across the grid gaps, because the signal has to
		visibly cross the arrowheads between the nodes. The node borders underneath
		stay the static structure; this is the traffic on top of it.
	*/
	.signal-rail {
		position: absolute;
		top: -2px;
		right: 0;
		left: 0;
		z-index: 3;
		overflow: hidden;
		height: 3px;
		pointer-events: none;
	}

	/*
		The packet is a comet, not a dash: a long faint tail behind a solid head, so
		the direction of travel is legible even at 3px.
	*/
	.signal-pulse {
		display: block;
		width: 26%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent,
			color-mix(in srgb, var(--color-signal) 30%, transparent) 30%,
			color-mix(in srgb, var(--color-signal) 70%, transparent) 66%,
			var(--color-signal) 84%,
			var(--color-signal) 96%,
			transparent
		);
		opacity: 0;
		transform: translate3d(-110%, 0, 0);
	}

	.system-flow {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: clamp(0.45rem, 1.2vw, 0.8rem);
	}

	.system-flow li {
		position: relative;
		/*
			Own stacking context, so the acknowledgement overlay below can sit at
			z-index -1: above the node's own background, behind its text.
		*/
		isolation: isolate;
		display: flex;
		min-width: 0;
		min-height: clamp(6.8rem, 9vw, 8.2rem);
		flex-direction: column;
		justify-content: flex-end;
		padding: clamp(0.65rem, 1.5vw, 1rem);
		border-top: 1px solid var(--color-ink);
		border-bottom: 1px solid var(--color-line);
	}

	.system-flow li:not(:last-child)::after {
		position: absolute;
		top: -3px;
		right: -0.65rem;
		z-index: 1;
		width: 0;
		height: 0;
		content: '';
		border-top: 3px solid transparent;
		border-bottom: 3px solid transparent;
		border-left: 5px solid var(--color-ink);
	}

	.system-flow .is-core {
		border-top-width: 3px;
		border-top-color: var(--color-accent-on-paper);
		background: color-mix(in srgb, var(--color-accent-on-paper) 6%, transparent);
	}

	/*
		A node acknowledges the passing signal by lighting up as a surface, not as
		another line: the packet owns the rail, the unit owns the box. Without that
		split the two effects sit on the same pixel row and cancel each other out.
		Opacity only, so three of these cost nothing.
	*/
	.node-live {
		position: absolute;
		z-index: -1;
		inset: -1px 0 0;
		border-top: 2px solid var(--color-signal);
		background: linear-gradient(
			to bottom,
			color-mix(in srgb, var(--color-signal) 15%, transparent),
			transparent 66%
		);
		opacity: 0;
		pointer-events: none;
	}

	.is-core .node-live {
		inset: -3px 0 0;
		border-top-width: 3px;
	}

	.node-label,
	.node-detail {
		color: var(--color-ink-faint);
	}

	.system-flow strong {
		display: block;
		margin: 0.3rem 0 0.45rem;
		font-family: var(--font-display);
		font-size: clamp(1rem, 2vw, 1.45rem);
		font-weight: 600;
		line-height: 1;
		letter-spacing: -0.025em;
		color: var(--color-ink);
	}

	.automation-band {
		display: grid;
		gap: 0.8rem;
		margin-top: 1.15rem;
		padding: clamp(0.9rem, 1.5vw, 1.15rem);
		background: var(--color-signal);
		color: var(--color-on-signal);
	}

	.automation-band > div > span {
		display: block;
		opacity: 0.72;
	}

	.automation-band strong {
		display: block;
		margin-top: 0.35rem;
		font-family: var(--font-display);
		font-size: clamp(1.3rem, 2.6vw, 1.9rem);
		font-weight: 570;
		line-height: 1;
		letter-spacing: -0.025em;
	}

	.automation-steps {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		border-top: 1px solid color-mix(in srgb, var(--color-on-signal) 35%, transparent);
	}

	.automation-steps li {
		position: relative;
		display: grid;
		gap: 0.25rem;
		padding-top: 0.65rem;
		/* Idle steps sit back so the running one is unambiguous. */
		color: color-mix(in srgb, var(--color-on-signal) 62%, transparent);
		transition: color 260ms var(--ease-out-strong);
	}

	.automation-steps li:not(:first-child) {
		padding-left: 0.6rem;
		border-left: 1px solid color-mix(in srgb, var(--color-on-signal) 35%, transparent);
	}

	/*
		The pipeline reads as work being done: each step fills its own rule left to
		right in turn and stays filled until the run completes.
	*/
	.step-track {
		position: absolute;
		top: -1px;
		right: 0;
		left: 0;
		height: 1px;
		background: var(--color-on-signal);
		transform: scaleX(0);
		transform-origin: left center;
	}

	.automation-steps li:not(:first-child) .step-track {
		left: 0.6rem;
	}

	.operations-block {
		display: grid;
		grid-template-columns: minmax(5.5rem, 0.36fr) 1fr;
		gap: 1rem;
		align-items: stretch;
		margin-top: 1rem;
	}

	.operations-label {
		padding-top: 0.75rem;
		color: var(--color-ink-faint);
	}

	.operations-block ol {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		border-top: 1px solid var(--color-line);
	}

	.operations-block li {
		display: grid;
		gap: 0.2rem;
		padding: 0.7rem 0 0.35rem;
	}

	.operations-block li:not(:first-child) {
		padding-left: 0.6rem;
		border-left: 1px solid var(--color-line);
	}

	.operations-block strong {
		font-size: clamp(0.7rem, 1.25vw, 0.86rem);
		font-weight: 550;
		color: var(--color-ink-soft);
	}

	.plate-foot {
		margin-top: 1rem;
		padding-top: 0.8rem;
		border-top: 1px solid var(--color-line);
	}

	.plate-foot p {
		max-width: 42ch;
	}

	.status-mark {
		width: 0.55rem;
		height: 0.55rem;
		flex: 0 0 auto;
		border: 2px solid var(--color-accent-on-paper);
		background: var(--color-paper);
	}

	@media (max-width: 420px) {
		.plate {
			padding: 1.15rem;
		}

		.node-detail {
			display: none;
		}

		.system-flow li {
			min-height: 6.8rem;
			padding: 0.55rem;
		}

		.operations-block {
			grid-template-columns: 1fr;
			gap: 0.25rem;
		}
	}

	@media (prefers-reduced-motion: no-preference) {
		/* Entrance: the plate assembles once, before the cycle takes over. */
		.system-flow li,
		.automation-band,
		.operations-block,
		.plate-foot {
			opacity: 0;
			transform: translateY(10px);
			animation: topology-node-in 520ms var(--ease-out-strong) forwards;
		}

		.system-flow li:nth-child(1) { animation-delay: 180ms; }
		.system-flow li:nth-child(2) { animation-delay: 250ms; }
		.system-flow li:nth-child(3) { animation-delay: 320ms; }
		.automation-band { animation-delay: 400ms; }
		.operations-block { animation-delay: 480ms; }
		.plate-foot { animation-delay: 540ms; }

		/*
			The run itself. All four animations share `--cycle` and start together on
			`.is-running`, so their phases are fixed relative to one another.
		*/
		.is-running .signal-pulse {
			animation: signal-travel var(--cycle) linear 900ms infinite;
		}

		.is-running .node-live {
			animation: node-ack var(--cycle) linear 900ms infinite;
			/* Each node lights as the pulse reaches it: 7% of the cycle apart. */
			animation-delay: calc(900ms + var(--node) * var(--cycle) * 0.07);
		}

		.is-running .step-track {
			animation: step-run var(--cycle) linear 900ms infinite;
			animation-delay: calc(900ms + var(--step) * var(--cycle) * 0.12);
		}

		.is-running .automation-steps li {
			animation: step-active var(--cycle) linear 900ms infinite;
			animation-delay: calc(900ms + var(--step) * var(--cycle) * 0.12);
		}

		.is-running .status-mark {
			animation: status-ack var(--cycle) linear 900ms infinite;
		}
	}

	@keyframes topology-node-in {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* 0-24%: one packet crosses access, delivery, workloads, then the rail rests. */
	@keyframes signal-travel {
		0% {
			opacity: 0;
			transform: translate3d(-110%, 0, 0);
		}
		2% {
			opacity: 1;
		}
		22% {
			opacity: 1;
		}
		24% {
			opacity: 0;
			transform: translate3d(390%, 0, 0);
		}
		100% {
			opacity: 0;
			transform: translate3d(390%, 0, 0);
		}
	}

	/* A node holds its acknowledgement briefly, then releases. */
	@keyframes node-ack {
		0%,
		2% {
			opacity: 0;
		}
		6% {
			opacity: 1;
		}
		14% {
			opacity: 1;
		}
		22%,
		100% {
			opacity: 0;
		}
	}

	/* Build fills, then Update, then Restore; all three reset together at 72%. */
	@keyframes step-run {
		0%,
		28% {
			transform: scaleX(0);
		}
		38% {
			transform: scaleX(1);
		}
		60% {
			transform: scaleX(1);
			transform-origin: left center;
		}
		61% {
			transform-origin: right center;
		}
		68% {
			transform: scaleX(0);
			transform-origin: right center;
		}
		100% {
			transform: scaleX(0);
			transform-origin: right center;
		}
	}

	@keyframes step-active {
		0%,
		27% {
			color: color-mix(in srgb, var(--color-on-signal) 62%, transparent);
		}
		30%,
		60% {
			color: var(--color-on-signal);
		}
		68%,
		100% {
			color: color-mix(in srgb, var(--color-on-signal) 62%, transparent);
		}
	}

	/* The rack light: two short acknowledgements after the run, then dark. */
	@keyframes status-ack {
		0%,
		74% {
			background: var(--color-paper);
		}
		76%,
		79% {
			background: var(--color-accent-on-paper);
		}
		81%,
		83% {
			background: var(--color-paper);
		}
		85%,
		88% {
			background: var(--color-accent-on-paper);
		}
		90%,
		100% {
			background: var(--color-paper);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.plate {
			transform: none;
			transition: none;
		}

		.system-flow li,
		.automation-band,
		.operations-block,
		.plate-foot {
			animation: none;
			opacity: 1;
			transform: none;
		}

		/*
			Static, but not blank: the plate rests on a completed run, so the
			pipeline still reads as a pipeline rather than three inert labels.
		*/
		.signal-pulse {
			opacity: 0;
		}

		.node-live {
			opacity: 0;
		}

		.step-track {
			transform: scaleX(1);
		}

		.automation-steps li {
			color: var(--color-on-signal);
			transition: none;
		}
	}
</style>

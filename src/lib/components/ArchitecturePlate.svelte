<script lang="ts">
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
</script>

<aside class="plate" aria-label={labels.title}>
	<div class="plate-head">
		<span class="meta">{labels.title}</span>
		<span class="plate-index meta">DW / 01</span>
	</div>

	<ol class="system-flow" aria-label={labels.title}>
		{#each labels.nodes as node, i (node.name)}
			<li class:is-core={i === 1}>
				<span class="node-index figure">0{i + 1}</span>
				<span class="meta node-label">{node.label}</span>
				<strong>{node.name}</strong>
				<span class="meta node-detail">{node.detail}</span>
			</li>
		{/each}
	</ol>

	<div class="automation-band">
		<div>
			<span class="meta">{labels.automation}</span>
			<strong>{labels.orchestration}</strong>
		</div>
		<ol class="automation-steps meta">
			{#each labels.steps as step, i (step)}
				<li><span class="figure">0{i + 1}</span>{step}</li>
			{/each}
		</ol>
	</div>

	<div class="operations-block">
		<span class="meta operations-label">{labels.operations}</span>
		<ol>
			{#each labels.operationSteps as step, i (step)}
				<li>
					<span class="figure">0{i + 1}</span>
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
	.plate {
		position: relative;
		padding: clamp(1.25rem, 3vw, 2rem);
		border: 1px solid var(--color-line);
		background: color-mix(in srgb, #fff 38%, var(--color-paper));
		box-shadow: 18px 22px 0 color-mix(in srgb, var(--color-ink) 5%, transparent);
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

	.plate-index,
	.plate-foot .meta {
		color: var(--color-ink-faint);
	}

	.system-flow {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: clamp(0.45rem, 1.2vw, 0.8rem);
		margin-top: 2.25rem;
	}

	.system-flow li {
		position: relative;
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

	.node-index {
		position: absolute;
		top: 0.7rem;
		right: 0.7rem;
		font-size: 0.8rem;
		color: var(--color-accent-on-paper);
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
		display: grid;
		gap: 0.25rem;
		padding-top: 0.65rem;
	}

	.automation-steps li:not(:first-child) {
		padding-left: 0.6rem;
		border-left: 1px solid color-mix(in srgb, var(--color-on-signal) 35%, transparent);
	}

	.automation-steps .figure {
		opacity: 0.65;
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

	.operations-block .figure {
		font-size: 0.72rem;
		color: var(--color-accent-on-paper);
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
	}

	@keyframes topology-node-in {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.system-flow li,
		.automation-band,
		.operations-block,
		.plate-foot {
			animation: none;
			opacity: 1;
			transform: none;
		}
	}
</style>

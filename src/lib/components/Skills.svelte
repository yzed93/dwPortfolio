<script lang="ts">
	import type { SiteContent } from '$lib/content';
	import { reveal } from '$lib/actions/reveal';
	import Cloud from 'phosphor-svelte/lib/Cloud';
	import TerminalWindow from 'phosphor-svelte/lib/TerminalWindow';
	import BracketsCurly from 'phosphor-svelte/lib/BracketsCurly';
	import Wrench from 'phosphor-svelte/lib/Wrench';

	let { content }: { content: SiteContent } = $props();
	const groupIcons = [Cloud, TerminalWindow, BracketsCurly, Wrench];
</script>

<section id="skills" class="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[0.38fr_1fr] lg:gap-16">
	<div>
		<h2
			use:reveal
			class="font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-tight text-ink md:text-6xl"
		>
			{content.skills.title}
		</h2>
		<div class="mt-6 h-1 w-20 bg-accent-on-paper" aria-hidden="true"></div>
	</div>

	<div class="border-t border-ink/20">
		{#each content.skills.groups as group, i (group.title)}
			{@const Icon = groupIcons[i % groupIcons.length]}
			<div use:reveal={i * 70} class="grid gap-5 border-b border-ink/15 py-6 sm:grid-cols-[0.42fr_1fr] sm:py-7">
				<div class="flex items-start gap-3">
					<span class="mt-0.5 text-accent-on-paper">
						<Icon size={22} weight="duotone" />
					</span>
					<h3 class="font-[family-name:var(--font-display)] text-lg font-bold text-ink">
						{group.title}
					</h3>
				</div>
				<ul class="grid gap-x-5 gap-y-2 sm:grid-cols-2">
					{#each group.items as item (item)}
						<li class="border-l border-accent-on-paper/40 pl-3 text-sm font-medium text-ink-soft">
							{item}
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
</section>

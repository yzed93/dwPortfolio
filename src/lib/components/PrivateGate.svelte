<script lang="ts">
	import { onDestroy, tick } from 'svelte';
	import ArrowUpRight from 'phosphor-svelte/lib/ArrowUpRight';
	import X from 'phosphor-svelte/lib/X';
	import { unlockPrivate, type PrivateContent } from '$lib/private-content';
	let { active, onunlock, onlock }: { active: boolean; onunlock: (content: PrivateContent) => void; onlock: () => void } = $props();
	let dialog: HTMLDialogElement;
	let input: HTMLInputElement;
	let password = $state('');
	let visible = $state(false);
	let busy = $state(false);
	let opened = $state(false);
	let error = $state('');
	let controller: AbortController | undefined;
	let timer: ReturnType<typeof setTimeout> | undefined;
	function clear() {
		controller?.abort(); clearTimeout(timer);
		password = ''; visible = false; busy = false; opened = false; error = '';
	}
	function close() { clear(); dialog.close(); }
	function toggle() {
		if (active) { onlock(); return; }
		clear(); dialog.showModal(); input.focus();
	}
	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (busy || !password) return;
		busy = true; error = ''; controller = new AbortController();
		const attempt = controller;
		try {
			const content = await unlockPrivate(password, attempt.signal);
			if (attempt.signal.aborted) return;
			password = ''; opened = true;
			timer = setTimeout(() => { if (!attempt.signal.aborted) { onunlock(content); close(); } }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 550);
		} catch (cause) {
			if (attempt.signal.aborted) return;
			error = cause instanceof Error ? cause.message : 'Das Öffnen hat nicht geklappt. Bitte versuche es erneut.';
			password = ''; busy = false;
			await tick();
			if (!attempt.signal.aborted) input.focus();
		}
	}
	onDestroy(clear);
</script>

<div class="mode-bar" class:private-active={active} lang="de">
	<span class="mode-hint">{active ? 'Ein bisschen mehr ich.' : 'Zwei Seiten. Ein Dennis.'}</span>
	<button class="mode-switch" type="button" role="switch" aria-label="Privatmodus" aria-checked={active} onclick={toggle}>
		<span class="slider" class:shifted={active}></span><span>Business</span><span>Privat <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="6" y="10" width="12" height="10" rx="2"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/></svg></span>
	</button>
</div>

<dialog bind:this={dialog} oncancel={clear} onclose={clear} aria-labelledby="private-title" aria-describedby="private-description" lang="de">
	<button class="dismiss" onclick={close} aria-label="Passwortabfrage schließen"><X size={20} weight="bold" /></button>
	<div class="lock-art" class:opened class:wrong={!!error}>
		<svg viewBox="0 0 80 80" fill="none" aria-hidden="true"><path class="shackle" d="M25 36V25a15 15 0 0 1 30 0v11" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><rect x="17" y="34" width="46" height="35" rx="10" fill="currentColor"/><circle cx="40" cy="49" r="4" fill="#f3eee4"/><path d="M40 50v7" stroke="#f3eee4" stroke-width="3"/></svg>
	</div>
	<h2 id="private-title">Die andere Seite.</h2>
	<p id="private-description">Ein paar persönliche Dinge bleiben im kleinen Kreis. Mit dem Passwort bist du dabei.</p>
	<form onsubmit={submit}>
		<label for="private-password">Dein Passwort</label>
		<div class="password-field"><input bind:this={input} id="private-password" type={visible ? 'text' : 'password'} bind:value={password} autocomplete="off" required disabled={busy} aria-invalid={!!error} aria-describedby={error ? 'password-error' : undefined}/><button type="button" onclick={() => visible = !visible} aria-label={visible ? 'Passwort verbergen' : 'Passwort anzeigen'}>{visible ? 'Verbergen' : 'Zeigen'}</button></div>
		<p id="password-error" class="feedback" aria-live="polite">{opened ? 'Willkommen auf der anderen Seite.' : error}</p>
		<button class="unlock" type="submit" disabled={busy || !password}>{opened ? 'Tür ist offen' : busy ? 'Schloss wird geöffnet …' : 'Tür öffnen'} <span class="icon" aria-hidden="true"><ArrowUpRight size={16} weight="bold" /></span></button>
	</form>
	<p class="footnote">Zurück zu Business? Dann schließt sich die Tür wieder.</p>
</dialog>

<style>
	.mode-bar { view-transition-name: mode-bar; position: fixed; inset: 0 0 auto; height: 52px; z-index: 70; display: flex; align-items: center; justify-content: center; gap: 24px; background: #e8e3d8; color: #292331; border-bottom: 1px solid #cbc6ba; font: 12px var(--font-sans); }
	.mode-bar.private-active { background: #541b2c; border-color: #795142; color: #f3eee4; }
	.mode-switch { position: relative; display: flex; padding: 3px; width: 190px; height: 42px; background: #d4cec4; border-radius: 24px; isolation: isolate; cursor: pointer; transition: background 250ms; }
	.mode-switch:hover { background: #c8c1b5; }
	.private-active .mode-switch:hover { background: #7f4155; }
	.mode-switch > span:not(.slider) { width: 50%; display: flex; align-items: center; justify-content: center; gap: 5px; font-weight: 600; }
	.mode-switch svg { width: 13px; height: 13px; }
	.slider { position: absolute; z-index: -1; inset: 3px auto 3px 3px; width: calc(50% - 3px); background: #fffdf7; border-radius: 20px; transition: transform 350ms cubic-bezier(.22,1,.36,1), background 350ms; }
	.private-active .mode-switch > span:last-child { color: #3c1321; }
	.slider.shifted { transform: translateX(100%); background: #c4a365; }
	.private-active .mode-switch { background: #71374a; }
	dialog { width: min(440px, calc(100% - 32px)); max-height: calc(100dvh - 32px); margin: auto; padding: 34px; border: 0; border-radius: 16px; background: #f3eee4; color: #482332; box-shadow: 0 24px 90px #3c132140; }
	dialog[open] { animation: arrive 300ms cubic-bezier(.22,1,.36,1); }
	dialog::backdrop { background: #30101d80; backdrop-filter: blur(7px); }
	.dismiss { position: absolute; top: 8px; right: 8px; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; color: #6d4351; cursor: pointer; transition: background 180ms, color 180ms; }
	.dismiss:hover { background: #e4dbc9; color: #482332; }
	svg { display: block; }
	.icon { display: inline-flex; }
	.lock-art { width: 80px; margin: 0 auto 22px; color: #541b2c; }
	.shackle { transform-origin: 55px 35px; transition: transform 450ms cubic-bezier(.22,1,.36,1); }
	.opened .shackle { transform: translateY(-7px) rotate(22deg); }
	.wrong { animation: shake 250ms ease-in-out; }
	h2 { font: 700 34px/1.1 var(--font-sans); letter-spacing: -.03em; margin-bottom: 12px; }
	p { font-size: 14px; line-height: 1.65; }
	form { margin-top: 26px; }
	label { display: block; margin-bottom: 8px; font-size: 13px; font-weight: 600; }
	.password-field { display: flex; background: #fff; border: 1px solid #b7a27b; border-radius: 10px; overflow: hidden; }
	input { min-width: 0; width: 100%; padding: 12px; font-size: 16px; caret-color: #541b2c; }
	.password-field button { padding: 10px; font-size: 12px; cursor: pointer; }
	.password-field:focus-within { outline: 3px solid #541b2c; outline-offset: 3px; }
	.password-field input:focus-visible { outline: none; }
	.feedback { min-height: 38px; padding: 8px 0; font-size: 12px; line-height: 1.5; color: #822446; }
	.unlock { width: 100%; display: flex; align-items: center; justify-content: space-between; background: #541b2c; color: #fff; border-radius: 10px; padding: 14px 18px; font-size: 14px; cursor: pointer; transition: background 200ms; }
	.unlock:hover:not(:disabled) { background: #3c1321; }
	.unlock .icon { transition: transform 300ms cubic-bezier(.22,1,.36,1); }
	.unlock:hover:not(:disabled) .icon { transform: translate(3px, -3px); }
	.unlock:disabled { background: #e0d5c1; color: #6d4351; cursor: default; }
	.footnote { margin-top: 18px; font-size: 11px; text-align: center; }
	button:focus-visible, input:focus-visible { outline: 3px solid #541b2c; outline-offset: 3px; }
	.mode-bar button:focus-visible { outline-color: #292331; }
	.private-active .mode-switch:focus-visible { outline-color: #e2c78e; }
	@keyframes arrive { from { opacity: .3; transform: translateY(16px) scale(.97); } to { opacity: 1; transform: none; } }
	@keyframes shake { 25%,75% { transform: translateX(-4px); } 50% { transform: translateX(4px); } }
	@media(max-width: 420px) { .mode-hint { display: none; } dialog { padding: 28px 24px; } }
	@media(prefers-reduced-motion: reduce) { *, .slider, .shackle, .unlock .icon { animation: none !important; transition: none !important; } dialog::backdrop { backdrop-filter: none; } }
</style>

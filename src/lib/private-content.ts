export interface PrivateContent {
	title: string;
	intro: string;
	note: string;
	tracks: string[];
	storyTitle: string;
	story: string;
	notes: string[];
	closing: string;
	outro: string;
	portraitCaption: string;
	detailCaption: string;
	momentNote: string;
	bookTitle: string;
	bookAuthor: string;
	bookHeading: string;
	bookThought: string;
	musicNote: string;
	photos?: Record<string, string>;
}

export async function unlockPrivate(password: string, signal: AbortSignal): Promise<PrivateContent> {
	if (!globalThis.crypto?.subtle) throw new Error('Bitte öffne die Seite über HTTPS oder localhost.');
	const response = await fetch('/private/content.enc.json', { signal, cache: 'no-store' });
	if (!response.ok) throw new Error('Die privaten Inhalte konnten nicht geladen werden. Bitte versuche es erneut.');
	const envelope = await response.json();
	if (envelope.version !== 1 || envelope.iterations !== 600000) throw new Error('Das Inhaltsformat wird nicht unterstützt.');
	const bytes = (value: string) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
	const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
	const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: bytes(envelope.salt), iterations: envelope.iterations, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
	let plaintext: ArrayBuffer;
	try {
		plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes(envelope.iv) }, key, bytes(envelope.ciphertext));
	} catch {
		throw new Error('Das Passwort stimmt noch nicht. Versuch es noch einmal.');
	}
	try {
		const data = JSON.parse(new TextDecoder().decode(plaintext));
		const fields = ['title', 'intro', 'note', 'storyTitle', 'story', 'closing', 'outro', 'portraitCaption', 'detailCaption', 'momentNote', 'bookTitle', 'bookAuthor', 'bookHeading', 'bookThought', 'musicNote'];
		if (!fields.every((field) => typeof data[field] === 'string') || !['tracks', 'notes'].every((field) => Array.isArray(data[field]) && data[field].length > 0 && data[field].every((item: unknown) => typeof item === 'string'))) throw new Error('Die privaten Inhalte haben ein ungültiges Format.');
		if (data.photos !== undefined && (data.photos === null || Array.isArray(data.photos) || typeof data.photos !== 'object' || !Object.entries(data.photos).every(([slot, value]) => ['portrait', 'moment', 'detail', 'closing'].includes(slot) && typeof value === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(value)))) throw new Error('Die privaten Bilder haben ein ungültiges Format.');
		return data;
	} finally {
		new Uint8Array(plaintext).fill(0);
	}
}

/**
 * The jukebox: one playlist, one audio element, two places to reach it.
 *
 * The playlist is deliberately public. Music is published work, not personal
 * information, so it does not belong in the encrypted payload: that blob is
 * decrypted in one piece behind 600,000 PBKDF2 iterations, and minutes of
 * audio there would make unlocking slow and memory-hungry for no gain.
 *
 * Tracks are CC0 1.0 Universal from the Open Lo-Fi collection
 * (https://github.com/btahir/open-lofi), which is public domain: usable for
 * any purpose, commercial included, with no attribution required. `credit` is
 * therefore unset here; fill it in for any track added later under a licence
 * that does demand naming its source, and the panel will render it.
 */
export interface JukeboxTrack {
	title: string;
	artist: string;
	src: string;
	credit?: { text: string; href: string };
}

export const PLAYLIST: JukeboxTrack[] = [
	{ title: 'Porchlight Golden Hour', artist: 'Open Lo-Fi', src: '/audio/porchlight-golden-hour.mp3' },
	{ title: 'Window Seat Daydream', artist: 'Open Lo-Fi', src: '/audio/window-seat-daydream.mp3' },
	{ title: 'Dust on the Morning Keys', artist: 'Open Lo-Fi', src: '/audio/dust-on-the-morning-keys.mp3' },
	{ title: 'Stacks of Quiet Books', artist: 'Open Lo-Fi', src: '/audio/stacks-of-quiet-books.mp3' },
	{ title: 'Soft Gold Sky', artist: 'Open Lo-Fi', src: '/audio/soft-gold-sky.mp3' }
];

/** Background music sits behind reading, so it does not arrive at full level. */
const LEVEL = 0.55;
const FADE_MS = 420;

class Jukebox {
	index = $state(0);
	playing = $state(false);
	elapsed = $state(0);
	duration = $state(0);
	failed = $state(false);
	/** True once the visitor has started it, so the panel can stay quiet until then. */
	touched = $state(false);

	#el: HTMLAudioElement | null = null;
	#fade: ReturnType<typeof setInterval> | undefined;

	get track() {
		return PLAYLIST[this.index];
	}

	get progress() {
		return this.duration > 0 ? Math.min(1, this.elapsed / this.duration) : 0;
	}

	/*
		The element is built on demand rather than rendered into the page,
		because two separate components drive one piece of audio and neither
		should own it. Nothing is constructed, and nothing is fetched, until
		someone actually presses play.
	*/
	#audio() {
		if (this.#el || typeof Audio === 'undefined') return this.#el;
		const el = new Audio();
		el.preload = 'none';
		el.volume = 0;
		el.src = this.track.src;
		el.addEventListener('play', () => (this.playing = true));
		el.addEventListener('pause', () => (this.playing = false));
		el.addEventListener('timeupdate', () => (this.elapsed = el.currentTime));
		el.addEventListener('loadedmetadata', () => (this.duration = el.duration));
		// A media element fires pause before ended, so by the time this runs
		// `playing` is already false. Hand the intent over explicitly, or the
		// music would stop after every track.
		el.addEventListener('ended', () => this.next(true));
		el.addEventListener('error', () => {
			this.failed = true;
			this.playing = false;
		});
		this.#el = el;
		return el;
	}

	#ramp(to: number, done?: () => void) {
		const el = this.#el;
		if (!el) return;
		clearInterval(this.#fade);
		const from = el.volume;
		const started = performance.now();
		this.#fade = setInterval(() => {
			const t = Math.min(1, (performance.now() - started) / FADE_MS);
			el.volume = Math.max(0, Math.min(1, from + (to - from) * t));
			if (t === 1) {
				clearInterval(this.#fade);
				done?.();
			}
		}, 25);
	}

	async play() {
		const el = this.#audio();
		if (!el) return;
		this.failed = false;
		try {
			await el.play();
			this.touched = true;
			this.#ramp(LEVEL);
		} catch {
			// An aborted play() during a track change is not a failure; a file
			// that will not decode is, and the panel should say so.
			if (el.error) this.failed = true;
			this.playing = false;
		}
	}

	/** Fades out before stopping, so pausing does not cut the room off. */
	pause() {
		const el = this.#el;
		if (!el) return;
		this.#ramp(0, () => el.pause());
	}

	toggle() {
		if (this.playing) this.pause();
		else this.play();
	}

	next(keepPlaying = this.playing) {
		const el = this.#audio();
		if (!el) return;
		clearInterval(this.#fade);
		this.index = (this.index + 1) % PLAYLIST.length;
		this.elapsed = 0;
		this.duration = 0;
		el.src = this.track.src;
		el.volume = 0;
		el.load();
		if (keepPlaying) this.play();
	}

	/** The music belongs to the private world and leaves with it. */
	stop() {
		clearInterval(this.#fade);
		this.#el?.pause();
		this.#el = null;
		this.index = 0;
		this.playing = false;
		this.elapsed = 0;
		this.duration = 0;
		this.failed = false;
		this.touched = false;
	}
}

export const jukebox = new Jukebox();

export function clock(seconds: number) {
	if (!Number.isFinite(seconds)) return '--:--';
	const whole = Math.floor(seconds);
	return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

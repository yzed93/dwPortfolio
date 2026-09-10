# Private portrait design

Confirmed through the Shape pass: the private page is a personal portrait for people who want a glimpse into Dennis's life. Photographs, everyday moments, books and personal reflections lead. The user's favorite colors, Bordeaux and gold, replace lavender. This is scoped to the private view and its gate; the business content and design remain intact.

## Visual system

Bordeaux (#541b2c) owns the opening, with deeper Bordeaux (#3c1321) closing the page. Matte gold (#c4a365) accents the switch, links, captions and small details. Warm paper (#f3eee4) and a darker reading surface (#e8dfcf) support longer text; dark wine ink (#482332) carries text on light surfaces. Gold does not serve as small text on light paper.

Geist carries strong personal headings and body copy. Existing Newsreader italic appears selectively in personal asides and the signature; its roman face carries the book and photo placeholder lettering. No metallic gradients or glossy luxury effects.

## Composition and interaction

The opening places a large portrait next to a personal introduction. Four photo slots are supported: portrait, moment, detail and closing. In the absence of supplied photos, explicit placeholders reserve each composition.

Below the opening the page is a pinboard rather than a stack of sections. It used to be five full-width bands, each a heading on the left and its content on the right, which is the rhythm every other portfolio has. Now one continuous warm wall carries everything: the story photograph, the detail snapshot, the handwritten note, the book, the jukebox and the closing thought, placed rather than stacked. Sizes differ, edges do not align, and the postcard is pinned across the seam between the wine opening and the wall, which is the one deliberate crossing.

Placement uses explicit grid lines rather than template areas, because areas cannot overlap and the overlaps are the point. DOM order stays the reading order, so keyboard and screen readers are unaffected by where a thing happens to sit. The eye is walked in a zig-zag: heading left, jukebox holding the right edge, book below on the left, the last heading crossing back to the right. No two adjacent blocks share a left edge. Two hairlines, and only two, tie each of the first two headings to the object it is talking about; a line for every relation would be a diagram rather than a wall.

A small photograph and sign-off close the page.

The persistent business/private switch and native password dialog retain their behavior. The private switch, lock and dialog now use Bordeaux and gold. Navigation anchors clear the fixed mode bar.

Motion follows one idea: photographs arrive the way prints arrive. Each of the four photo objects is driven by its own scroll position rather than by a timer, moving from a looser angle, a soft blur and reduced saturation into its resting state as it enters the viewport; its caption follows a beat later. A supplied photograph also drifts slowly inside its frame while the frame passes the viewport, which placeholders do not, having no depth to move through. The resting state is the authored default, so a browser without scroll-driven animation renders the page already settled. Ranges are expressed against the element's entry rather than its full pass, because the closing photograph sits at the end of the document and would otherwise never finish developing.

The switch between business and private is a view transition started by hand, since it changes state rather than route. The incoming side is drawn in under a clip-path curtain, downward into the private side and upward back out of it, while the outgoing side holds its detail and recedes behind the moving edge. The mode bar carries its own transition name and stays in place, so only its colours cross over. Browsers without the View Transitions API fall back to the previous entrance animation, and reduced-motion settings skip the transition entirely.

## Responsive behavior

The wall tightens before it breaks. At 1100px the columns narrow and the overlaps shrink; the example-content label moves to its own header row. At 768px the collage stops being a collage: overlap, offsets and column placement all go, the objects keep only the tilt that belongs to them as photographs, and the wall becomes one honest column. At 640px the portrait precedes its introduction and the footer becomes a vertical composition. At the narrowest widths the book and reflection also stack. Side padding is fluid from 24px to 100px.

## Content and protection

The current copy, book and music titles are explicitly illustrative. No real personal photos were supplied or generated. Actual photo bytes can be embedded in the encrypted payload from local files; public layout code never imports private assets. When real photos arrive, provide accurate alt descriptions and replace the associated placeholder copy and demo labels.

## The jukebox

The music is public, not private. Playlist and state live in `src/lib/jukebox.svelte.ts`, the files in `static/audio/`, because music is published work rather than personal information, and because the encrypted payload is decrypted in one piece behind 600,000 PBKDF2 iterations: minutes of audio there would make unlocking slow and memory-hungry for nothing.

Five tracks ship, all CC0 1.0 Universal from the Open Lo-Fi collection (https://github.com/btahir/open-lofi), which is public domain and requires no attribution. A `credit` field exists on each track for anything added later under a licence that does demand naming its source; the panel renders it when present and omits it entirely when absent.

There are two ways in and one jukebox behind them. A switch sits in the header at the top of the page, where it is reachable before any scrolling and says what it will do rather than what it is; three small bars move only while sound is actually coming out. The music section carries the fuller panel: title, artist, play, skip, a counter, a clock in tabular figures, and a hairline of progress. Both drive the same audio, so their labels never disagree. The personal soundtrack titles stay a plain list beneath the panel; they are his picks, not a control.

No seeking and no volume, because neither belongs to the gesture of putting something on in the background, and leaving them out keeps this to two real buttons rather than a slider with its own keyboard model. Background music arrives below full level and fades in and out over about four tenths of a second, so starting and pausing do not cut the room off.

Nothing plays on its own, which browsers enforce anyway and which suits a page someone opens to read. The audio element is constructed in script rather than rendered, so before the first press there is no media element in the page and nothing has been fetched; each track is fetched only when it is reached. A track that ends hands over to the next and keeps playing, which needs the intent passed explicitly because a media element fires pause before ended. Skipping while paused stays paused. A file that will not load says so, and the next one is still reachable. Locking the page takes the music with it, and coming back starts silently at the first track.

See [PRIVATE-MODE.md](PRIVATE-MODE.md) for the encryption and editing workflow.

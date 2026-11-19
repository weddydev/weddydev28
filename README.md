# Maison Aarav & Meher — Haute Joaillerie Edition

A white-marble-and-gold wedding invitation, built with **React 19, Tailwind CSS v4, GSAP 3** (ScrollTrigger, SplitText, `@gsap/react`), **Three.js** and **Lenis**.

This project is fully self-contained: it has its own `package.json`, dependencies, config and build.

```
cd second-website
npm install
npm run dev        # http://localhost:5173
npm run build      # → dist/index.html + dist/generator.html (single-file, open by double-click)
```

## The experience

| Chapter | What happens |
|---|---|
| **Preloader** | A gold ring fills with real loading progress, then expands into a circular portal. |
| **The Unveiling** | Full-screen gold foil with the guest's name letterpressed into it. Swipe to scratch it away (sparkles, haptics, crinkle sound). Past 40% it lifts off as gold leaf. "Tap to unveil" scratches it automatically. |
| **Hero** | Real-time **3D gold rings** (WebGL): an engagement ring with a faceted diamond, interlocked with a wedding band. They react to cursor and phone tilt, and float through the whole site, taking a new pose in each chapter. |
| **The Promise** | Giant outlined lines fill with liquid gold as you scroll, then a letter from the families. |
| **Our Story** | Pinned horizontal gallery. Photographs parallax inside gilded arches. |
| **The Date** | December calendar with the day circled in hand-drawn gold. A luxury watch dial whose hands sweep **counter-clockwise** toward the ceremony. |
| **Programme** | A 3D coverflow deck of gilt-edged cards. Tap one to turn it over for details, dress-code palette, calendar (.ics / Google) and map. |
| **The Palace** | "UDAIPUR" cut from the photograph itself. Scroll dives the camera through the letters into the full image. |
| **Lookbook** | A 3D cylinder of photographs orbiting the rings. Scroll or drag to turn it; tap to open. |
| **Concierge** | Arrangement tiles, a personal concierge card (WhatsApp / call) and a FAQ accordion. |
| **RSVP** | One reply card. Guests sign in **gold ink** with a finger, then an embossed gold stamp seals it and gold leaf bursts. |
| **Finale** | The rings reunite in a golden bloom, the signature writes itself, and gold leaf showers down. |

Also included:
- A floating **dock**: scroll-progress ring, live chapter name, sound toggle, and a menu that morphs out of the dock.
- A gem cursor with a sparkle trail on desktop.
- A generative music-box waltz, muted until the guest taps.

## Editing — `src/config.js`

Everything lives here: names, initials, date, colours, story chapters, events, venue, lookbook photos, concierge, FAQ, RSVP and music.

- **Formatting in titles:** `*word*` = gold italic, `~word~` = outlined.
- **Event cards:** `icon` is one of `moon | lotus | mandap | chandelier | champagne`; `palette` is the dress-code swatches.
- **Venue:** `venue.word` is the giant word the camera dives through.
- **Photos:** any URL. For local files, put them in `public/photos/` and use `"photos/name.jpg"`.

## RSVP — `config.rsvp.method`

- `"whatsapp"` (default): opens WhatsApp with a formatted reply to `rsvp.whatsapp`.
- `"formspree"`: set `endpoint` to `https://formspree.io/f/xxxx`. The signature is included as an image.
- `"google"`: set `googleForm.action` (`…/formResponse`) and the `entry.xxxx` ids.
- `"demo"`: no network.

## Guest links

Open `generator.html`. Paste names (one per line, optionally `Name | 919812345678`), then copy the links or send them straight to WhatsApp.

Each link (`index.html?guest=Name`) puts the guest's name on:
- the foil
- the hero
- the letter
- the back of every card
- the RSVP
- the concierge message

## Music

Put an mp3 in `public/assets/audio/` and set `music.src: "assets/audio/theme.mp3"`. Leave it empty for the generative music box.

## Deploy

`npm run build`, then upload `dist/` to Netlify (drag and drop) or Vercel (build `npm run build`, output `dist`).

After deploying, set `og:image` in `index.html` to the absolute URL, e.g. `https://your-site.netlify.app/og-image.jpg`, and set `config.siteUrl`.

## Notes

- **No WebGL?** Elegant SVG rings appear instead.
- **`prefers-reduced-motion`:** skips the foil, particles and parallax.
- **Performance:** canvases cap pixel density and pause off-screen.

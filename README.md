# Limen

Ideas for making sense of being human.

A calm, curated library of 50 ideas from psychology and philosophy. One app for iOS and Android, built with Expo (SDK 57) and Expo Router.

## Live preview on your phone

1. Install **Expo Go** on your phone (App Store or Play Store).
2. In Terminal, from this folder:
   ```bash
   npm install
   npx expo start
   ```
3. Scan the QR code (iPhone: Camera app. Android: the scanner in Expo Go).
   Phone and Mac must be on the same Wi-Fi; otherwise run `npx expo start --tunnel`.

Edits in `src/` reload on the phone instantly.

## Design

- **One design on both platforms.** No platform-specific chrome. Where iOS and Android conventions conflict, the app takes the simpler shared option:
  - Navigation: one floating frosted tab bar and a floating back button, drawn by the app. System headers are off. Native back gestures (iOS edge swipe, Android back) still work.
  - Touch targets: 48 tall, which satisfies both Apple's 44pt and Material's 48dp minimums.
  - Press feedback: dim + light haptic everywhere (no ripple / highlight split).
  - Icons: Ionicons, bundled in the app, identical on both.
  - Controls: capsule buttons, capsule chips, one segmented control.
  - Transitions: slide from the right on both.
  - The claim-labels sheet uses the system sheet on each platform (native drag and dismiss for free).
- **Two typefaces, no italics:** Newsreader (serif) for ideas and statements; Atkinson Hyperlegible Next for navigation, controls and metadata.
- **Icons:** one family, Tabler (MIT), outline 1.5px, four sizes, stored as a small path map in `src/ui/icons.ts`. Used only where text is not enough: arrows, back, check, radio, and abstract theme motifs. Licence in `ICONS-LICENSE.txt`.
- **Navigation:** Home · Explore · Library · Search. Text only.
- **Home** holds one idea. **Concept pages** are read top to bottom; each layer (why it matters, in real life, the tension, go deeper) appears when asked for.
- **Light mode only.**

## Structure

- `src/app/(tabs)/` – Home, Explore, Library, Search.
- `src/app/concept/[id]` – the idea as a single reading page that opens in layers.
- `src/app/notes/[id]` – the same idea on one page, for reference.
- `src/app/path/[id]` – paths: short ordered sequences of ideas.
- `src/app/shelf`, `threads`, `thinkers`, `themes` – the full browsers, one tap below Explore.
- `src/app/book/[id]`, `thinker/[id]`, `theme/[name]`, `stand/[key]`, `atlas`, `labels`.
- `src/data/content.json` – 72 ideas, 184 thinkers, 307 books, 10 paths, 58 mapped questions.
- `src/data/index.ts` – graph helpers, recommendations, and search (questions, synonyms, ideas, thinkers, books).
- `src/lib/` – on-device state: reading trail and notebook (saved, positions, examples, first-run flags).
- `src/ui/` – tokens (`theme.ts`), primitives (`kit.tsx`), generated cover art (`cover.tsx`), shared blocks (`blocks.tsx`).

## Web preview

`npx expo export -p web` builds the same app for the browser; on web it renders in a phone-width column.

## Building store apps

`eas.json` is included. `npx eas-cli@latest build --profile preview` produces installable builds (needs an Expo account).

# Anisekai

About Anisekai: A cross-platform Expo app that helps anime and manga fans discover titles, track progress, and explore AI-assisted recommendations through connected tabs, tools, and a lightweight in-memory data store.

---

## Overview

Anisekai is a React Native application built with Expo Router (SDK 53 / React Native 0.79 / React 19). It combines:

- **Client rendering** with Expo Router, linear gradients, masked typography, and custom theming across iOS, Android, and web.
- **State orchestration** via `AuthContext` and `LibraryContext` (see `app/context`).
- **Local persistence** handled by `src/services/localDataStore.js`, which simulates auth + library CRUD with a shared in-memory store (seeded with a `demo` user).
- **External APIs** for discovery (Jikan), AI concierge (Google Gemini), reverse image lookup (Trace.moe), waifu art (Waifu.pics), and streaming episodes.
- **Feature-rich surfaces**: onboarding, authentication, tab navigation, detail overlays, progress controls, and experimental utilities such as Scene Finder and Waifu Generator.

---

## Features

### Authentication & Onboarding (`app/index.jsx`, `app/login/*`)
- Hero landing (`app/index.jsx`) uses `MaskedView` + gradients to set the brand tone and route to `/login/login`.
- Login form integrates `FontAwesome` icons, "Remember me" toggles, password reveal, `localAuthApi.login`, and a celebratory `WelcomeBanner` animation before redirecting to `/(tabs)/home`.
- Registration validates unique usernames/emails via `localAuthApi.register`, stores new users in memory, and routes to login.
- Forgot password is currently a UI placeholder that surfaces alerts; link wiring is ready for future backend integration.

### Personalized Home Hub (`app/(tabs)/home/index.jsx`)
- Hero block showcases the stack logo (`app/login/assets/anisekai.png`), accent gradients, and CTA copy.
- **AnisekAI concierge** uses Google Gemini 2.5 Flash via `src/data/geminiRecommendations.js`, prompt chips, abortable requests, loading/error banners, and `Clear` actions. Requests are gated on `EXPO_PUBLIC_GEMINI_API_KEY`.
- **Latest Episodes carousel** pulls aggregated data from Jikan via `src/data/latestEpisodes.js`, applies metadata caching + rate-limit handling, and links to `/latest-episodes` for full-screen browsing.
- All asynchronous flows expose meaningful empty/error states so the screen remains actionable offline.

### Explore & Deep Search (`app/(tabs)/explore/index.jsx`, `src/explore/*`)
- Scope selector (`SCOPE_OPTIONS`) toggles Anime, Manga, Characters, and Users. Every scope is cached in `scopeDataCache` so returning is instant.
- Section layouts are defined in `src/explore/scopeConfig.js` and rendered through specialized components with `View All` expansion, rank badges, and optional genre chips.
- Search is powered by `useExploreSearch` (debounced, cache-aware, abortable requests). Prefix hydration keeps short queries instant.
- Detail overlay (`src/explore/components/ExploreDetailView.jsx`) surfaces metadata, streaming links, and full synopses, and exposes add/update/remove actions wired to `useLibrary`.
- Back handling cancels pending fetches, resets local state, and prevents stale detail modals.

### Library Management (`app/(tabs)/library/index.jsx`, `app/context/LibraryContext.jsx`)
- Dual-scope (Anime/Manga) filtering, status chips, and search combine to surface the right entries quickly.
- Preview carousels expand into "View All" lists once a status bucket exceeds `VIEW_ALL_BUTTON_THRESHOLD`.
- Detail modals let users change status, increment/decrement watched episodes or read chapters, set ratings, toggle favorites, and remove entries. Inputs are validated before they update the local store.
- Storage is centralized through `LibraryContext`, which normalizes entries from Jikan responses and persists changes through `localLibraryApi`.

### Profile & Activity (`app/(tabs)/profile/index.jsx`, `app/(tabs)/profile/edit.jsx`)
- Overview tab summarizes stats (mean score, progress), favorites (capped at six per scope), and an activity feed derived from the five most recent library updates.
- Anime/Manga tabs display stacked stats bars, favorites carousels, and full entry lists with progress indicators. Empty states adapt to signed-in vs guest contexts.
- Avatar tap navigates to `/profile/edit`, where users can adjust username/email/avatar and preview uploads with fallbacks. Unsigned visitors are prompted to log in.
- Logout button calls `useAuth().signOut` and is automatically disabled for guests.

### Streaming Surfaces (`app/latest-episodes.jsx`)
- Full-screen list fetches up to 20 episodes, shows load/error empty states, formats release dates, and opens external streaming URLs via `Linking`.
- Pressable rows feature thumbnails, fallback initials, and dynamic badges for episode numbers and release timing.

### Tools & Experiments (`app/tools/*`)
- **Scene Finder**: Upload stills and query Trace.moe for matching anime + timestamps.
- **Waifu Generator**: Calls Waifu.pics, lets users favorite pulled art, and shares to the media library.

---

## Architecture

### High-Level Flow
1. `app/_layout.jsx` wraps the Expo Router stack in `AuthProvider`.
2. `(tabs)/_layout.jsx` wraps every tab screen inside `LibraryProvider` so shared hooks can mutate the same cache.
3. `AuthContext` exposes auth helpers that call `localAuthApi`. `LibraryContext` exposes CRUD helpers backed by `localLibraryApi` plus in-memory UI state.
4. Screens/components rely on contexts + data helpers (`src/data/*`, `src/utils/*`) to render or mutate state.

### Directory Layout
```
app/
+- _layout.jsx
+- index.jsx
+- latest-episodes.jsx
+- login/
¦  +- login.jsx
¦  +- register.jsx
¦  +- forgot-password.jsx
+- context/
¦  +- AuthContext.jsx
¦  +- LibraryContext.jsx
+- (tabs)/
¦  +- _layout.jsx
¦  +- explore/
¦  +- library/
¦  +- home/
¦  +- miscellaneous/
¦  +- profile/
+- tools/
+- ...
backend/
+- src/index.js               # Express placeholder for future REST APIs
src/
+- config/
+- data/
+- explore/
+- services/
¦  +- localDataStore.js
+- utils/
+- ...
styles/
+- *.js (screen-specific StyleSheets + tokens)
```

### Key Modules
- **AuthContext (`app/context/AuthContext.jsx`)** – Normalizes user objects, stores session state, exposes `signIn`, `signOut`, `updateProfile`, and `syncFavorites`. Calls `localAuthApi` for profile/favorite writes.
- **LibraryContext (`app/context/LibraryContext.jsx`)** – Houses `LIBRARY_STATUS` metadata, normalization helpers, and UI reducers for entries/favorites/progress. Delegates persistence to `localLibraryApi` but keeps optimistic UI updates so interactions feel instant.
- **Local Data Store (`src/services/localDataStore.js`)** – Exposes `localAuthApi` and `localLibraryApi`. Maintains a global in-memory Map seeded with `demo` / `password` and `admin` / `admin`. Provides helper methods (`register`, `login`, `updateProfile`, `list`, `save`, `remove`, `updateStatus`, `updateProgress`, `updateRating`, `updateFavorites`, `reset`).
- **Env/Config (`src/config/env.js`)** – Reads `EXPO_PUBLIC_*` vars once at startup with fallbacks.
- **Data helpers (`src/data/*`)** – Wrap Jikan, Trace.moe, Waifu, and Gemini requests with caching, cancellation, and error shaping.
- **Styles** – `styles/theme.js` defines tokens; screen styles import and extend them for consistency.

### Environment Variables
| Variable | Required | Description |
| --- | --- | --- |
| `EXPO_PUBLIC_JIKAN_API_URL` | Optional (default provided) | REST base for anime/manga metadata. |
| `EXPO_PUBLIC_TRACE_API_URL` | Optional (default provided) | Reverse image endpoint for Scene Finder. |
| `EXPO_PUBLIC_WAIFU_API_BASE` | Optional (default provided) | Waifu.pics endpoint. |
| `EXPO_PUBLIC_GEMINI_API_KEY` | Required for AI concierge | Google Gemini key (enable Generative Language API). |

### Running the App
1. `npm install`
2. Copy/update `.env.local` with the env vars above (Expo only bundles `EXPO_PUBLIC_*`).
3. `npx expo start`
4. Log in with `demo` / `password`, `admin` / `admin`, or register a new account (data persists until you reload Metro).

No secondary backend/CLI needs to run—the previous backend integration has been removed.

### Local Data Store Behavior
- The store lives in `globalThis.__anisekaiLocalStore__` so every reload resets it.
- Each registered user gets their own auth record + library Map in memory.
- Favorites sync through `AuthContext.syncFavorites`, which also updates the store.
- `LibraryContext.resetLibrary` clears UI state and calls `localLibraryApi.reset` for the current user.

### External APIs & Services
- **Jikan** – REST endpoints for anime/manga search, top lists, seasons, and episodes.
- **Trace.moe** – Image fingerprinting for Scene Finder.
- **Waifu.pics** – Random waifu illustrations; user favorites are stored locally.
- **Google Gemini 2.5 Flash** – AI prompt/reply generation (`src/data/geminiRecommendations.js`).
- **Expo Media Modules** – Document picker, media library, and video playback support Scenes/Tools.

### Testing & Quality
- `npm run lint` (ESLint 9 + `eslint-config-expo`).
- Manual testing checklist (recommended): login/register/logout, library add/update/remove, favorites toggling, Explore detail actions, Scene Finder, Waifu generator, Gemini concierge, latest episodes modal.

### Known Limitations
- All auth/library data resets when Metro reloads because the store is in-memory only.
- Passwords are stored in plain text inside the demo store—acceptable for local dev but not production ready.
- Backend folder is a placeholder; there is no persistence beyond the current JS runtime.

### Future Enhancements
1. Replace the local store with the Express backend (or another service) and introduce proper hashing + JWT auth.
2. Add offline caching for Jikan/Gemini data and hydrate from AsyncStorage between sessions.
3. Finish the forgot-password flow once a real backend exists.
4. Expand library filters/sorting, add social sharing, and schedule notifications for new episode drops.
5. Introduce automated tests (unit + integration) around the future API layer.

### Contribution Workflow
1. Create a branch per feature/fix.
2. Run `npm run lint` + manual smoke tests.
3. Update documentation (`docs.md` / `documentation.md`) when behavior or env vars change.
4. Open a pull request summarizing changes, testing performed, and any data-store considerations.
5. Once a real backend lands, migrations (DB schema, env vars) should be documented alongside frontend changes.

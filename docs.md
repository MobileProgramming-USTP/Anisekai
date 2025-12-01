# Project Documentation

## Overview
- **Platform**: React Native app built with Expo and Expo Router.
- **Purpose**: Anime-focused experience featuring authentication, discovery tabs, media utilities, and AI-assisted recommendations.
- **Tech Stack**: Expo Router for navigation, React Context for auth/library state, an in-memory data store (`src/services/localDataStore.js`) for demo persistence, Axios-powered API helpers, and centralized theming via `styles`.

## Quick Start
1. Install dependencies: `npm install` or `yarn install`.
2. Configure external API env vars (see `.env.local`):
   - `EXPO_PUBLIC_JIKAN_API_URL` – Anime/manga metadata (defaults to `https://api.jikan.moe/v4`).
   - `EXPO_PUBLIC_TRACE_API_URL` – Reverse image lookup (`https://api.trace.moe/search`).
   - `EXPO_PUBLIC_WAIFU_API_BASE` – Waifu.pics endpoint (`https://api.waifu.pics/sfw`).
   - `EXPO_PUBLIC_GEMINI_API_KEY` – Google Gemini key for home recommendations.
3. Launch the dev server: `npx expo start`.
4. Sign in with the bundled demo accounts (`demo` / `password` or `admin` / `admin`) or register a new in-memory user. No backend server is required thanks to the local data store.

## Project Structure
```
app/
  _layout.jsx                # Root layout: Auth provider wraps the router stack
  index.jsx                  # Landing screen directing users to login
  latest-episodes.jsx        # Latest streaming episodes modal screen
  tools/
    scene-finder.jsx         # Trace.moe lookup experience
    waifu-generator.jsx      # Waifu.pics generator with media library support
  context/
    AuthContext.jsx          # Auth provider storing current user state
    LibraryContext.jsx       # Library provider with local caching + helpers
  login/
    login.jsx                # Login form + WelcomeBanner hook-up
    register.jsx             # Registration form
    forgot-password.jsx      # Email capture screen (UI only)
  (tabs)/                    # Protected tab navigator (Expo Router group)
    _layout.jsx              # Tab bar configuration + LibraryProvider
    home/index.jsx           # Home feed
    explore/index.jsx        # Explore search + detail surface
    library/index.jsx        # Library lists
    miscellaneous/index.jsx  # Miscellaneous utilities
    profile/index.jsx        # User info & logout
components/
  WelcomeBanner.jsx          # Animated banner shown after successful login
backend/
  src/index.js               # Placeholder Express server for future REST work
src/
  config/
    api.js                   # Centralized API endpoints derived from env
    env.js                   # Environment variable reader with fallbacks
  data/                      # Data-fetching helpers (Jikan, Gemini, etc.)
  explore/                   # Explore feature helpers, hooks, components
  services/
    localDataStore.js        # In-memory auth + library store (demo persistence)
  utils/                     # Shared utilities (title resolvers, etc.)
styles/
  theme.js                   # Named + default export with design tokens
  *Styles.js                 # Screen/style bundles used across the app
```

## Navigation & Flow
- **Root (`app/_layout.jsx`)**
  - Wraps the entire Expo Router stack with `AuthProvider`.
  - No backend resolution logic is required because data stays in-memory.
- **Auth Screens**
  - `index.jsx` displays the hero CTA and routes to `/login/login`.
  - `app/login/login.jsx` authenticates via `localAuthApi.login`, stores the user in context, and shows the animated `WelcomeBanner` before redirecting to `/(tabs)/home`.
  - `register.jsx` calls `localAuthApi.register`, surfaces success/error alerts, and routes back to login.
  - `forgot-password.jsx` is UI-only and shows an alert when submitted.
- **Tabs (`app/(tabs)/_layout.jsx`)**
  - Configures a five-tab Ionicons bar (`explore`, `library`, `home`, `miscellaneous`, `profile`).
  - Wraps children in `LibraryProvider` so every tab can manage entries.
- **Profile Screen**
  - Reads `user` from `AuthContext`, renders stats/favorites, and offers logout.

## Authentication & State Management
- `AuthContext.jsx`
  - Stores the current user, exposes `signIn`, `signOut`, `updateProfile`, and `syncFavorites`.
  - `updateProfile` and favorite syncing now call `localAuthApi` helpers instead of remote mutations.
- `LibraryContext.jsx`
  - Manages normalized library entries, progress, ratings, and favorites entirely client-side.
  - Persists changes by delegating to `localLibraryApi` (in-memory) so UI state stays consistent while the backend is offline.
- `src/services/localDataStore.js`
  - Provides `localAuthApi` and `localLibraryApi` facades backed by a global in-memory store.
  - Seeds demo accounts (`demo` / `password` and `admin` / `admin`) and keeps per-user library maps/favorites within the running session.
  - Data resets on Expo reload; it is a temporary stopgap until a real backend (REST/GraphQL/etc.) replaces it.

## External APIs & Integrations
- **Jikan** – Anime/manga data powering Explore, Library metadata, and the home carousel.
- **Trace.moe** – Reverse image search for the Scene Finder tool.
- **Waifu.pics** – Waifu generator content.
- **Google Gemini** – AI concierge on the home screen (requires `EXPO_PUBLIC_GEMINI_API_KEY`).
- **Expo Media Libraries** – Document picker, media selection, and video playback utilities.

## Development Tips
- No remote backend is required; everything persists in-memory while the Metro server is running.
- Restarting Expo (or the bundler) clears the in-memory store. Use the bundled demo credentials (e.g., `demo` / `password` or `admin` / `admin`) if you need predictable data quickly.
- Keep `.env.local` synchronized with any API key changes; Expo only reads `EXPO_PUBLIC_*` keys at startup.
- Run `npm run lint` before committing to catch obvious mistakes.

## Project Reflection
1. **Primary Purpose** – Anisekai centralizes anime/manga discovery, tracking, and curated recommendations in a single mobile hub.
2. **Target Audience** – Enthusiasts who want a stylish companion to log progress, try utilities (Scene Finder, Waifu Generator), and sample AI ideas.
3. **Design & Development Challenges** – Matching Figma's dense gradients/cards in React Native and juggling third-party API rate limits. We replaced the original backend with a temporary in-memory store while we shift toward a custom service, so the UI remains operable.
4. **Proud Moment** – The Explore experience (scoped search + detail overlays) stays performant while mirroring the prototype's hierarchy.
5. **Applying Figma Principles** – Shared tokens in `styles/theme.js` keep typography, gradients, and chips consistent across screens.
6. **Future Enhancements** – Wire the Express backend (or another service) for real persistence, expand library filters, finish forgot-password, add social sharing, and schedule notifications for episode drops.
7. **Readability & Reusability** – Centralized env/config helpers, feature-specific contexts, and modular styles keep components focused on UI.
8. **Tools & Libraries** – Expo Router, React Context, Axios, Expo Media/Document/File modules, Google Gemini SDK helpers, Ionicons, and the custom `localDataStore` for demo persistence.
9. **Post-Midterm Plans** – Replace the temporary store with a real backend, add contract tests around the new API, and layer caching/offline strategies once the data model stabilizes.
10. **Data Management Strategy** – Until a backend ships, `localDataStore` normalizes entries/favorites in-memory. Future work will swap those calls for REST/GraphQL clients behind the same interface.
11. **Ensuring Usability & Scalability** – Continue relying on shared tokens/components, add more automated checks (lint/tests), and document any new backend env vars alongside the existing API keys.

# Project Documentation

## Overview
- **Platform**: React Native app built with Expo and Expo Router.
- **Purpose**: Provides an anime-focused experience featuring authentication, tabbed navigation, and hooks for Convex backend data.
- **Tech Stack**: Expo Router for navigation, Convex for backend mutations/queries, React Context for auth, centralized theming via `app/styles`.

## Quick Start
1. Install dependencies: `npm install` or `yarn install`.
2. Configure backend URL:
   - Preferred: set `EXPO_PUBLIC_CONVEX_URL` in `.env` or `app.json`.
   - Alternative: add `convexDevUrl` / `convexProdUrl` under `expo.extra` in `app.json`.
3. Provide external API endpoints via environment variables:
   - `EXPO_PUBLIC_JIKAN_API_URL` - base URL for Jikan data.
   - `EXPO_PUBLIC_TRACE_API_URL` - endpoint for Trace.moe lookups.
   - `EXPO_PUBLIC_WAIFU_API_BASE` - Waifu.pics SFW API root.
   - `EXPO_PUBLIC_GEMINI_API_KEY` - Google Gemini key powering AI recommendations on Home.
     - Create it in [Google AI Studio](https://ai.google.dev/) or the Cloud Console with the *Generative Language API* enabled.
     - Remove key restrictions or allow the origins you build from (mobile requests have no HTTP referrer).
     - After adding the key to `.env.local`, restart the Expo dev server so the new value is bundled.
4. Launch the dev server: `npx expo start`.
5. Convex backend: run `npx convex dev` in a separate terminal to start the Convex function server.

## Project Structure
```
app/
  _layout.jsx            # Root layout: Auth + Convex providers wrapped around Stack
  index.jsx              # Landing screen directing users to login
  context/
    AuthContext.jsx      # Auth provider storing current user state
  login/
    login.jsx            # Login form using Convex mutation + WelcomeBanner
    register.jsx         # Registration form
    forgot-password.jsx  # Email capture screen
  (tabs)/                # Protected tab navigator (Expo Router group)
    _layout.jsx          # Tab bar configuration
    home.jsx             # Home feed (uses themed styles)
    explore.jsx          # Placeholder screen(s)
    library.jsx          # Placeholder
    profile.jsx          # User info & logout
components/
  WelcomeBanner.jsx      # Animated banner shown after successful login
convex/
  schema.ts              # Convex data model (users table)
  functions/
    auth.js              # register/login mutations
    message.js           # Sample message queries/mutations
app/styles/
  theme.js               # Named + default export with design tokens
  styles.js              # Global reusable styles
  *Styles.js             # Screen-specific StyleSheets consuming the theme
```

## Navigation & Flow
- **Root (`app/_layout.jsx`)**
  - Wraps the app in `AuthProvider` and `ConvexProvider` using a resolved Convex URL.
  - Throws a descriptive error if no backend URL is configured.
  - Renders an Expo Router `Stack` with headers hidden.
- **Auth Screens**
  - `index.jsx` displays a welcoming hero and routes users to `/login/login`.
  - `app/login/login.jsx` handles authentication via Convex `login` mutation and stores the user in `AuthContext`. Successful login triggers the tab navigator (`/(tabs)/home`).
  - `register.jsx` submits to Convex `register` mutation; upon success, it redirects to the login screen.
  - `forgot-password.jsx` is currently UI-only and displays an alert when the form is submitted.
- **Tabs (`app/(tabs)/_layout.jsx`)**
  - Configures a five-tab bar using `Tabs` from Expo Router with Ionicons icons.
  - Active tab color `#fcbf49` matches the primary theme color.
  - Current tabs: `explore`, `library`, `home`, `miscellaneous`, `profile` (most are placeholders).
- **Home Screen (`app/(tabs)/home.jsx`)**
  - Uses themed styles for hero banner and quick-access buttons.
- **Profile Screen**
  - Displays current user info from `AuthContext` and exposes a `Logout` button that resets state and returns to login.

## Authentication & State Management
- `AuthContext.jsx` exposes `user`, `signIn`, and `signOut`.
- `login.jsx` stores the authenticated user returned from Convex into context and triggers a welcome animation.
- `WelcomeBanner.jsx` animates in/out using `Animated.sequence`. It defers `onFinish` execution with `requestAnimationFrame` to avoid React `useInsertionEffect` warnings.

## Styling System
- `app/styles/theme.js` centralizes tokens (colors, spacing, typography, radius, shadow) and exports them as both named (`theme`) and default exports.
- `app/styles/styles.js` defines `globalStyles` built from the theme (container, title, button, card, etc.).
- Screen-specific StyleSheets (`indexStyles`, `loginStyles`, `registerStyles`, `forgotPasswordStyles`, `homeStyles`, `profileStyles`) consume the theme for consistent colors/spacing.
- Components import styles either as default exports (e.g., `indexStyles`) or via `globalStyles` for shared patterns.

## Backend Integration (Convex)
- `convex/schema.ts` defines a `users` table with email/username indexes.
- `convex/functions/auth.js`
  - `register`: validates uniqueness of email & username, inserts record (note: passwords are stored in plaintext—hashing is recommended before production).
  - `login`: accepts username or email (`identifier`), validates password, and returns minimal user data.
- `convex/functions/message.js`
  - Demonstrates simple `getMessages` & `addMessage` operations (requires a corresponding `messages` table to be added to `schema.ts`).
- Expo client connects to Convex via `ConvexReactClient` configured in `_layout.jsx`.

## Environment Configuration
- `.env.local` can hold `EXPO_PUBLIC_CONVEX_URL` (Expo automatically exposes `EXPO_PUBLIC_` vars).
- `app.json` may define `expo.extra.convexDevUrl` / `convexProdUrl` to auto-resolve backend endpoints.
- When neither is present, the app throws an error at startup, making misconfiguration obvious.

## Notable Components & Patterns
- **WelcomeBanner**: Example of handling animations & callbacks safely in React Native.
- **GlobalStyles & Theme**: New screens can import `theme` for conditional styling or `globalStyles` for drop-in components like buttons/cards.
- **Auth-aware Tabs**: While tabs currently render regardless of auth, navigation flows route users to tabs only after `signIn` completes.
- **Convex Hooks (`useMutation`)**: Login and register rely on Convex React hooks for server interaction.

## Extending the Project
- Add more tables/indices inside `convex/schema.ts` and regenerate Convex bindings (`npx convex codegen`).
- Replace placeholder tab screens (`explore`, `library`, `miscellaneous`) with real content, reusing `globalStyles`.
- Implement password hashing & secure storage before shipping.
- Add form validation and user feedback on register/login/f forgot screens.
- Create a `messages` table in the schema if leveraging `message.js` mutations/queries.
- Consider integrating persistent auth (secure storage) by expanding `AuthContext`.

## Development Tips
- Run tests or linting with `expo doctest` / `eslint` (not configured by default).
- When updating theme tokens, re-run the app to ensure caches pick up new values.
- If Convex URL changes, restart the Expo server because the client is memoized at app boot.


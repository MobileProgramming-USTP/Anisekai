# Authentication Flow Documentation

This document outlines the authentication mechanisms within the Anisekai application, specifically focusing on the Login and Registration processes and the underlying state management.

## 1. Overview

The authentication system is built using:
- **Frontend Components**: `Login` and `Register` screens.
- **State Management**: `AuthContext` (React Context API).
- **Backend Service**: `authApi` service for API communication.

## 2. Login Flow

**File:** `app/login/login.jsx`

The login process authenticates a user using their credentials (email/username and password).

### Steps:
1.  **Input**: User enters `identifier` (Email or Username) and `password`.
2.  **Validation**: Basic check to ensure fields are not empty.
3.  **API Call**:
    - Calls `authApi.login({ identifier, password })`.
    - Returns a response object containing the `user` object and an authentication `token`.
4.  **Success Handling**:
    - The `signIn(response)` function from `AuthContext` is called.
    - `signIn` normalizes the user data and updates the global `user` and `token` state.
    - A "Welcome Banner" is displayed (`WelcomeBanner` component).
    - After a short delay (1800ms), the user is redirected to the home screen (`/(tabs)/home`).
5.  **Error Handling**:
    - Displays an alert with the error message returned from the backend or a generic network error message.

## 3. Registration Flow

**File:** `app/login/register.jsx`

The registration process creates a new user account.

### Steps:
1.  **Input**: User enters `username`, `email`, and `password`.
2.  **Validation**: Checks if all fields are filled.
3.  **API Call**:
    - Calls `authApi.register({ username, email, password })`.
4.  **Success Handling**:
    - Displays a success Alert.
    - On confirmation ("OK"), redirects the user to the Login screen (`/login/login`).
5.  **Error Handling**:
    - Displays an alert with specific error details from the backend (e.g., "Username already taken").

## 4. Authentication State Management

**File:** `app/context/AuthContext.jsx`

The `AuthContext` manages the global authentication state across the application.

### Key Features:
- **`user` State**: Holds the current user's profile information (normalized).
- **`token` State**: Holds the JWT authentication token.
- **`signIn(payload)`**:
    - Accepts the login response.
    - Normalizes user data (e.g., standardizing `favorites` and `avatar`).
    - Updates `user` and `token` state.
    - Sets the global auth token for API requests via `setAuthToken`.
- **`signOut()`**:
    - Clears `user` and `token` state.
    - Clears the API auth token.
- **`updateProfile(updates)`**:
    - Allows updating specific user fields (`username`, `email`, `avatar`).
    - Calls `authApi.updateProfile` and updates the local state with the result.
- **`syncFavorites(favorites)`**:
    - syncs the user favorites list with the backend ensuring the local state matches.

## 5. Security & Persistence notes
- The `token` is stored in the React application state (`useState`).
- `setAuthToken` is a utility (likely an axios interceptor configuration) ensuring subsequent API calls include the Bearer token.

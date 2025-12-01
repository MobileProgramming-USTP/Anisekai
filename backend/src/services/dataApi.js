import { backendApiEnabled, backendAuthApi, backendLibraryApi, setBackendAuthToken } from "./backendApi";

if (!backendApiEnabled) {
  // Surface a clear failure when the backend base URL is missing so we stop using local storage.
  throw new Error(
    "EXPO_PUBLIC_API_BASE_URL is not set. Configure your backend URL to use authentication and library features."
  );
}

export const authApi = backendAuthApi;
export const libraryApi = backendLibraryApi;
export const usingBackendApi = backendApiEnabled;
export const setAuthToken = setBackendAuthToken;

export default {
  authApi,
  libraryApi,
  usingBackendApi,
  setAuthToken,
};

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { authApi, setAuthToken, usingBackendApi } from "../../backend/src/services/dataApi";

const normalizeFavorites = (favorites) => {
  if (!Array.isArray(favorites)) {
    return [];
  }

  const seen = new Set();
  const normalized = [];

  for (const value of favorites) {
    const numeric =
      typeof value === "number" && Number.isFinite(value) ? value : Number(value);

    if (Number.isFinite(numeric) && !seen.has(numeric)) {
      seen.add(numeric);
      normalized.push(numeric);
    }
  }

  return normalized;
};

const sanitizeAvatar = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const normalizeUser = (candidate) => {
  if (!candidate) {
    return null;
  }

  const normalizedFavorites = normalizeFavorites(candidate.favorites);
  const normalizedAvatar =
    sanitizeAvatar(candidate.avatar) ?? sanitizeAvatar(candidate.profileImage);
  const id = candidate.id ?? candidate._id ?? null;

  return {
    ...candidate,
    id,
    avatar: normalizedAvatar,
    favorites: normalizedFavorites,
  };
};

const AuthContext = createContext({
  user: null,
  token: null,
  backendEnabled: false,
  signIn: () => undefined,
  signOut: () => undefined,
  updateProfile: async () => undefined,
  syncFavorites: () => undefined,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const userId = user?.id ?? null;

  const signIn = useCallback((payload) => {
    const normalizedUser = normalizeUser(payload?.user ?? payload);
    const nextToken = payload?.token ?? null;
    setUser(normalizedUser);
    setToken(nextToken);
    setAuthToken(nextToken);
    return normalizedUser;
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
  }, []);

  const updateProfile = useCallback(
    async (updates = {}) => {
      if (!userId) {
        throw new Error("You must be signed in to update your profile.");
      }

      const payload = { userId };

      if (Object.prototype.hasOwnProperty.call(updates, "username")) {
        payload.username = updates.username;
      }
      if (Object.prototype.hasOwnProperty.call(updates, "email")) {
        payload.email = updates.email;
      }
      if (Object.prototype.hasOwnProperty.call(updates, "avatar")) {
        payload.avatar = updates.avatar;
      }

      const result = await authApi.updateProfile(payload);
      const normalized = normalizeUser(result?.user ?? result);
      setUser(normalized);
      return normalized;
    },
    [userId]
  );

  const syncFavorites = useCallback(
    (favorites = []) => {
      const normalizedFavorites = normalizeFavorites(favorites);
      setUser((previous) => {
        if (!previous) {
          return previous;
        }

        const currentFavorites = previous.favorites ?? [];
        const isSameLength = currentFavorites.length === normalizedFavorites.length;
        const isSame =
          isSameLength &&
          currentFavorites.every((value, index) => value === normalizedFavorites[index]);

        if (isSame) {
          return previous;
        }

        return {
          ...previous,
          favorites: normalizedFavorites,
        };
      });

      if (userId) {
        authApi
          .updateFavorites({ userId, favorites: normalizedFavorites })
          .catch((error) => {
            console.error("Failed to persist favorites", error);
          });
      }
    },
    [userId]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      backendEnabled: usingBackendApi,
      signIn,
      signOut,
      updateProfile,
      syncFavorites,
    }),
    [user, token, signIn, signOut, updateProfile, syncFavorites]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;

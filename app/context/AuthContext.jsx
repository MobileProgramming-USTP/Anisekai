import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useMutation } from "convex/react";

import { api } from "../../convex/_generated/api";

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
  const normalizedAvatar = sanitizeAvatar(candidate.avatar);
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
  signIn: () => undefined,
  signOut: () => undefined,
  updateProfile: async () => undefined,
  syncFavorites: () => undefined,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const updateProfileMutation = useMutation(api["functions/auth"].updateProfile);

  const signIn = useCallback((nextUser) => {
    setUser(normalizeUser(nextUser));
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (updates = {}) => {
      if (!user?.id) {
        throw new Error("You must be signed in to update your profile.");
      }

      const payload = { userId: user.id };

      if (Object.prototype.hasOwnProperty.call(updates, "username")) {
        payload.username = updates.username;
      }
      if (Object.prototype.hasOwnProperty.call(updates, "email")) {
        payload.email = updates.email;
      }
      if (Object.prototype.hasOwnProperty.call(updates, "avatar")) {
        payload.avatar = updates.avatar;
      }

      const result = await updateProfileMutation(payload);
      const normalized = normalizeUser(result);
      setUser(normalized);
      return normalized;
    },
    [updateProfileMutation, user?.id]
  );

  const syncFavorites = useCallback((favorites = []) => {
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
  }, []);

  const value = useMemo(
    () => ({
      user,
      signIn,
      signOut,
      updateProfile,
      syncFavorites,
    }),
    [user, signIn, signOut, updateProfile, syncFavorites]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;

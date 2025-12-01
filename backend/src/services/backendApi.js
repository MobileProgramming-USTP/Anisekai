import backendClient, { backendEnabled, setBackendAuthToken } from "./backendClient";

const normalizeFavorites = (favorites) => {
  if (!Array.isArray(favorites)) {
    return [];
  }

  const seen = new Set();
  const normalized = [];

  favorites.forEach((value) => {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && !seen.has(numeric)) {
      seen.add(numeric);
      normalized.push(numeric);
    }
  });

  return normalized;
};

const normalizeProgress = (progress = {}) => {
  const toCount = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric >= 0 ? Math.floor(numeric) : 0;
  };

  return {
    watchedEpisodes: toCount(progress.watchedEpisodes),
    readChapters: toCount(progress.readChapters),
  };
};

const normalizeUser = (candidate) => {
  const user = candidate?.user ?? candidate;
  if (!user) {
    return null;
  }

  const avatarCandidate =
    typeof user.avatar === "string"
      ? user.avatar
      : typeof user.profileImage === "string"
      ? user.profileImage
      : "";

  return {
    id: user.id ?? user._id ?? null,
    username: user.username,
    email: user.email,
    avatar: avatarCandidate?.trim?.() || null,
    favorites: normalizeFavorites(user.favorites),
  };
};

const normalizeEntry = (entry) => {
  if (!entry) {
    return null;
  }

  const malId = typeof entry.mal_id === "number" ? entry.mal_id : entry.malId;
  if (!Number.isFinite(malId)) {
    return null;
  }

  const toNullableNumber = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  };

  const updatedAt =
    typeof entry.updatedAt === "number" && Number.isFinite(entry.updatedAt)
      ? entry.updatedAt
      : Date.now();

  return {
    ...entry,
    id: entry.id ?? entry._id ?? malId,
    mal_id: malId,
    malId,
    status: entry.status || "watching",
    scope: entry.scope || "anime",
    title: entry.title || "Untitled",
    coverImage: entry.coverImage ?? null,
    score: toNullableNumber(entry.score),
    episodes: toNullableNumber(entry.episodes),
    chapters: toNullableNumber(entry.chapters),
    progress: normalizeProgress(entry.progress),
    rating: toNullableNumber(entry.rating),
    raw: entry.raw ?? null,
    updatedAt,
  };
};

const assertBackendClient = () => {
  if (!backendClient) {
    throw new Error("Backend API base URL is not configured.");
  }
};

export const backendAuthApi = {
  register: async ({ username, email, password }) => {
    assertBackendClient();
    const response = await backendClient.post("/auth/register", { username, email, password });
    const token = response?.data?.token ?? null;
    if (token) {
      setBackendAuthToken(token);
    }
    return {
      user: normalizeUser(response?.data?.user),
      token,
    };
  },

  login: async ({ identifier, password }) => {
    assertBackendClient();
    const response = await backendClient.post("/auth/login", { identifier, password });
    const token = response?.data?.token ?? null;
    if (token) {
      setBackendAuthToken(token);
    }
    return {
      user: normalizeUser(response?.data?.user),
      token,
    };
  },

  updateProfile: async ({ username, email, avatar }) => {
    assertBackendClient();
    const response = await backendClient.put("/auth/profile", { username, email, avatar });
    return normalizeUser(response?.data?.user);
  },

  updateFavorites: async ({ favorites }) => {
    assertBackendClient();
    const response = await backendClient.patch("/auth/favorites", { favorites });
    return normalizeFavorites(response?.data?.favorites);
  },
};

export const backendLibraryApi = {
  list: async () => {
    assertBackendClient();
    const response = await backendClient.get("/library");
    const entries = Array.isArray(response?.data) ? response.data : [];
    return entries.map((entry) => normalizeEntry(entry)).filter(Boolean);
  },

  save: async ({ entry }) => {
    assertBackendClient();
    const response = await backendClient.post("/library", { entry });
    return normalizeEntry(response?.data);
  },

  remove: async ({ malId }) => {
    assertBackendClient();
    await backendClient.delete(`/library/${malId}`);
    return true;
  },

  updateStatus: async ({ malId, status }) => {
    assertBackendClient();
    const response = await backendClient.patch(`/library/${malId}/status`, { status });
    return normalizeEntry(response?.data);
  },

  updateProgress: async ({ malId, type, value }) => {
    assertBackendClient();
    const response = await backendClient.patch(`/library/${malId}/progress`, { type, value });
    return normalizeEntry(response?.data);
  },

  updateRating: async ({ malId, rating }) => {
    assertBackendClient();
    const response = await backendClient.patch(`/library/${malId}/rating`, { rating });
    return normalizeEntry(response?.data);
  },

  reset: async () => {
    assertBackendClient();
    await backendClient.post("/library/reset");
    return true;
  },
};

export const backendApiEnabled = backendEnabled;

export { setBackendAuthToken };

export default {
  auth: backendAuthApi,
  library: backendLibraryApi,
  enabled: backendEnabled,
};

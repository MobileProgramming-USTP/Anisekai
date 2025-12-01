const STORE_KEY = "__anisekaiLocalStore__";

const sanitizeCount = (value) => {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.floor(value);
  }

  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric >= 0) {
    return Math.floor(numeric);
  }

  return 0;
};

const sanitizeProgress = (progress = {}) => ({
  watchedEpisodes: sanitizeCount(progress.watchedEpisodes),
  readChapters: sanitizeCount(progress.readChapters),
});

const sanitizeFavorites = (favorites) => {
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

const cloneEntry = (entry) => {
  const malId = Number(entry?.mal_id ?? entry?.malId);
  if (!Number.isFinite(malId)) {
    return null;
  }

  return {
    ...entry,
    malId,
    mal_id: malId,
    status: entry?.status ?? "watching",
    scope: entry?.scope ?? "anime",
    title: entry?.title ?? "Untitled",
    coverImage: entry?.coverImage ?? null,
    score:
      typeof entry?.score === "number" && Number.isFinite(entry.score) ? entry.score : null,
    episodes:
      typeof entry?.episodes === "number" && Number.isFinite(entry.episodes)
        ? entry.episodes
        : null,
    chapters:
      typeof entry?.chapters === "number" && Number.isFinite(entry.chapters)
        ? entry.chapters
        : null,
    progress: sanitizeProgress(entry?.progress),
    rating:
      typeof entry?.rating === "number" && Number.isFinite(entry.rating)
        ? Math.min(10, Math.max(0, entry.rating))
        : null,
    updatedAt:
      typeof entry?.updatedAt === "number" && Number.isFinite(entry.updatedAt)
        ? entry.updatedAt
        : Date.now(),
  };
};

const cloneUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  avatar: user.avatar ?? null,
  favorites: sanitizeFavorites(user.favorites),
});

const createDemoUser = () => ({
  id: "demo-user",
  username: "demo",
  email: "demo@example.com",
  password: "password",
  avatar: null,
  favorites: [],
});

const createAdminUser = () => ({
  id: "admin-user",
  username: "admin",
  email: "admin@example.com",
  password: "admin",
  avatar: null,
  favorites: [],
});

const createStore = () => {
  const demoUser = createDemoUser();
  const adminUser = createAdminUser();
  return {
    users: new Map([
      [demoUser.id, { ...demoUser }],
      [adminUser.id, { ...adminUser }],
    ]),
    libraryEntries: new Map([
      [demoUser.id, new Map()],
      [adminUser.id, new Map()],
    ]),
  };
};

const getStore = () => {
  if (!globalThis[STORE_KEY]) {
    globalThis[STORE_KEY] = createStore();
  }
  return globalThis[STORE_KEY];
};

const generateUserId = () => `user_${Date.now().toString(36)}${Math.random()
  .toString(36)
  .slice(2, 8)}`;

const toComparable = (value) => (typeof value === "string" ? value.trim().toLowerCase() : "");

const assertUniqueIdentity = (store, { username, email }, ignoreUserId) => {
  const usernameKey = toComparable(username);
  const emailKey = toComparable(email);

  for (const candidate of store.users.values()) {
    if (candidate.id === ignoreUserId) {
      continue;
    }

    if (usernameKey && toComparable(candidate.username) === usernameKey) {
      throw new Error("Username is already in use.");
    }

    if (emailKey && toComparable(candidate.email) === emailKey) {
      throw new Error("Email is already registered.");
    }
  }
};

const findUserByIdentifier = (store, identifier) => {
  const key = toComparable(identifier);
  if (!key) {
    return null;
  }

  for (const candidate of store.users.values()) {
    if (toComparable(candidate.username) === key || toComparable(candidate.email) === key) {
      return candidate;
    }
  }

  return null;
};

const requireUser = (store, userId) => {
  if (!userId) {
    throw new Error("You must be signed in to continue.");
  }

  const user = store.users.get(userId);
  if (!user) {
    throw new Error("Session expired. Please log in again.");
  }

  return user;
};

const getLibraryBucket = (store, userId) => {
  requireUser(store, userId);

  if (!store.libraryEntries.has(userId)) {
    store.libraryEntries.set(userId, new Map());
  }

  return store.libraryEntries.get(userId);
};

const normalizeMalId = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const upsertEntry = (bucket, entry) => {
  const sanitized = cloneEntry(entry);
  if (!sanitized) {
    throw new Error("Library entry is missing a valid MAL id.");
  }

  const next = { ...sanitized, updatedAt: Date.now() };
  bucket.set(next.malId, next);
  return cloneEntry(next);
};

export const localAuthApi = {
  register: async ({ username, email, password }) => {
    const trimmedUsername = typeof username === "string" ? username.trim() : "";
    const trimmedEmail = typeof email === "string" ? email.trim() : "";

    if (!trimmedUsername) {
      throw new Error("Username is required.");
    }

    if (!trimmedEmail) {
      throw new Error("Email is required.");
    }

    if (typeof password !== "string" || password.length < 4) {
      throw new Error("Password must be at least 4 characters long.");
    }

    const store = getStore();
    assertUniqueIdentity(store, { username: trimmedUsername, email: trimmedEmail });

    const user = {
      id: generateUserId(),
      username: trimmedUsername,
      email: trimmedEmail,
      password,
      avatar: null,
      favorites: [],
    };

    store.users.set(user.id, user);
    store.libraryEntries.set(user.id, new Map());

    return cloneUser(user);
  },

  login: async ({ identifier, password }) => {
    if (!identifier) {
      throw new Error("Please enter a username or email.");
    }

    if (!password) {
      throw new Error("Please enter your password.");
    }

    const store = getStore();
    const user = findUserByIdentifier(store, identifier);

    if (!user || user.password !== password) {
      throw new Error("Invalid credentials.");
    }

    return cloneUser(user);
  },

  updateProfile: async ({ userId, username, email, avatar }) => {
    const store = getStore();
    const user = requireUser(store, userId);

    const nextUsername = typeof username === "string" ? username.trim() : user.username;
    const nextEmail = typeof email === "string" ? email.trim() : user.email;

    assertUniqueIdentity(store, { username: nextUsername, email: nextEmail }, user.id);

    user.username = nextUsername;
    user.email = nextEmail;

    if (typeof avatar !== "undefined") {
      user.avatar = avatar ? avatar.trim?.() || avatar : null;
    }

    return cloneUser(user);
  },

  updateFavorites: async ({ userId, favorites }) => {
    const store = getStore();
    const user = requireUser(store, userId);
    user.favorites = sanitizeFavorites(favorites);
    return [...user.favorites];
  },
};

export const localLibraryApi = {
  list: async ({ userId }) => {
    if (!userId) {
      return [];
    }

    const store = getStore();
    const bucket = getLibraryBucket(store, userId);
    return Array.from(bucket.values()).map((entry) => cloneEntry(entry));
  },

  save: async ({ userId, entry }) => {
    const store = getStore();
    const bucket = getLibraryBucket(store, userId);
    return upsertEntry(bucket, entry);
  },

  remove: async ({ userId, malId }) => {
    const store = getStore();
    const bucket = getLibraryBucket(store, userId);
    const normalizedMalId = normalizeMalId(malId);
    if (normalizedMalId == null) {
      throw new Error("Invalid MAL id.");
    }
    bucket.delete(normalizedMalId);
    return true;
  },

  updateStatus: async ({ userId, malId, status }) => {
    const store = getStore();
    const bucket = getLibraryBucket(store, userId);
    const normalizedMalId = normalizeMalId(malId);
    if (normalizedMalId == null) {
      throw new Error("Invalid MAL id.");
    }
    const entry = bucket.get(normalizedMalId);
    if (!entry) {
      throw new Error("Entry not found.");
    }
    entry.status = status;
    entry.updatedAt = Date.now();
    return cloneEntry(entry);
  },

  updateProgress: async ({ userId, malId, type, value }) => {
    const store = getStore();
    const bucket = getLibraryBucket(store, userId);
    const normalizedMalId = normalizeMalId(malId);
    if (normalizedMalId == null) {
      throw new Error("Invalid MAL id.");
    }
    const entry = bucket.get(normalizedMalId);
    if (!entry) {
      throw new Error("Entry not found.");
    }
    const progress = sanitizeProgress(entry.progress);
    if (type === "chapters") {
      progress.readChapters = sanitizeCount(value);
    } else {
      progress.watchedEpisodes = sanitizeCount(value);
    }
    entry.progress = progress;
    entry.updatedAt = Date.now();
    return cloneEntry(entry);
  },

  updateRating: async ({ userId, malId, rating }) => {
    const store = getStore();
    const bucket = getLibraryBucket(store, userId);
    const normalizedMalId = normalizeMalId(malId);
    if (normalizedMalId == null) {
      throw new Error("Invalid MAL id.");
    }
    const entry = bucket.get(normalizedMalId);
    if (!entry) {
      throw new Error("Entry not found.");
    }
    entry.rating = typeof rating === "number" && Number.isFinite(rating)
      ? Math.min(10, Math.max(0, Math.round(rating * 10) / 10))
      : null;
    entry.updatedAt = Date.now();
    return cloneEntry(entry);
  },

  reset: async ({ userId }) => {
    const store = getStore();
    if (!userId) {
      return;
    }
    store.libraryEntries.set(userId, new Map());
  },
};

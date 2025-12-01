import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { libraryApi } from '../../backend/src/services/dataApi';
import { resolvePreferredTitle } from '../../src/utils/resolveTitle';

export const LIBRARY_STATUS = {
  WATCHING: 'watching',
  COMPLETED: 'completed',
  WATCHLIST: 'watchlist',
  DROPPED: 'dropped',
};

export const LIBRARY_STATUS_ORDER = [
  LIBRARY_STATUS.WATCHING,
  LIBRARY_STATUS.COMPLETED,
  LIBRARY_STATUS.WATCHLIST,
  LIBRARY_STATUS.DROPPED,
];

export const LIBRARY_STATUS_META = {
  [LIBRARY_STATUS.WATCHING]: {
    label: 'Watching',
    color: '#4C82FF',
    scopeLabels: { manga: 'Reading' },
  },
  [LIBRARY_STATUS.COMPLETED]: { label: 'Completed', color: '#58CC8A' },
  [LIBRARY_STATUS.WATCHLIST]: {
    label: 'Watchlist',
    color: '#F9C74F',
    scopeLabels: { manga: 'Readlist' },
  },
  [LIBRARY_STATUS.DROPPED]: { label: 'Dropped', color: '#FF6B6B' },
};

const DEFAULT_STATUS = LIBRARY_STATUS.WATCHING;

const LibraryContext = createContext(null);

const normalizeMalId = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  return null;
};

const inferMediaScope = (media, fallbackScope) => {
  if (fallbackScope) {
    return fallbackScope;
  }

  const rawType = media?.type?.toLowerCase?.();
  if (rawType?.includes('manga')) {
    return 'manga';
  }

  return 'anime';
};

const resolveCoverImage = (media) =>
  media?.images?.jpg?.large_image_url ||
  media?.images?.webp?.large_image_url ||
  media?.images?.jpg?.image_url ||
  media?.images?.webp?.image_url ||
  media?.image_url ||
  media?.pictures?.[0]?.jpg?.large_image_url ||
  media?.pictures?.[0]?.jpg?.image_url ||
  null;

const initializeProgress = () => ({
  watchedEpisodes: 0,
  readChapters: 0,
});

const buildLibraryEntry = (media, status, scope) => {
  const coverImage = resolveCoverImage(media);
  const { mal_id: id } = media ?? {};

  return {
    id,
    mal_id: id,
    status,
    scope: inferMediaScope(media, scope),
    title: resolvePreferredTitle(media),
    coverImage,
    score: typeof media?.score === 'number' ? media.score : null,
    episodes: typeof media?.episodes === 'number' ? media.episodes : null,
    chapters: typeof media?.chapters === 'number' ? media.chapters : null,
    progress: initializeProgress(),
    rating: null,
    updatedAt: Date.now(),
    raw: media ?? null,
  };
};

const ensureProgressShape = (progress) => {
  if (!progress || typeof progress !== 'object') {
    return initializeProgress();
  }

  const { watchedEpisodes, readChapters } = progress;
  const safeEpisodes =
    typeof watchedEpisodes === 'number' && Number.isFinite(watchedEpisodes) && watchedEpisodes >= 0
      ? Math.floor(watchedEpisodes)
      : 0;
  const safeChapters =
    typeof readChapters === 'number' && Number.isFinite(readChapters) && readChapters >= 0
      ? Math.floor(readChapters)
      : 0;

  return {
    watchedEpisodes: safeEpisodes,
    readChapters: safeChapters,
  };
};

const sanitizeNullableNumber = (value) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const toBackendEntryPayload = (entry) => {
  const malId = typeof entry?.mal_id === 'number' ? entry.mal_id : entry?.malId;
  if (typeof malId !== 'number') {
    return null;
  }

  return {
    malId,
    status: entry?.status || DEFAULT_STATUS,
    scope: entry?.scope || 'anime',
    title: entry?.title || 'Untitled',
    coverImage: entry?.coverImage ?? null,
    score: sanitizeNullableNumber(entry?.score),
    episodes: sanitizeNullableNumber(entry?.episodes),
    chapters: sanitizeNullableNumber(entry?.chapters),
    progress: ensureProgressShape(entry?.progress),
    rating: sanitizeNullableNumber(entry?.rating),
    raw: entry?.raw ?? null,
  };
};

const fromBackendEntry = (entry) => {
  const malId = typeof entry?.mal_id === 'number' ? entry.mal_id : entry?.malId;
  if (typeof malId !== 'number') {
    return null;
  }

  const updatedAt =
    typeof entry?.updatedAt === 'number' && Number.isFinite(entry.updatedAt)
      ? entry.updatedAt
      : Date.now();

  return {
    ...entry,
    id: entry?.id ?? malId,
    mal_id: malId,
    title: resolvePreferredTitle(entry?.raw ?? entry, entry?.title ?? 'Untitled'),
    progress: ensureProgressShape(entry?.progress),
    rating: sanitizeNullableNumber(entry?.rating),
    score: sanitizeNullableNumber(entry?.score),
    episodes: sanitizeNullableNumber(entry?.episodes),
    chapters: sanitizeNullableNumber(entry?.chapters),
    coverImage: entry?.coverImage ?? null,
    raw: entry?.raw ?? null,
    updatedAt,
  };
};

export const LibraryProvider = ({ children }) => {
  const { user, syncFavorites } = useAuth();
  const userId = user?.id ?? null;

  const [entriesById, setEntriesById] = useState({});
  const [favoriteEntryIds, setFavoriteEntryIds] = useState(() => new Set());

  useEffect(() => {
    if (!userId) {
      setEntriesById({});
      return;
    }

    let isMounted = true;

    libraryApi
      .list({ userId })
      .then((entries) => {
        if (!isMounted) {
          return;
        }

        if (!Array.isArray(entries)) {
          setEntriesById({});
          return;
        }

        const mapped = entries.reduce((acc, entry) => {
          const normalized = fromBackendEntry(entry);
          if (!normalized) {
            return acc;
          }
          acc[normalized.mal_id] = normalized;
          return acc;
        }, {});

        setEntriesById(mapped);
      })
      .catch((error) => {
        console.error('Failed to load library entries', error);
        if (isMounted) {
          setEntriesById({});
        }
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setFavoriteEntryIds(new Set());
      return;
    }

    const favorites = Array.isArray(user?.favorites) ? user.favorites : [];

    setFavoriteEntryIds((prev) => {
      const next = new Set();

      favorites.forEach((value) => {
        const normalized = normalizeMalId(value);
        if (normalized != null) {
          next.add(normalized);
        }
      });

      if (next.size === prev.size) {
        let differs = false;
        for (const value of next) {
          if (!prev.has(value)) {
            differs = true;
            break;
          }
        }
        if (!differs) {
          return prev;
        }
      }

      return next;
    });
  }, [user?.favorites, userId]);

  const persistFavorites = useCallback(
    (favoritesSet) => {
      if (!userId) {
        return;
      }

      const sanitizedFavorites = Array.from(favoritesSet)
        .map((value) => normalizeMalId(value))
        .filter((value) => value != null);

      syncFavorites(sanitizedFavorites);
    },
    [syncFavorites, userId]
  );

  const upsertEntry = useCallback(
    (media, { status, scope } = {}) => {
      if (!media?.mal_id) {
        return;
      }

      const statusKey = status || DEFAULT_STATUS;
      let mergedEntry = null;

      setEntriesById((prev) => {
        const nextEntry = buildLibraryEntry(media, statusKey, scope);
        const existing = prev[media.mal_id];

        if (existing) {
          const preservedProgress = ensureProgressShape(existing.progress);
          const preservedRating =
            typeof existing.rating === 'number' ? existing.rating : nextEntry.rating;

          mergedEntry = {
            ...existing,
            ...nextEntry,
            progress: preservedProgress,
            rating: preservedRating,
            raw: media ?? existing.raw,
            updatedAt: Date.now(),
          };
        } else {
          mergedEntry = nextEntry;
        }

        return {
          ...prev,
          [media.mal_id]: mergedEntry,
        };
      });

      if (mergedEntry && userId) {
        const payload = toBackendEntryPayload(mergedEntry);
        if (payload) {
          libraryApi.save({ userId, entry: payload }).catch((error) => {
            console.error('Failed to persist library entry', error);
          });
        }
      }
    },
    [userId]
  );

  const removeEntry = useCallback(
    (malId) => {
      const normalizedMalId = normalizeMalId(malId);
      if (normalizedMalId == null) {
        return;
      }

      let hadEntry = false;
      let nextFavoritesSet = null;
      setEntriesById((prev) => {
        if (!prev[normalizedMalId]) {
          return prev;
        }
        hadEntry = true;
        const next = { ...prev };
        delete next[normalizedMalId];
        return next;
      });

      if (hadEntry) {
        setFavoriteEntryIds((prev) => {
          if (!prev.has(normalizedMalId)) {
            return prev;
          }
          const next = new Set(prev);
          next.delete(normalizedMalId);
          nextFavoritesSet = next;
          return next;
        });

        if (userId) {
          libraryApi.remove({ userId, malId: normalizedMalId }).catch((error) => {
            console.error('Failed to remove library entry', error);
          });
          if (nextFavoritesSet) {
            persistFavorites(nextFavoritesSet);
          }
        }
      }
    },
    [persistFavorites, userId]
  );

  const updateEntryStatus = useCallback(
    (malId, status) => {
      if (malId == null) {
        return;
      }

      if (!status) {
        removeEntry(malId);
        return;
      }

      let didChange = false;
      setEntriesById((prev) => {
        const existing = prev[malId];
        if (!existing) {
          return prev;
        }

        if (existing.status === status) {
          return prev;
        }

        didChange = true;
        return {
          ...prev,
          [malId]: {
            ...existing,
            status,
            updatedAt: Date.now(),
          },
        };
      });

      if (didChange && userId) {
        libraryApi.updateStatus({ userId, malId, status }).catch((error) => {
          console.error('Failed to update library status', error);
        });
      }
    },
    [removeEntry, userId]
  );

  const updateEntryProgress = useCallback(
    (malId, value, type = 'episodes') => {
      if (malId == null) {
        return;
      }

      const sanitizedValue =
        typeof value === 'number' && Number.isFinite(value) && value >= 0
          ? Math.floor(value)
          : 0;

      let didUpdate = false;
      setEntriesById((prev) => {
        const existing = prev[malId];
        if (!existing) {
          return prev;
        }

        const currentProgress = ensureProgressShape(existing.progress);
        const progressKey = type === 'chapters' ? 'readChapters' : 'watchedEpisodes';

        if (currentProgress[progressKey] === sanitizedValue) {
          return prev;
        }

        didUpdate = true;
        const updatedProgress = {
          ...currentProgress,
          [progressKey]: sanitizedValue,
        };

        return {
          ...prev,
          [malId]: {
            ...existing,
            progress: updatedProgress,
            updatedAt: Date.now(),
          },
        };
      });

      if (didUpdate && userId) {
        libraryApi
          .updateProgress({
            userId,
            malId,
            value: sanitizedValue,
            type,
          })
          .catch((error) => {
            console.error('Failed to update library progress', error);
          });
      }
    },
    [userId]
  );

  const updateEntryRating = useCallback(
    (malId, rating) => {
      if (malId == null) {
        return;
      }

      const sanitizedRating =
        typeof rating === 'number' && Number.isFinite(rating) && rating >= 0
          ? Math.min(10, Math.round(rating * 10) / 10)
          : null;

      let didUpdate = false;
      setEntriesById((prev) => {
        const existing = prev[malId];
        if (!existing) {
          return prev;
        }

        if (existing.rating === sanitizedRating) {
          return prev;
        }

        didUpdate = true;
        return {
          ...prev,
          [malId]: {
            ...existing,
            rating: sanitizedRating,
            updatedAt: Date.now(),
          },
        };
      });

      if (didUpdate && userId) {
        libraryApi
          .updateRating({
            userId,
            malId,
            rating: sanitizedRating,
          })
          .catch((error) => {
            console.error('Failed to update library rating', error);
          });
      }
    },
    [userId]
  );

  const resetLibrary = useCallback(() => {
    setEntriesById({});
    setFavoriteEntryIds(() => new Set());
    syncFavorites([]);
    if (userId) {
      libraryApi.reset({ userId }).catch((error) => {
        console.error('Failed to reset library cache', error);
      });
    }
  }, [syncFavorites, userId]);

  const toggleFavoriteEntry = useCallback(
    (malId) => {
      const normalizedMalId = normalizeMalId(malId);
      if (normalizedMalId == null) {
        return;
      }

      let nextFavoritesSet = null;
      setFavoriteEntryIds((prev) => {
        const next = new Set(prev);
        if (next.has(normalizedMalId)) {
          next.delete(normalizedMalId);
        } else {
          next.add(normalizedMalId);
        }
        nextFavoritesSet = next;
        return next;
      });

      if (userId && nextFavoritesSet) {
        persistFavorites(nextFavoritesSet);
      }
    },
    [persistFavorites, userId]
  );

  const isFavoriteEntry = useCallback(
    (malId) => favoriteEntryIds.has(normalizeMalId(malId)),
    [favoriteEntryIds]
  );

  const favoriteEntries = useMemo(
    () =>
      Object.values(entriesById).filter((entry) => {
        const normalizedMalId = normalizeMalId(entry?.mal_id ?? entry?.id);
        return normalizedMalId != null && favoriteEntryIds.has(normalizedMalId);
      }),
    [entriesById, favoriteEntryIds]
  );

  const resolveStatusLabel = useCallback((statusKey, scope) => {
    const meta = LIBRARY_STATUS_META[statusKey];
    if (!meta) {
      return statusKey;
    }

    const normalizedScope = typeof scope === 'string' ? scope.toLowerCase() : '';
    const scopeLabel = normalizedScope ? meta.scopeLabels?.[normalizedScope] : null;
    if (scopeLabel) {
      return scopeLabel;
    }

    return meta.label;
  }, []);

  const value = useMemo(
    () => ({
      entriesById,
      entries: Object.values(entriesById),
      upsertEntry,
      removeEntry,
      updateEntryStatus,
      updateEntryProgress,
      updateEntryRating,
      resetLibrary,
      toggleFavoriteEntry,
      isFavoriteEntry,
      favoriteEntries,
      favoriteEntryIds,
      statuses: LIBRARY_STATUS,
      statusMeta: LIBRARY_STATUS_META,
      statusOrder: LIBRARY_STATUS_ORDER,
      defaultStatus: DEFAULT_STATUS,
      resolveStatusLabel,
      userId,
    }),
    [
      entriesById,
      upsertEntry,
      removeEntry,
      updateEntryStatus,
      updateEntryProgress,
      updateEntryRating,
      resetLibrary,
      toggleFavoriteEntry,
      isFavoriteEntry,
      favoriteEntries,
      favoriteEntryIds,
      resolveStatusLabel,
      userId,
    ]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};

export default LibraryProvider;

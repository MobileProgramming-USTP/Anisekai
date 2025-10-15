import { createContext, useCallback, useContext, useMemo, useState } from 'react';

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
    title: media?.title || media?.name || media?.username || 'Untitled',
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

export const LibraryProvider = ({ children }) => {
  const [entriesById, setEntriesById] = useState({});

  const upsertEntry = useCallback((media, { status, scope } = {}) => {
    if (!media?.mal_id) {
      return;
    }

    const statusKey = status || DEFAULT_STATUS;

    setEntriesById((prev) => {
      const nextEntry = buildLibraryEntry(media, statusKey, scope);
      const existing = prev[media.mal_id];

      if (existing) {
        const preservedProgress =
          existing.progress && typeof existing.progress === 'object'
            ? existing.progress
            : initializeProgress();
        const preservedRating =
          typeof existing.rating === 'number' ? existing.rating : nextEntry.rating;
        return {
          ...prev,
          [media.mal_id]: {
            ...existing,
            ...nextEntry,
            progress: preservedProgress,
            rating: preservedRating,
            raw: media ?? existing.raw,
            updatedAt: Date.now(),
          },
        };
      }

      return {
        ...prev,
        [media.mal_id]: nextEntry,
      };
    });
  }, []);

  const removeEntry = useCallback((malId) => {
    if (malId == null) {
      return;
    }

    setEntriesById((prev) => {
      if (!prev[malId]) {
        return prev;
      }
      const next = { ...prev };
      delete next[malId];
      return next;
    });
  }, []);

  const updateEntryStatus = useCallback((malId, status) => {
    if (malId == null) {
      return;
    }

    if (!status) {
      removeEntry(malId);
      return;
    }

    setEntriesById((prev) => {
      const existing = prev[malId];
      if (!existing) {
        return prev;
      }

      if (existing.status === status) {
        return prev;
      }

      return {
        ...prev,
        [malId]: {
          ...existing,
          status,
          updatedAt: Date.now(),
        },
      };
    });
  }, [removeEntry]);

  const updateEntryProgress = useCallback((malId, value, type = 'episodes') => {
    if (malId == null) {
      return;
    }

    setEntriesById((prev) => {
      const existing = prev[malId];
      if (!existing) {
        return prev;
      }

      const sanitizedValue =
        typeof value === 'number' && Number.isFinite(value) && value >= 0
          ? Math.floor(value)
          : 0;

      const nextProgress = {
        ...(existing.progress && typeof existing.progress === 'object'
          ? existing.progress
          : initializeProgress()),
      };

      if (type === 'chapters') {
        nextProgress.readChapters = sanitizedValue;
      } else {
        nextProgress.watchedEpisodes = sanitizedValue;
      }

      return {
        ...prev,
        [malId]: {
          ...existing,
          progress: nextProgress,
          updatedAt: Date.now(),
        },
      };
    });
  }, []);

  const updateEntryRating = useCallback((malId, rating) => {
    if (malId == null) {
      return;
    }

    setEntriesById((prev) => {
      const existing = prev[malId];
      if (!existing) {
        return prev;
      }

      const sanitizedRating =
        typeof rating === 'number' && Number.isFinite(rating) && rating >= 0
          ? Math.min(10, Math.round(rating * 10) / 10)
          : null;

      return {
        ...prev,
        [malId]: {
          ...existing,
          rating: sanitizedRating,
          updatedAt: Date.now(),
        },
      };
    });
  }, []);

  const resetLibrary = useCallback(() => {
    setEntriesById({});
  }, []);

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
      statuses: LIBRARY_STATUS,
      statusMeta: LIBRARY_STATUS_META,
      statusOrder: LIBRARY_STATUS_ORDER,
      defaultStatus: DEFAULT_STATUS,
      resolveStatusLabel,
    }),
    [
      entriesById,
      upsertEntry,
      removeEntry,
      updateEntryStatus,
      updateEntryProgress,
      updateEntryRating,
      resetLibrary,
      resolveStatusLabel,
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


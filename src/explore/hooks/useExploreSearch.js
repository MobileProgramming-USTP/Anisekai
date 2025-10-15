import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { JIKAN_API_URL, SEARCH_SETTINGS } from '../constants';
import { fetchJsonWithRetry } from '../utils/api';

const searchCache = new Map();
const pendingSearches = new Map();

const getCacheEntry = (key) => {
  const cached = searchCache.get(key);
  if (!cached) {
    return null;
  }

  if (Date.now() - cached.timestamp > SEARCH_SETTINGS.CACHE_TTL_MS) {
    searchCache.delete(key);
    return null;
  }

  return cached;
};

const setCacheEntry = (key, results, partial = false) => {
  if (searchCache.size >= SEARCH_SETTINGS.MAX_CACHE_ENTRIES) {
    const oldestKey = searchCache.keys().next().value;
    if (oldestKey) {
      searchCache.delete(oldestKey);
    }
  }

  searchCache.set(key, {
    results,
    partial,
    timestamp: Date.now(),
  });
};

const hydratePrefixCaches = (scope, query, results) => {
  const normalized = query.toLowerCase();
  for (let len = normalized.length - 1; len >= SEARCH_SETTINGS.MIN_PREFIX_CACHE_LENGTH; len -= 1) {
    const prefix = normalized.slice(0, len);
    const prefixKey = `${scope}:${prefix}`;
    if (!searchCache.has(prefixKey)) {
      setCacheEntry(prefixKey, results, true);
    }
  }
};

const buildSearchUrl = (scope, query) => {
  const encoded = encodeURIComponent(query);
  switch (scope) {
    case 'anime':
      return `${JIKAN_API_URL}/anime?q=${encoded}&limit=20&sfw&fields=mal_id,title,images,score,episodes,genres`;
    case 'manga':
      return `${JIKAN_API_URL}/manga?q=${encoded}&limit=20&sfw&fields=mal_id,title,images,score,chapters,genres`;
    case 'characters':
      return `${JIKAN_API_URL}/characters?q=${encoded}&limit=20&fields=mal_id,name,images,about,favorites,nicknames`;
    case 'users':
      return `${JIKAN_API_URL}/users?q=${encoded}&limit=20`;
    default:
      return null;
  }
};

const takeSearchPromise = (cacheKey, url) => {
  const existing = pendingSearches.get(cacheKey);
  if (existing) {
    return existing;
  }

  const promise = fetchJsonWithRetry(url, {
    retries: 1,
    backoff: 600,
  })
    .then((payload) => payload?.data ?? [])
    .finally(() => {
      pendingSearches.delete(cacheKey);
    });
  pendingSearches.set(cacheKey, promise);
  return promise;
};

const useExploreSearch = (activeScope, activeScopeLabel) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  const clearSearch = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setSearchQuery('');
    setSearchResults([]);
    setSearchLoading(false);
    setSearchError(null);
  }, []);

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      setSearchResults([]);
      setSearchError(null);
      setSearchLoading(false);
      return;
    }

    const url = buildSearchUrl(activeScope, trimmedQuery);
    if (!url) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const cacheKey = `${activeScope}:${trimmedQuery.toLowerCase()}`;
    const cached = getCacheEntry(cacheKey);
    if (cached) {
      setSearchResults(cached.results);
      setSearchError(null);
      setSearchLoading(Boolean(cached.partial));
      if (!cached.partial) {
        return;
      }
    } else {
      setSearchLoading(true);
      setSearchError(null);
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const results = await takeSearchPromise(cacheKey, url);
        if (controller.signal.aborted) {
          return;
        }

        setCacheEntry(cacheKey, results, false);
        hydratePrefixCaches(activeScope, trimmedQuery, results);
        setSearchResults(results);
        setSearchError(null);
      } catch (error) {
        if (controller.signal.aborted || error.name === 'AbortError') {
          return;
        }
        setSearchError(`Failed to search ${activeScopeLabel.toLowerCase()}.`);
        setSearchResults([]);
        console.error(error);
      } finally {
        if (!controller.signal.aborted) {
          setSearchLoading(false);
        }
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    }, SEARCH_SETTINGS.DEBOUNCE_MS);

    return () => {
      controller.abort();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [activeScope, activeScopeLabel, searchQuery]);

  const hasCachedResults = useMemo(() => searchResults.length > 0, [searchResults.length]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLoading,
    searchError,
    clearSearch,
    hasCachedResults,
  };
};

export default useExploreSearch;

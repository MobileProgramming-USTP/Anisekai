import { JIKAN_API_URL } from "../explore/constants";
import { fetchJsonWithRetry } from "../explore/utils/api";
import { resolvePreferredTitle } from "../utils/resolveTitle";

const FALLBACK_LIMIT = 20;
const JIKAN_WATCH_EPISODES_MAX_LIMIT = 25;
const MAX_METADATA_REQUESTS_PER_RUN = 5;
const RATE_LIMIT_COOLDOWN_MS = 60 * 1000;

const metadataCache = new Map();
let lastRateLimitTimestamp = 0;
let hasLoggedRateLimit = false;

const resolveEpisodeImage = (entry, episode) =>
  episode?.images?.jpg?.large_image_url ||
  episode?.images?.jpg?.image_url ||
  episode?.images?.webp?.large_image_url ||
  episode?.images?.webp?.image_url ||
  entry?.images?.jpg?.large_image_url ||
  entry?.images?.jpg?.image_url ||
  entry?.images?.webp?.large_image_url ||
  entry?.images?.webp?.image_url ||
  null;

const parseEpisodeTimestamp = (episode) => {
  if (!episode) {
    return null;
  }

  const candidates = [episode.aired, episode.released, episode.premium_since];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Date.parse(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  if (typeof episode.aired === "number" && Number.isFinite(episode.aired)) {
    return episode.aired;
  }

  return null;
};

const findMostRecentEpisode = (episodes = []) => {
  if (!Array.isArray(episodes) || episodes.length === 0) {
    return null;
  }

  return episodes
    .slice()
    .sort((a, b) => (parseEpisodeTimestamp(b) ?? 0) - (parseEpisodeTimestamp(a) ?? 0))
    .at(0);
};

const normalizeGenres = (genres) =>
  Array.isArray(genres)
    ? genres
        .map((genre) => {
          if (typeof genre === "string") {
            return genre.trim();
          }
          if (typeof genre?.name === "string") {
            return genre.name.trim();
          }
          return "";
        })
        .filter(Boolean)
    : [];

const createFallbackMetadata = (entry) => ({
  title: resolvePreferredTitle(entry) || null,
  genres: normalizeGenres(entry?.genres),
});

const isRateLimitError = (error) => {
  if (typeof error?.status === "number") {
    return error.status === 429;
  }

  if (typeof error?.response?.status === "number") {
    return error.response.status === 429;
  }

  return typeof error?.message === "string" && error.message.includes("429");
};

const shouldSkipNetworkRequests = () => Date.now() - lastRateLimitTimestamp < RATE_LIMIT_COOLDOWN_MS;

const markRateLimit = () => {
  lastRateLimitTimestamp = Date.now();
  if (!hasLoggedRateLimit) {
    console.warn(
      "Jikan rate limit hit while fetching episode metadata. Falling back to basic entry information for now."
    );
    hasLoggedRateLimit = true;
  }
};

const resetRateLimitWarningIfNeeded = () => {
  if (!shouldSkipNetworkRequests()) {
    hasLoggedRateLimit = false;
  }
};

const buildEntryMetadataMap = async (entries = []) => {
  const validEntries = Array.isArray(entries)
    ? entries.filter((entry) => entry?.mal_id && Number.isFinite(entry.mal_id))
    : [];

  if (!validEntries.length) {
    return new Map();
  }

  resetRateLimitWarningIfNeeded();

  // Remove duplicate mal_id occurrences to avoid redundant requests.
  const uniqueEntries = Array.from(
    new Map(validEntries.map((entry) => [entry.mal_id, entry])).values()
  );

  const result = new Map();
  const entriesToFetch = [];
  const skipNetwork = shouldSkipNetworkRequests();

  for (const entry of uniqueEntries) {
    const malId = entry.mal_id;
    const cached = metadataCache.get(malId);

    if (cached) {
      result.set(malId, cached);
      continue;
    }

    const fallback = createFallbackMetadata(entry);
    result.set(malId, fallback);

    if (!skipNetwork && entriesToFetch.length < MAX_METADATA_REQUESTS_PER_RUN) {
      entriesToFetch.push({ entry, fallback });
    }
  }

  for (const { entry, fallback } of entriesToFetch) {
    const malId = entry.mal_id;

    try {
      const details = await fetchJsonWithRetry(`${JIKAN_API_URL}/anime/${malId}`);
      const data = details?.data;
      const displayTitle = resolvePreferredTitle(data, fallback.title);
      const genres = normalizeGenres(data?.genres);

      const metadata = {
        title: displayTitle || fallback.title,
        genres: genres.length ? genres : fallback.genres,
      };

      metadataCache.set(malId, metadata);
      result.set(malId, metadata);
    } catch (error) {
      metadataCache.set(malId, fallback);
      result.set(malId, fallback);

      if (isRateLimitError(error)) {
        markRateLimit();
        break;
      }

      console.warn(`Failed to fetch metadata for mal_id ${malId}`, error);
    }
  }

  return result;
};

const normalizeTotal = (value) => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const numeric = Number(value.trim().replace(/[^0-9.]+/g, ""));
    if (Number.isFinite(numeric) && numeric > 0) {
      return numeric;
    }
  }

  return null;
};

const normalizeLatestEpisodes = (payload = [], metadataLookup = new Map()) =>
  payload
    .map((item) => {
      if (!item) {
        return null;
      }

      const entry = item.entry ?? {};
      const latestEpisode = findMostRecentEpisode(item.episodes);
      const coverImage = resolveEpisodeImage(entry, latestEpisode);

      const rawEpisodeNumber = latestEpisode?.episode;
      const episodeNumber =
        typeof rawEpisodeNumber === "number" && Number.isFinite(rawEpisodeNumber)
          ? rawEpisodeNumber
          : Number.isFinite(latestEpisode?.mal_id)
            ? latestEpisode.mal_id
            : null;

      const totalEpisodesValue = normalizeTotal(entry?.episodes);
      const airedEpisodesValue = normalizeTotal(entry?.episodes_aired);
      const totalEpisodesRaw = totalEpisodesValue ?? airedEpisodesValue ?? null;

      const releaseTimestamp = parseEpisodeTimestamp(latestEpisode);
      const releaseDateIso =
        typeof latestEpisode?.aired === "string" && latestEpisode.aired.trim()
          ? latestEpisode.aired
          : typeof latestEpisode?.released === "string" && latestEpisode.released.trim()
            ? latestEpisode.released
            : releaseTimestamp
              ? new Date(releaseTimestamp).toISOString()
              : null;

      const id =
        entry?.mal_id ??
        latestEpisode?.mal_id ??
        `${entry?.title ?? "episode"}-${episodeNumber ?? Math.random().toString(36).slice(2)}`;

      const fallbackTitle =
        typeof latestEpisode?.title === "string" ? latestEpisode.title.trim() : undefined;
      const metadata = entry?.mal_id ? metadataLookup.get(entry.mal_id) : undefined;
      const displayTitle =
        (typeof metadata?.title === "string" && metadata.title.trim()) ??
        resolvePreferredTitle(
          entry,
          resolvePreferredTitle(latestEpisode, fallbackTitle || "Untitled")
        );

      const genres =
        (Array.isArray(metadata?.genres) && metadata.genres.length
          ? metadata.genres
          : normalizeGenres(entry?.genres)) ?? [];

      if (!displayTitle) {
        return null;
      }

      return {
        id,
        title: displayTitle,
        episodeNumber,
        totalEpisodes: totalEpisodesRaw,
        coverImage,
        releaseDate: releaseDateIso,
        releasedAt: releaseTimestamp,
        streamingUrl: typeof latestEpisode?.url === "string" ? latestEpisode.url : null,
        entryMalId: entry?.mal_id ?? null,
        episodeTitle: fallbackTitle ?? null,
        genres,
      };
    })
    .filter(Boolean);

export const fetchLatestStreamingEpisodes = async ({
  limit = FALLBACK_LIMIT,
  signal,
} = {}) => {
  const normalizedLimit = Math.max(1, Math.min(limit || FALLBACK_LIMIT, JIKAN_WATCH_EPISODES_MAX_LIMIT));

  const endpoint = `${JIKAN_API_URL}/watch/episodes?limit=${encodeURIComponent(String(normalizedLimit))}`;

  const response = await fetchJsonWithRetry(endpoint, {
    signal,
    retries: 3,
    backoff: 800,
  });

  const rawData = Array.isArray(response?.data) ? response.data : [];
  const trimmedData = rawData.slice(0, normalizedLimit);

  const metadataLookup = await buildEntryMetadataMap(trimmedData.map((item) => item?.entry).filter(Boolean));
  const normalizedEpisodes = normalizeLatestEpisodes(trimmedData, metadataLookup);

  return normalizedEpisodes
    .sort((a, b) => (b.releasedAt ?? 0) - (a.releasedAt ?? 0))
    .slice(0, normalizedLimit);
};

export default fetchLatestStreamingEpisodes;

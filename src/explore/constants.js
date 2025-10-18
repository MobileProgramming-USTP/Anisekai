const DEFAULT_JIKAN_API_URL = 'https://api.jikan.moe/v4';
export const JIKAN_API_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_JIKAN_API_URL?.trim()) ||
  DEFAULT_JIKAN_API_URL;

export const SCOPE_VALUES = {
  ANIME: 'anime',
  MANGA: 'manga',
  CHARACTERS: 'characters',
  USERS: 'users',
};

export const SCOPE_OPTIONS = [
  { label: 'Anime', value: SCOPE_VALUES.ANIME },
  { label: 'Manga', value: SCOPE_VALUES.MANGA },
  { label: 'Characters', value: SCOPE_VALUES.CHARACTERS },
  { label: 'Users', value: SCOPE_VALUES.USERS },
];

export const SEARCH_SETTINGS = {
  CACHE_TTL_MS: 5 * 60 * 1000,
  DEBOUNCE_MS: 180,
  MAX_CACHE_ENTRIES: 40,
  MIN_PREFIX_CACHE_LENGTH: 3,
};

export const RANK_BADGE_COLORS = [
  '#C7E9F1',
  '#F9D7E9',
  '#DDE7C7',
  '#FFE5B9',
  '#E5D1FF',
  '#FDE7D7',
  '#D0E8FC',
  '#F8D6D0',
  '#E0F2E9',
  '#F1D4F4',
];

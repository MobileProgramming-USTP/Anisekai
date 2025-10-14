import { memo } from 'react';

export const ANIME_SECTION_KEYS = {
  TRENDING: 'TRENDING',
  SEASON: 'SEASON',
  UPCOMING: 'UPCOMING',
  ALL_TIME: 'ALL_TIME',
};

export const ANIME_SECTION_CONFIG = [
  {
    key: ANIME_SECTION_KEYS.TRENDING,
    title: 'TRENDING NOW',
    endpoint: '/top/anime?filter=airing&limit=24',
    previewVariant: 'carousel',
    previewCount: 10,
    viewAllLimit: 25,
  },
  {
    key: ANIME_SECTION_KEYS.SEASON,
    title: 'POPULAR THIS SEASON',
    endpoint: '/seasons/now?limit=24',
    previewVariant: 'carousel',
    previewCount: 10,
    viewAllLimit: 25,
  },
  {
    key: ANIME_SECTION_KEYS.UPCOMING,
    title: 'UPCOMING ANIMES',
    endpoint: '/seasons/upcoming?limit=24',
    previewVariant: 'carousel',
    previewCount: 10,
    viewAllLimit: 25,
  },
  {
    key: ANIME_SECTION_KEYS.ALL_TIME,
    title: 'ALL TIME POPULAR',
    endpoint: '/top/anime?limit=24',
    previewVariant: 'carousel',
    previewCount: 10,
    viewAllLimit: 25,
  },
];

const AnimeSections = memo(function AnimeSections({ renderSection, viewAllKey = null }) {
  if (typeof renderSection !== 'function') {
    return null;
  }

  const sections = viewAllKey
    ? ANIME_SECTION_CONFIG.filter((section) => section.key === viewAllKey)
    : ANIME_SECTION_CONFIG;

  return sections.map((section) => renderSection(section));
});

export default AnimeSections;

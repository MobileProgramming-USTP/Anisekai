import { memo } from 'react';

export const MANGA_SECTION_KEYS = {
  TRENDING: 'MANGA_TRENDING',
  ALL_TIME: 'MANGA_ALL_TIME',
  TOP_100: 'MANGA_TOP_100',
};

export const MANGA_SECTION_CONFIG = [
  {
    key: MANGA_SECTION_KEYS.TRENDING,
    title: 'TRENDING NOW',
    endpoint: '/top/manga?filter=publishing&limit=24',
    previewVariant: 'carousel',
    previewCount: 10,
  },
  {
    key: MANGA_SECTION_KEYS.ALL_TIME,
    title: 'ALL TIME POPULAR',
    endpoint: '/top/manga?limit=24',
    previewVariant: 'carousel',
    previewCount: 10,
  },
  {
    key: MANGA_SECTION_KEYS.TOP_100,
    title: 'TOP 100 MANGA',
    endpoint: '/top/manga?limit=25',
    pages: 4,
    maxItems: 100,
    previewVariant: 'carousel',
    previewCount: 10,
  },
];

const MangaSections = memo(function MangaSections({ renderSection }) {
  if (typeof renderSection !== 'function') {
    return null;
  }

  return MANGA_SECTION_CONFIG.map((section) => renderSection(section));
});

export default MangaSections;

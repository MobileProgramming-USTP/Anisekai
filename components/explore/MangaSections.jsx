import { memo } from 'react';

export const MANGA_SECTION_KEYS = {
  TRENDING: 'MANGA_TRENDING',
  MANHWA: 'MANGA_MANHWA',
  TOP_100: 'MANGA_TOP_100',
};

export const MANGA_SECTION_CONFIG = [
  {
    key: MANGA_SECTION_KEYS.TRENDING,
    title: 'TRENDING NOW',
    endpoint: '/top/manga?filter=publishing&limit=24',
    previewVariant: 'carousel',
    previewCount: 10,
    viewAllLimit: 25,
  },
  {
    key: MANGA_SECTION_KEYS.MANHWA,
    title: 'TOP MANHWA',
    endpoint: '/top/manga?type=manhwa&limit=24',
    previewVariant: 'carousel',
    previewCount: 10,
    viewAllLimit: 25,
  },
  {
    key: MANGA_SECTION_KEYS.TOP_100,
    title: 'TOP 100 MANGA',
    endpoint: '/top/manga?limit=25',
    pages: 4,
    maxItems: 100,
    previewVariant: 'carousel',
    previewCount: 10,
    viewAllLimit: 100,
    showRankBadge: true,
  },
];

const MangaSections = memo(function MangaSections({ renderSection, viewAllKey = null }) {
  if (typeof renderSection !== 'function') {
    return null;
  }

  const sections = viewAllKey
    ? MANGA_SECTION_CONFIG.filter((section) => section.key === viewAllKey)
    : MANGA_SECTION_CONFIG;

  return sections.map((section) => renderSection(section));
});

export default MangaSections;

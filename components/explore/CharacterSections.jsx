import { memo } from 'react';

export const CHARACTER_SECTION_KEYS = {
  FAVORITES: 'CHARACTER_FAVORITES',
  POPULAR: 'CHARACTER_POPULAR',
};

export const CHARACTER_SECTION_CONFIG = [
  {
    key: CHARACTER_SECTION_KEYS.FAVORITES,
    title: 'MOST FAVORITE CHARACTERS',
    endpoint: '/top/characters?limit=24',
    previewVariant: 'grid',
    previewCount: 8,
    viewAllLimit: 24,
  },
  {
    key: CHARACTER_SECTION_KEYS.POPULAR,
    title: 'FAN FAVORITES',
    endpoint: '/top/characters?limit=24&page=2',
    previewVariant: 'grid',
    previewCount: 8,
    viewAllLimit: 24,
  },
];

const CharacterSections = memo(function CharacterSections({ renderSection, viewAllKey = null }) {
  if (typeof renderSection !== 'function') {
    return null;
  }

  const sections = viewAllKey
    ? CHARACTER_SECTION_CONFIG.filter((section) => section.key === viewAllKey)
    : CHARACTER_SECTION_CONFIG;

  return sections.map((section) => renderSection(section));
});

export default CharacterSections;

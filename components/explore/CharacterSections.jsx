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
  },
  {
    key: CHARACTER_SECTION_KEYS.POPULAR,
    title: 'FAN FAVORITES',
    endpoint: '/top/characters?limit=24&page=2',
    previewVariant: 'grid',
    previewCount: 8,
  },
];

const CharacterSections = memo(function CharacterSections({ renderSection }) {
  if (typeof renderSection !== 'function') {
    return null;
  }

  return CHARACTER_SECTION_CONFIG.map((section) => renderSection(section));
});

export default CharacterSections;

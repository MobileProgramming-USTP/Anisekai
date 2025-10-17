export const resolvePreferredTitle = (media, fallback = 'Untitled') => {
  if (!media) {
    return fallback;
  }

  const normalize = (value) => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length ? trimmed : null;
    }
    return null;
  };

  const pickFromTitlesArray = (titles, matcher) => {
    if (!Array.isArray(titles)) {
      return null;
    }
    for (const entry of titles) {
      const candidate = normalize(entry?.title);
      if (!candidate) {
        continue;
      }
      if (!matcher || matcher(entry)) {
        return candidate;
      }
    }
    return null;
  };

  const fromObject = (object, keys = []) => {
    if (!object) {
      return null;
    }
    for (const key of keys) {
      const value = normalize(object?.[key]);
      if (value) {
        return value;
      }
    }
    return null;
  };

  const englishKeys = [
    'title_english',
    'titleEnglish',
    'english',
    'name_english',
    'english_title',
  ];
  const fallbackKeys = [
    'title',
    'name',
    'title_romaji',
    'title_japanese',
    'titleJapanese',
    'original_title',
    'username',
  ];

  const englishTitle =
    fromObject(media, englishKeys) ||
    normalize(media?.alternative_titles?.en) ||
    normalize(media?.alternativeTitles?.en);

  if (englishTitle) {
    return englishTitle;
  }

  const titlesArrayEnglish = pickFromTitlesArray(media?.titles, (entry) => {
    const type = typeof entry?.type === 'string' ? entry.type.toLowerCase() : '';
    return type === 'english';
  });

  if (titlesArrayEnglish) {
    return titlesArrayEnglish;
  }

  const fallbackTitle =
    fromObject(media, fallbackKeys) ||
    pickFromTitlesArray(media?.titles) ||
    normalize(media?.alternative_titles?.synonyms?.[0]) ||
    normalize(media?.alternativeTitles?.synonyms?.[0]);

  return fallbackTitle || fallback;
};

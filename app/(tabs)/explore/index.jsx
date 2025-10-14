import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import AnimeSections, { ANIME_SECTION_CONFIG } from '../../../components/explore/AnimeSections';
import MangaSections, { MANGA_SECTION_CONFIG } from '../../../components/explore/MangaSections';
import CharacterSections, { CHARACTER_SECTION_CONFIG } from '../../../components/explore/CharacterSections';
import UserSections, { USER_SECTION_CONFIG } from '../../../components/explore/UserSections';

const JIKAN_API_URL = 'https://api.jikan.moe/v4';

const SCOPE_VALUES = {
  ANIME: 'anime',
  MANGA: 'manga',
  CHARACTERS: 'characters',
  USERS: 'users',
};

const SCOPE_OPTIONS = [
  { label: 'Anime', value: SCOPE_VALUES.ANIME },
  { label: 'Manga', value: SCOPE_VALUES.MANGA },
  { label: 'Characters', value: SCOPE_VALUES.CHARACTERS },
  { label: 'Users', value: SCOPE_VALUES.USERS },
];

const SECTION_CONFIG = {
  [SCOPE_VALUES.ANIME]: ANIME_SECTION_CONFIG,
  [SCOPE_VALUES.MANGA]: MANGA_SECTION_CONFIG,
  [SCOPE_VALUES.CHARACTERS]: CHARACTER_SECTION_CONFIG,
  [SCOPE_VALUES.USERS]: USER_SECTION_CONFIG,
};

const SCOPE_SECTION_COMPONENTS = {
  [SCOPE_VALUES.ANIME]: AnimeSections,
  [SCOPE_VALUES.MANGA]: MangaSections,
  [SCOPE_VALUES.CHARACTERS]: CharacterSections,
  [SCOPE_VALUES.USERS]: UserSections,
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const resolveSectionEndpoint = (section, page) => {
  const { endpoint } = section;
  if (typeof endpoint === 'function') {
    return endpoint(page);
  }

  if (typeof endpoint !== 'string' || endpoint.length === 0) {
    return null;
  }

  if (endpoint.includes('{{page}}')) {
    return endpoint.replace('{{page}}', page);
  }

  if (page === 1) {
    return endpoint;
  }

  if (/[?&]page=\d+/.test(endpoint)) {
    return endpoint.replace(/page=\d+/i, `page=${page}`);
  }

  const separator = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${separator}page=${page}`;
};

const fetchJsonWithRetry = async (
  url,
  { retries = 2, backoff = 600, signal, ...fetchOptions } = {}
) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, { signal, ...fetchOptions });

      if (response.ok) {
        return response.json();
      }

      const shouldRetry =
        attempt < retries && (response.status === 429 || response.status >= 500);

      if (!shouldRetry) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const retryAfterHeader = response.headers?.get?.('Retry-After');
      const waitMs = retryAfterHeader
        ? Number(retryAfterHeader) * 1000
        : backoff * (attempt + 1);

      await delay(waitMs);
    } catch (error) {
      if (error.name === 'AbortError') {
        throw error;
      }

      if (attempt >= retries) {
        throw error;
      }

      await delay(backoff * (attempt + 1));
    }
  }

  throw new Error('Unable to complete request');
};

const getItemKey = (item, index, prefix = 'item') => {
  if (item?.mal_id != null) {
    return item.mal_id.toString();
  }
  if (item?.username) {
    return `user-${item.username}`;
  }
  if (item?.name) {
    return `name-${item.name}-${index}`;
  }
  return `${prefix}-${index}`;
};

const MediaCard = ({ item, onSelect, variant = 'carousel' }) => {
  const title = item?.title || item?.name || item?.username || 'Untitled';
  const imageUrl =
    item?.images?.jpg?.large_image_url ||
    item?.images?.jpg?.image_url ||
    item?.images?.webp?.image_url ||
    item?.images?.jpg?.small_image_url ||
    item?.image_url ||
    item?.avatar_url;
  const cardStyle =
    variant === 'grid'
      ? styles.gridCard
      : variant === 'user'
      ? styles.userCard
      : styles.card;
  const imageStyle =
    variant === 'grid'
      ? styles.gridCardImage
      : variant === 'user'
      ? styles.userCardImage
      : styles.cardImage;
  const handlePress = () => {
    if (onSelect) {
      onSelect(item);
    }
  };

  return (
    <Pressable
      style={cardStyle}
      onPress={handlePress}
      hitSlop={4}
      disabled={!onSelect}
    >
      {imageUrl ? (
        <ExpoImage
          source={{ uri: imageUrl }}
          style={imageStyle}
          contentFit="cover"
          transition={180}
          cachePolicy="memory-disk"
        />
      ) : (
        <View style={[imageStyle, styles.cardImageFallback]}>
          <Ionicons name="image-outline" size={28} color="#6f7a89" />
        </View>
      )}
      <Text style={styles.cardText} numberOfLines={2}>
        {title}
      </Text>
    </Pressable>
  );
};

const ExploreScreen = () => {
  const [sectionsData, setSectionsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeScope, setActiveScope] = useState(SCOPE_VALUES.ANIME);
  const [scopeMenuOpen, setScopeMenuOpen] = useState(false);

  const [selectedAnime, setSelectedAnime] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const [viewAllSection, setViewAllSection] = useState(null);
  const [genrePickerOpen, setGenrePickerOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [libraryEntries, setLibraryEntries] = useState({});
  const requestIdRef = useRef(0);
  const detailAbortRef = useRef(null);
  const detailTimeoutRef = useRef(null);

  const activeScopeLabel = useMemo(
    () => SCOPE_OPTIONS.find((option) => option.value === activeScope)?.label ?? 'Anime',
    [activeScope]
  );

  const handleToggleViewAll = (sectionKey) => {
    setViewAllSection((prev) => (prev === sectionKey ? null : sectionKey));
  };

  const handleGenreSelect = (genreName) => {
    setSelectedGenre(genreName || null);
    setViewAllSection(null);
  };

  const closeScopeMenu = () => setScopeMenuOpen(false);

  const handleScopeChange = (nextScope) => {
    setActiveScope(nextScope);
    closeScopeMenu();
    setSectionsData({});
    setSelectedAnime(null);
    setDetailError(null);
    setViewAllSection(null);
    setGenrePickerOpen(false);
    setSelectedGenre(null);
    setSearchQuery('');
    setSearchResults([]);
    setSearchLoading(false);
    setSearchError(null);
    setError(null);
  };

  const handleBackToBrowse = () => {
    requestIdRef.current += 1;
    if (detailAbortRef.current) {
      detailAbortRef.current.abort();
      detailAbortRef.current = null;
    }
    if (detailTimeoutRef.current) {
      clearTimeout(detailTimeoutRef.current);
      detailTimeoutRef.current = null;
    }
    setSelectedAnime(null);
    setDetailLoading(false);
    setDetailError(null);
    setGenrePickerOpen(false);
    closeScopeMenu();
  };

  const handleSelectAnime = async (item) => {
    if (!item?.mal_id) {
      return;
    }

    try {
      const currentRequestId = requestIdRef.current + 1;
      requestIdRef.current = currentRequestId;
      if (detailAbortRef.current) {
        detailAbortRef.current.abort();
      }
      if (detailTimeoutRef.current) {
        clearTimeout(detailTimeoutRef.current);
        detailTimeoutRef.current = null;
      }
      const controller = new AbortController();
      detailAbortRef.current = controller;
      detailTimeoutRef.current = setTimeout(() => {
        if (detailAbortRef.current === controller) {
          controller.abort();
        }
      }, 10000);
      setDetailLoading(true);
      setDetailError(null);
      setSelectedAnime({ ...item });
      setViewAllSection(null);
      setGenrePickerOpen(false);

      const data = await fetchJsonWithRetry(`${JIKAN_API_URL}/anime/${item.mal_id}/full`, {
        retries: 3,
        signal: controller.signal,
      });
      if (requestIdRef.current === currentRequestId) {
        setSelectedAnime(data.data);
      }
    } catch (e) {
      if (requestIdRef.current === currentRequestId) {
        const friendlyMessage =
          e?.name === 'AbortError'
            ? 'Request canceled. Please try again.'
            : typeof e?.message === 'string' && e.message.includes('429')
            ? 'Rate limit reached. Please try again shortly.'
            : 'Failed to load details.';
        setDetailError(friendlyMessage);
        console.error(e);
      }
    } finally {
      if (requestIdRef.current === currentRequestId) {
        if (detailTimeoutRef.current) {
          clearTimeout(detailTimeoutRef.current);
          detailTimeoutRef.current = null;
        }
        if (detailAbortRef.current) {
          detailAbortRef.current = null;
        }
        setDetailLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!selectedAnime && !detailLoading && !detailError) {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBackToBrowse();
      return true;
    });

    return () => {
      subscription.remove();
    };
  }, [selectedAnime, detailLoading, detailError]);

  useEffect(() => {
    if (!viewAllSection || selectedAnime) {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setViewAllSection(null);
      return true;
    });

    return () => {
      subscription.remove();
    };
  }, [viewAllSection, selectedAnime]);

  useEffect(() => {
    let isCancelled = false;
    const sections = SECTION_CONFIG[activeScope] ?? [];

    const fetchScopeSections = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!isCancelled) {
          setSectionsData({});
        }

        if (sections.length === 0) {
          return;
        }

        const nextData = {};

        for (let index = 0; index < sections.length; index += 1) {
          const section = sections[index];
          const totalPages = Math.max(1, Number(section.pages) || 1);
          let aggregated = [];

          for (let page = 1; page <= totalPages; page += 1) {
            const endpointPath = resolveSectionEndpoint(section, page);
            if (!endpointPath) {
              continue;
            }

            const response = await fetchJsonWithRetry(
              `${JIKAN_API_URL}${endpointPath}`,
              { retries: 3 }
            );
            const pageData = Array.isArray(response?.data) ? response.data : [];

            aggregated =
              page === 1 ? pageData : aggregated.concat(pageData);

            if (page < totalPages) {
              await delay(120);
            }
          }

          const maxItems = Number(section.maxItems);
          if (Number.isFinite(maxItems) && maxItems > 0) {
            aggregated = aggregated.slice(0, maxItems);
          }

          nextData[section.key] = aggregated;
          if (index < sections.length - 1) {
            await delay(150);
          }
        }

        if (!isCancelled) {
          setSectionsData(nextData);
        }
      } catch (e) {
        if (!isCancelled) {
          const friendlyMessage =
            typeof e?.message === 'string' && e.message.includes('429')
              ? 'Jikan rate limit reached. Please try again shortly.'
              : 'Failed to fetch data from Jikan API.';
          setError(friendlyMessage);
          console.error(e);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchScopeSections();

    return () => {
      isCancelled = true;
    };
  }, [activeScope]);

  const buildSearchUrl = (scope, query) => {
    const encoded = encodeURIComponent(query);
    switch (scope) {
      case SCOPE_VALUES.ANIME:
        return `${JIKAN_API_URL}/anime?q=${encoded}&limit=20`;
      case SCOPE_VALUES.MANGA:
        return `${JIKAN_API_URL}/manga?q=${encoded}&limit=20`;
      case SCOPE_VALUES.CHARACTERS:
        return `${JIKAN_API_URL}/characters?q=${encoded}&limit=20`;
      case SCOPE_VALUES.USERS:
        return `${JIKAN_API_URL}/users?q=${encoded}&limit=20`;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchError(null);
      setSearchLoading(false);
      return;
    }

    const url = buildSearchUrl(activeScope, searchQuery);
    if (!url) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setSearchLoading(true);
        setSearchError(null);

        const data = await fetchJsonWithRetry(url, {
          signal: controller.signal,
          retries: 1,
          backoff: 800,
        });
        setSearchResults(data?.data ?? []);
      } catch (e) {
        if (e.name !== 'AbortError') {
          setSearchError(`Failed to search ${activeScopeLabel.toLowerCase()}.`);
          console.error(e);
        }
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [searchQuery, activeScope, activeScopeLabel]);

  const sectionsConfig = useMemo(
    () => SECTION_CONFIG[activeScope] ?? [],
    [activeScope]
  );

  const activeViewAllConfig = useMemo(
    () => sectionsConfig.find((section) => section.key === viewAllSection) ?? null,
    [sectionsConfig, viewAllSection]
  );

  const ScopeSectionComponent = SCOPE_SECTION_COMPONENTS[activeScope] ?? null;
  const supportsGenreFilter =
    activeScope === SCOPE_VALUES.ANIME || activeScope === SCOPE_VALUES.MANGA;

  const genreOptions = useMemo(() => {
    if (!supportsGenreFilter) {
      return [];
    }

    const genreSet = new Set();

    Object.values(sectionsData).forEach((list) => {
      list?.forEach((entry) => {
        entry?.genres?.forEach((genre) => {
          if (genre?.name) {
            genreSet.add(genre.name);
          }
        });
      });
    });

    return Array.from(genreSet).sort((a, b) => a.localeCompare(b));
  }, [sectionsData, supportsGenreFilter]);

  const filteredSections = useMemo(() => {
    if (!supportsGenreFilter || !selectedGenre) {
      return sectionsData;
    }

    const matchSelectedGenre = (entry) => {
      const selectedLower = selectedGenre.toLowerCase();
      return entry?.genres?.some(
        (genre) => genre?.name?.toLowerCase() === selectedLower
      );
    };

    return Object.keys(sectionsData).reduce((acc, key) => {
      const list = sectionsData[key];
      acc[key] = Array.isArray(list) ? list.filter(matchSelectedGenre) : list;
      return acc;
    }, {});
  }, [sectionsData, selectedGenre, supportsGenreFilter]);

  const filteredSearchResults = useMemo(() => {
    if (!supportsGenreFilter || !selectedGenre) {
      return searchResults;
    }

    const selectedLower = selectedGenre.toLowerCase();
    return searchResults.filter((entry) =>
      entry?.genres?.some(
        (genre) => genre?.name?.toLowerCase() === selectedLower
      )
    );
  }, [searchResults, selectedGenre, supportsGenreFilter]);

  const sectionGenreMatches = useMemo(() => {
    if (!supportsGenreFilter) {
      return 0;
    }

    return Object.values(filteredSections).reduce(
      (acc, list) => acc + (Array.isArray(list) ? list.length : 0),
      0
    );
  }, [filteredSections, supportsGenreFilter]);

  useEffect(() => {
    if (!viewAllSection) return;

    const selectedSectionLength = filteredSections?.[viewAllSection]?.length ?? 0;

    if (selectedSectionLength === 0) {
      setViewAllSection(null);
    }
  }, [viewAllSection, filteredSections]);

  const renderSection = (section) => {
    if (!section) {
      return null;
    }

    const {
      key,
      title,
      previewVariant = 'carousel',
      previewCount = 10,
      viewAllLimit,
    } = section;

    const data = filteredSections?.[key];

    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const showingAll = viewAllSection === key;
    const previewVisibleCount = previewCount ?? (previewVariant === 'grid' ? 6 : 10);
    const effectiveViewAllLimit = Math.min(viewAllLimit ?? 25, data.length);
    const useGrid = showingAll || previewVariant === 'grid';
    const visibleCount = showingAll
      ? effectiveViewAllLimit
      : Math.min(previewVisibleCount, data.length);
    const listData = data.slice(0, visibleCount);
    const listKey = useGrid ? `grid-${key}` : `carousel-${key}`;
    const cardVariant =
      activeScope === SCOPE_VALUES.USERS
        ? 'user'
        : useGrid
        ? 'grid'
        : 'carousel';
    const cardOnSelect = activeScope === SCOPE_VALUES.ANIME ? handleSelectAnime : undefined;

    const keyExtractor = (item, index) => getItemKey(item, index, key);

    const renderItem = ({ item }) => (
      <MediaCard item={item} onSelect={cardOnSelect} variant={cardVariant} />
    );

    return (
      <View style={styles.sectionContainer} key={key}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Pressable onPress={() => handleToggleViewAll(key)} hitSlop={8}>
            <Text style={styles.viewAllText}>{showingAll ? 'Back' : 'View All'}</Text>
          </Pressable>
        </View>

        {useGrid ? (
          <FlatList
            data={listData}
            key={listKey}
            numColumns={2}
            keyExtractor={keyExtractor}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.gridList}
            scrollEnabled={false}
            renderItem={renderItem}
          />
        ) : (
          <FlatList
            data={listData}
            key={listKey}
            keyExtractor={keyExtractor}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
            renderItem={renderItem}
          />
        )}
      </View>
    );
  };

  if (selectedAnime) {
    const coverImage =
      selectedAnime.images?.jpg?.large_image_url ||
      selectedAnime.images?.webp?.large_image_url ||
      selectedAnime.images?.jpg?.image_url;
    const studiosList =
      selectedAnime.studios?.map((studio) => studio.name).filter(Boolean) ?? [];
    const studiosText = studiosList.join(', ');
    const statusLabel = selectedAnime.status || 'Status Unknown';
    const episodesLabel =
      typeof selectedAnime.episodes === 'number'
        ? `${selectedAnime.episodes} episodes`
        : 'N/A episodes';
    const scoreLabel =
      typeof selectedAnime.score === 'number'
        ? `${selectedAnime.score.toFixed(1)} / 10`
        : 'Not rated';
    const synopsis = selectedAnime.synopsis?.trim() || 'No summary available.';
    const genres = Array.isArray(selectedAnime.genres) ? selectedAnime.genres : [];
    const isInLibrary = selectedAnime.mal_id
      ? Boolean(libraryEntries[selectedAnime.mal_id])
      : false;

    const handleToggleLibrary = () => {
      if (!selectedAnime.mal_id) return;
      setLibraryEntries((prev) => {
        const next = { ...prev };
        if (next[selectedAnime.mal_id]) {
          delete next[selectedAnime.mal_id];
        } else {
          next[selectedAnime.mal_id] = true;
        }
        return next;
      });
    };

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.detailScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.detailCard}>
          <View style={styles.detailCoverWrapper}>
            {coverImage ? (
              <ExpoImage
                source={{ uri: coverImage }}
                style={styles.detailCoverImage}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
            ) : (
              <View style={[styles.detailCoverImage, styles.cardImageFallback]}>
                <Ionicons name="image-outline" size={28} color="#6f7a89" />
              </View>
            )}
          </View>
          <View style={styles.detailHeaderInfo}>
            <Text style={styles.detailTitle}>{selectedAnime.title}</Text>

            <View style={styles.detailMetaRow}>
              <Ionicons name="tv-outline" size={18} color="#A5B2C2" />
              <Text style={styles.detailMetaText}>{statusLabel}</Text>
            </View>

            {studiosText ? (
              <View style={styles.detailMetaRow}>
                <Ionicons name="business-outline" size={18} color="#A5B2C2" />
                <Text style={styles.detailMetaText}>{studiosText}</Text>
              </View>
            ) : null}

            <View style={styles.detailMetaRow}>
              <Ionicons name="albums-outline" size={18} color="#A5B2C2" />
              <Text style={styles.detailMetaText}>{episodesLabel}</Text>
            </View>

            <View style={styles.detailMetaRow}>
              <Ionicons name="star-outline" size={18} color="#A5B2C2" />
              <Text style={styles.detailMetaText}>{scoreLabel}</Text>
            </View>

            <Pressable style={styles.detailMetaRow} onPress={handleToggleLibrary} hitSlop={8}>
              <Ionicons
                name={isInLibrary ? 'heart' : 'heart-outline'}
                size={20}
                color={isInLibrary ? '#f55f5f' : '#A5B2C2'}
              />
              <Text style={styles.detailMetaText}>
                {isInLibrary ? 'Added to Library' : 'Add to Library'}
              </Text>
            </Pressable>
          </View>
        </View>

        {detailError ? (
          <Text style={[styles.errorText, styles.detailInlineError]}>{detailError}</Text>
        ) : null}

        {genres.length > 0 && (
          <View style={styles.detailGenresSection}>
            <Text style={styles.detailSectionHeading}>Genres</Text>
            <View style={styles.detailGenresWrap}>
              {genres.map((genre, index) => (
                <View
                  key={getItemKey(genre, index, 'genre-detail')}
                  style={styles.detailGenreChip}
                >
                  <Text style={styles.detailGenreChipText}>{genre?.name || 'Unknown'}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.detailSummarySection}>
          <Text style={styles.detailSectionHeading}>Summary</Text>
          <Text style={styles.detailSummaryText}>{synopsis}</Text>
        </View>
      </ScrollView>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#fcbf49" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      onScrollBeginDrag={closeScopeMenu}
      onMomentumScrollBegin={closeScopeMenu}
    >
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Explore</Text>
        <View style={styles.scopeDropdownContainer}>
          <Pressable
            style={[
              styles.scopeButton,
              scopeMenuOpen && styles.scopeButtonActive,
            ]}
            onPress={() => setScopeMenuOpen((prev) => !prev)}
            hitSlop={8}
          >
            <Text style={styles.scopeButtonLabel}>{activeScopeLabel}</Text>
            <Ionicons
              name={scopeMenuOpen ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#A5B2C2"
            />
          </Pressable>
          {scopeMenuOpen && (
            <View style={styles.scopeMenu}>
              {SCOPE_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.scopeMenuItem,
                    option.value === activeScope && styles.scopeMenuItemActive,
                  ]}
                  onPress={() => handleScopeChange(option.value)}
                  hitSlop={6}
                >
                  <Text
                    style={[
                      styles.scopeMenuItemLabel,
                      option.value === activeScope && styles.scopeMenuItemLabelActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={18} color="#6f7a89" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={closeScopeMenu}
            placeholder="Search"
            placeholderTextColor="#6f7a89"
            style={styles.searchInput}
          />
        </View>
        {supportsGenreFilter && (
          <Pressable
            style={[
              styles.genreButton,
              (genrePickerOpen || selectedGenre) && styles.genreButtonActive,
            ]}
            onPress={() => setGenrePickerOpen((prev) => !prev)}
            hitSlop={8}
          >
            <Ionicons
              name="options"
              size={20}
              color={genrePickerOpen || selectedGenre ? '#fcbf49' : '#A5B2C2'}
            />
          </Pressable>
        )}
      </View>

      {supportsGenreFilter &&
        (genrePickerOpen || selectedGenre) &&
        genreOptions.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.genreChipsContainer}
          contentContainerStyle={styles.genreChipsContent}
        >
          <Pressable
            key="all-genres"
            style={[styles.genreChip, !selectedGenre && styles.genreChipActive]}
            onPress={() => handleGenreSelect(null)}
          >
            <Text
              style={[styles.genreChipText, !selectedGenre && styles.genreChipTextActive]}
            >
              All
            </Text>
          </Pressable>
          {genreOptions.map((genre) => {
            const active = selectedGenre === genre;
            return (
              <Pressable
                key={genre}
                style={[styles.genreChip, active && styles.genreChipActive]}
                onPress={() => handleGenreSelect(genre)}
              >
                <Text
                  style={[styles.genreChipText, active && styles.genreChipTextActive]}
                >
                  {genre}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {supportsGenreFilter &&
        selectedGenre &&
        sectionGenreMatches === 0 &&
        !searchQuery.trim() && (
          <Text style={[styles.emptyText, styles.genreEmptyText]}>
            No {activeScopeLabel.toLowerCase()} found for {selectedGenre}.
          </Text>
        )}

      {searchQuery.trim().length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>SEARCH RESULTS</Text>
            {filteredSearchResults.length > 0 && (
              <Text style={styles.searchCount}>{filteredSearchResults.length} found</Text>
            )}
          </View>
          {searchLoading ? (
            <ActivityIndicator size="small" color="#fcbf49" style={styles.searchLoader} />
          ) : searchError ? (
            <Text style={styles.errorText}>{searchError}</Text>
          ) : filteredSearchResults.length === 0 ? (
            <Text style={styles.emptyText}>
              No {activeScopeLabel.toLowerCase()} match that search.
            </Text>
          ) : (
              <FlatList
                data={filteredSearchResults.slice(
                  0,
                  supportsGenreFilter ? 10 : 12
                )}
              key="search-grid"
              numColumns={2}
              keyExtractor={(item, index) => getItemKey(item, index, 'search')}
              columnWrapperStyle={styles.gridRow}
              contentContainerStyle={styles.gridList}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <MediaCard
                  item={item}
                  onSelect={activeScope === SCOPE_VALUES.ANIME ? handleSelectAnime : undefined}
                  variant={activeScope === SCOPE_VALUES.USERS ? 'user' : 'grid'}
                />
              )}
            />
          )}
        </View>
      )}

      {ScopeSectionComponent ? (
        <ScopeSectionComponent
          renderSection={renderSection}
          viewAllKey={activeViewAllConfig?.key ?? null}
        />
      ) : (
        (activeViewAllConfig ? [activeViewAllConfig] : sectionsConfig).map((section) =>
          renderSection(section)
        )
      )}
    </ScrollView>
  );
};

export default ExploreScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1719',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  detailScrollContent: {
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  detailCard: {
    marginTop: 60,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailCoverWrapper: {
    width: 140,
    marginRight: 20,
  },
  detailCoverImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
  },
  detailHeaderInfo: {
    flex: 1,
  },
  detailTitle: {
    color: '#E7EDF5',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
  },
  detailMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailMetaText: {
    color: '#A5B2C2',
    fontSize: 15,
    marginLeft: 8,
    flexShrink: 1,
  },
  detailInlineSpinner: {
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  detailInlineError: {
    textAlign: 'left',
    paddingHorizontal: 0,
    marginTop: 16,
  },
  detailGenresSection: {
    marginTop: 28,
  },
  detailSectionHeading: {
    color: '#A5B2C2',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  detailGenresWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailGenreChip: {
    backgroundColor: '#1E2A3A',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
    marginBottom: 10,
  },
  detailGenreChipText: {
    color: '#E7EDF5',
    fontSize: 13,
    fontWeight: '600',
  },
  detailSummarySection: {
    marginTop: 28,
  },
  detailSummaryText: {
    color: '#E7EDF5',
    fontSize: 15,
    lineHeight: 22,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#E7EDF5',
  },
  scopeDropdownContainer: {
    marginLeft: 8,
    position: 'relative',
    alignSelf: 'flex-start',
    zIndex: 5,
  },
  scopeButton: {
    backgroundColor: '#16222E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  scopeButtonActive: {
    borderColor: '#fcbf49',
  },
  scopeButtonLabel: {
    color: '#E7EDF5',
    fontSize: 32,
    fontWeight: '800',
    marginRight: 6,
  },
  scopeMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 10,
    backgroundColor: '#1E2A3A',
    borderRadius: 12,
    paddingVertical: 6,
    minWidth: 160,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  scopeMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  scopeMenuItemActive: {
    backgroundColor: '#263445',
  },
  scopeMenuItemLabel: {
    color: '#A5B2C2',
    fontSize: 16,
    fontWeight: '600',
  },
  scopeMenuItemLabelActive: {
    color: '#fcbf49',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2A3A',
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#E7EDF5',
    fontSize: 16,
  },
  genreButton: {
    marginLeft: 12,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1E2A3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  genreButtonActive: {
    borderWidth: 1,
    borderColor: '#fcbf49',
  },
  genreChipsContainer: {
    paddingLeft: 20,
    marginTop: 12,
    marginBottom: 6,
  },
  genreChipsContent: {
    paddingRight: 20,
    alignItems: 'center',
  },
  genreChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E2A3A',
    marginRight: 12,
  },
  genreChipActive: {
    backgroundColor: '#fcbf49',
  },
  genreChipText: {
    color: '#A5B2C2',
    fontWeight: '600',
  },
  genreChipTextActive: {
    color: '#0F1719',
  },
  sectionContainer: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#A5B2C2',
  },
  viewAllText: {
    color: '#fcbf49',
    fontSize: 14,
    fontWeight: '600',
  },
  carouselContent: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  card: {
    width: 160,
    marginRight: 16,
  },
  cardImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#2a2a2a',
  },
  cardImageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    color: '#E7EDF5',
    fontWeight: '600',
    marginTop: 8,
  },
  gridList: {
    paddingHorizontal: 20,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  gridCard: {
    flex: 0.48,
    marginBottom: 16,
  },
  gridCardImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#2a2a2a',
  },
  userCard: {
    flex: 0.48,
    marginBottom: 16,
  },
  userCardImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#2a2a2a',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#6f7a89',
    fontSize: 15,
    paddingHorizontal: 20,
  },
  genreEmptyText: {
    marginTop: 12,
  },
  searchLoader: {
    marginTop: 12,
  },
  searchCount: {
    color: '#6f7a89',
    fontSize: 14,
  },
});

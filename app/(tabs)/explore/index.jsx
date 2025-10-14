import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const JIKAN_API_URL = 'https://api.jikan.moe/v4';

const SECTION_KEYS = {
  TRENDING: 'TRENDING',
  SEASON: 'SEASON',
  UPCOMING: 'UPCOMING',
  ALL_TIME: 'ALL_TIME',
};

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
  [SCOPE_VALUES.ANIME]: [
    {
      key: SECTION_KEYS.TRENDING,
      title: 'TRENDING NOW',
      endpoint: '/top/anime?filter=airing&limit=24',
      previewVariant: 'carousel',
      previewCount: 10,
    },
    {
      key: SECTION_KEYS.SEASON,
      title: 'POPULAR THIS SEASON',
      endpoint: '/seasons/now?limit=24',
      previewVariant: 'carousel',
      previewCount: 10,
    },
    {
      key: SECTION_KEYS.UPCOMING,
      title: 'UPCOMING ANIMES',
      endpoint: '/seasons/upcoming?limit=24',
      previewVariant: 'carousel',
      previewCount: 10,
    },
    {
      key: SECTION_KEYS.ALL_TIME,
      title: 'ALL TIME POPULAR',
      endpoint: '/top/anime?limit=24',
      previewVariant: 'carousel',
      previewCount: 10,
    },
  ],
  [SCOPE_VALUES.MANGA]: [
    {
      key: 'MANGA_TRENDING',
      title: 'TRENDING MANGA',
      endpoint: '/top/manga?filter=publishing&limit=24',
      previewVariant: 'carousel',
      previewCount: 10,
    },
    {
      key: 'MANGA_UPCOMING',
      title: 'UPCOMING MANGA',
      endpoint: '/top/manga?filter=upcoming&limit=24',
      previewVariant: 'carousel',
      previewCount: 10,
    },
    {
      key: 'MANGA_ALL_TIME',
      title: 'ALL TIME POPULAR MANGA',
      endpoint: '/top/manga?limit=24',
      previewVariant: 'carousel',
      previewCount: 10,
    },
  ],
  [SCOPE_VALUES.CHARACTERS]: [
    {
      key: 'CHARACTER_TOP',
      title: 'TOP CHARACTERS',
      endpoint: '/top/characters?limit=24',
      previewVariant: 'grid',
      previewCount: 8,
    },
    {
      key: 'CHARACTER_FAVORITES',
      title: 'FAN FAVORITES',
      endpoint: '/top/characters?limit=24&page=2',
      previewVariant: 'grid',
      previewCount: 8,
    },
  ],
  [SCOPE_VALUES.USERS]: [
    {
      key: 'USERS_RECENT',
      title: 'RECENTLY JOINED USERS',
      endpoint: '/users?order_by=joined&sort=desc&limit=24',
      previewVariant: 'grid',
      previewCount: 8,
    },
    {
      key: 'USERS_ACTIVE',
      title: 'RECENTLY ONLINE',
      endpoint: '/users?order_by=last_online&sort=desc&limit=24',
      previewVariant: 'grid',
      previewCount: 8,
    },
  ],
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
  const cardStyle = variant === 'grid' ? styles.gridCard : styles.card;
  const imageStyle = variant === 'grid' ? styles.gridCardImage : styles.cardImage;
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
        <Image source={{ uri: imageUrl }} style={imageStyle} />
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
    setSelectedAnime(null);
    setDetailError(null);
    setGenrePickerOpen(false);
    closeScopeMenu();
  };

  const handleSelectAnime = async (item) => {
    if (!item?.mal_id) {
      return;
    }

    try {
      setDetailLoading(true);
      setDetailError(null);
      setSelectedAnime(null);
      setViewAllSection(null);
      setGenrePickerOpen(false);

      const data = await fetchJsonWithRetry(`${JIKAN_API_URL}/anime/${item.mal_id}/full`, {
        retries: 3,
      });
      setSelectedAnime(data.data);
    } catch (e) {
      const friendlyMessage =
        typeof e?.message === 'string' && e.message.includes('429')
          ? 'Rate limit reached. Please try again shortly.'
          : 'Failed to load details.';
      setDetailError(friendlyMessage);
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

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
          const response = await fetchJsonWithRetry(
            `${JIKAN_API_URL}${section.endpoint}`,
            { retries: 3 }
          );
          nextData[section.key] = response?.data ?? [];
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

  const genreOptions = useMemo(() => {
    if (activeScope !== SCOPE_VALUES.ANIME) {
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
  }, [sectionsData, activeScope]);

  const filteredSections = useMemo(() => {
    if (activeScope !== SCOPE_VALUES.ANIME) {
      return sectionsData;
    }

    const filterList = (list) => {
      if (!selectedGenre) return list;
      return list?.filter((anime) =>
        anime.genres?.some(
          (genre) => genre?.name?.toLowerCase() === selectedGenre.toLowerCase()
        )
      );
    };

    return Object.keys(sectionsData).reduce((acc, key) => {
      acc[key] = filterList(sectionsData[key]);
      return acc;
    }, {});
  }, [sectionsData, selectedGenre, activeScope]);

  const filteredSearchResults = useMemo(() => {
    if (activeScope !== SCOPE_VALUES.ANIME || !selectedGenre) {
      return searchResults;
    }

    return searchResults.filter((entry) =>
      entry.genres?.some(
        (genre) => genre?.name?.toLowerCase() === selectedGenre.toLowerCase()
      )
    );
  }, [searchResults, selectedGenre, activeScope]);

  const sectionGenreMatches = useMemo(() => {
    if (activeScope !== SCOPE_VALUES.ANIME) {
      return 0;
    }

    return Object.values(filteredSections).reduce(
      (acc, list) => acc + (Array.isArray(list) ? list.length : 0),
      0
    );
  }, [filteredSections, activeScope]);

  useEffect(() => {
    if (!viewAllSection) return;

    const selectedSectionLength = filteredSections?.[viewAllSection]?.length ?? 0;

    if (selectedSectionLength === 0) {
      setViewAllSection(null);
    }
  }, [viewAllSection, filteredSections]);

  const renderSection = ({ key, title, previewVariant = 'carousel', previewCount = 10 }) => {
    const data = filteredSections?.[key];

    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const showingAll = viewAllSection === key;
    const useGrid = showingAll || previewVariant === 'grid';
    const visibleCount = previewCount ?? (useGrid ? 6 : 10);
    const listData = showingAll ? data : data.slice(0, visibleCount);
    const listKey = useGrid ? `grid-${key}` : `carousel-${key}`;
    const cardVariant = useGrid ? 'grid' : 'carousel';
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
            <Text style={styles.viewAllText}>{showingAll ? 'Show Less' : 'View All'}</Text>
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

  if (detailLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Pressable style={styles.backButton} onPress={handleBackToBrowse} hitSlop={8}>
          <Ionicons name="chevron-back" size={18} color="#A5B2C2" />
          <Text style={styles.backButtonText}>Back to Explore</Text>
        </Pressable>
        <ActivityIndicator size="large" color="#fcbf49" />
      </View>
    );
  }

  if (detailError) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Pressable style={styles.backButton} onPress={handleBackToBrowse} hitSlop={8}>
          <Ionicons name="chevron-back" size={18} color="#A5B2C2" />
          <Text style={styles.backButtonText}>Back to Explore</Text>
        </Pressable>
        <Text style={styles.errorText}>{detailError}</Text>
      </View>
    );
  }

  if (selectedAnime) {
    const bannerImage =
      selectedAnime.trailer?.images?.maximum_image_url || selectedAnime.images?.jpg?.large_image_url;
    const genres = selectedAnime.genres?.map((g) => g.name).join(', ') || 'N/A';

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.detailScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.backButton} onPress={handleBackToBrowse} hitSlop={8}>
          <Ionicons name="chevron-back" size={18} color="#A5B2C2" />
          <Text style={styles.backButtonText}>Back to Explore</Text>
        </Pressable>
        <Image source={{ uri: bannerImage }} style={styles.detailBannerImage} />
        <View style={styles.detailContent}>
          <Text style={styles.detailTitle}>{selectedAnime.title}</Text>
          <Text style={styles.detailMetaText}>Status: {selectedAnime.status}</Text>
          <Text style={styles.detailMetaText}>Episodes: {selectedAnime.episodes || 'N/A'}</Text>
          <Text style={styles.detailGenres}>Genres: {genres}</Text>
          <Text style={styles.detailDescription}>{selectedAnime.synopsis}</Text>
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
      onScrollBeginDrag={closeScopeMenu}
      onMomentumScrollBegin={closeScopeMenu}
      onTouchStart={() => {
        if (scopeMenuOpen) {
          closeScopeMenu();
        }
      }}
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
        {activeScope === SCOPE_VALUES.ANIME && (
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

      {activeScope === SCOPE_VALUES.ANIME &&
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

      {activeScope === SCOPE_VALUES.ANIME &&
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
                activeScope === SCOPE_VALUES.ANIME ? 10 : 12
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
                  variant="grid"
                />
              )}
            />
          )}
        </View>
      )}

      {sectionsConfig.map((section) => renderSection(section))}
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
    paddingBottom: 40,
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2A3A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginHorizontal: 20,
    marginTop: 40,
    marginBottom: 16,
  },
  backButtonText: {
    color: '#A5B2C2',
    fontWeight: '700',
    marginLeft: 6,
  },
  detailBannerImage: {
    width: '100%',
    height: 260,
    backgroundColor: '#1E2A3A',
  },
  detailContent: {
    padding: 20,
  },
  detailTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#E7EDF5',
    marginBottom: 12,
  },
  detailMetaText: {
    fontSize: 16,
    color: '#A5B2C2',
    marginBottom: 6,
  },
  detailGenres: {
    fontSize: 16,
    color: '#6f7a89',
    fontStyle: 'italic',
    marginTop: 6,
    marginBottom: 20,
  },
  detailDescription: {
    fontSize: 16,
    color: '#E7EDF5',
    lineHeight: 24,
  },
});

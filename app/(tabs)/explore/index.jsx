import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useLibrary } from '../../context/LibraryContext';
import styles from '../../../styles/exploreStyles';
import ExploreDetailView from '../../../src/explore/components/ExploreDetailView';
import MediaCard from '../../../src/explore/components/MediaCard';
import SearchResultsSection from '../../../src/explore/components/SearchResultsSection';
import {
  JIKAN_API_URL,
  RANK_BADGE_COLORS,
  SCOPE_OPTIONS,
  SCOPE_VALUES,
} from '../../../src/explore/constants';
import useExploreSearch from '../../../src/explore/hooks/useExploreSearch';
import { SECTION_CONFIG, SCOPE_SECTION_COMPONENTS } from '../../../src/explore/scopeConfig';
import { delay, fetchJsonWithRetry, resolveSectionEndpoint } from '../../../src/explore/utils/api';
import { getItemKey } from '../../../src/explore/utils/items';

const ExploreScreen = () => {
  const tabBarHeight = useBottomTabBarHeight();
  const bottomInset = useMemo(() => tabBarHeight + 32, [tabBarHeight]);
  const [sectionsData, setSectionsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeScope, setActiveScope] = useState(SCOPE_VALUES.ANIME);
  const [scopeMenuOpen, setScopeMenuOpen] = useState(false);

  const [selectedDetail, setSelectedDetail] = useState(null);
  const [selectedDetailScope, setSelectedDetailScope] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const [viewAllSection, setViewAllSection] = useState(null);
  const [genrePickerOpen, setGenrePickerOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(null);

  const {
    entriesById: libraryEntriesById,
    statusMeta: libraryStatusMeta,
    statusOrder: libraryStatusOrder,
    upsertEntry: upsertLibraryEntry,
    removeEntry: removeLibraryEntry,
    defaultStatus: libraryDefaultStatus,
    resolveStatusLabel: resolveLibraryStatusLabel,
  } = useLibrary();
  const [scopeDataCache, setScopeDataCache] = useState({});
  const requestIdRef = useRef(0);
  const detailAbortRef = useRef(null);
  const detailTimeoutRef = useRef(null);

  const activeScopeLabel = useMemo(
    () => SCOPE_OPTIONS.find((option) => option.value === activeScope)?.label ?? 'Anime',
    [activeScope]
  );

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLoading,
    searchError,
    clearSearch,
  } = useExploreSearch(activeScope, activeScopeLabel);

  const handleToggleViewAll = (sectionKey) => {
    setViewAllSection((prev) => (prev === sectionKey ? null : sectionKey));
  };

  const handleGenreSelect = (genreName) => {
    setSelectedGenre(genreName || null);
    setViewAllSection(null);
  };

  const closeScopeMenu = () => setScopeMenuOpen(false);

  const handleScopeChange = (nextScope) => {
    const cachedData = scopeDataCache[nextScope];
    setActiveScope(nextScope);
    closeScopeMenu();
    setSectionsData(cachedData ?? {});
    setLoading(!cachedData);
    setSelectedDetail(null);
    setSelectedDetailScope(null);
    setDetailError(null);
    setViewAllSection(null);
    setGenrePickerOpen(false);
    setSelectedGenre(null);
    clearSearch();
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
    setSelectedDetail(null);
    setSelectedDetailScope(null);
    setDetailLoading(false);
    setDetailError(null);
    setGenrePickerOpen(false);
    closeScopeMenu();
  };

  const handleSelectAnime = async (item) => {
    if (!item?.mal_id) {
      return;
    }

    let currentRequestId;
    try {
      currentRequestId = requestIdRef.current + 1;
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
      setSelectedDetail({ ...item });
      setSelectedDetailScope(SCOPE_VALUES.ANIME);
      setViewAllSection(null);
      setGenrePickerOpen(false);

      const data = await fetchJsonWithRetry(`${JIKAN_API_URL}/anime/${item.mal_id}/full`, {
        retries: 3,
        signal: controller.signal,
      });
      if (requestIdRef.current === currentRequestId) {
        setSelectedDetail(data.data);
        setSelectedDetailScope(SCOPE_VALUES.ANIME);
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

  const handleSelectManga = async (item) => {
    if (!item?.mal_id) {
      return;
    }

    let currentRequestId;
    try {
      currentRequestId = requestIdRef.current + 1;
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
      setSelectedDetail({ ...item });
      setSelectedDetailScope(SCOPE_VALUES.MANGA);
      setViewAllSection(null);
      setGenrePickerOpen(false);

      const data = await fetchJsonWithRetry(`${JIKAN_API_URL}/manga/${item.mal_id}/full`, {
        retries: 3,
        signal: controller.signal,
      });
      if (requestIdRef.current === currentRequestId) {
        setSelectedDetail(data.data);
        setSelectedDetailScope(SCOPE_VALUES.MANGA);
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

  const handleSelectCharacter = async (item) => {
    if (!item?.mal_id) {
      return;
    }

    let currentRequestId;
    try {
      currentRequestId = requestIdRef.current + 1;
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
      setSelectedDetail({ ...item });
      setSelectedDetailScope(SCOPE_VALUES.CHARACTERS);
      setViewAllSection(null);
      setGenrePickerOpen(false);

      const data = await fetchJsonWithRetry(
        `${JIKAN_API_URL}/characters/${item.mal_id}/full`,
        {
          retries: 3,
          signal: controller.signal,
        }
      );
      if (requestIdRef.current === currentRequestId) {
        setSelectedDetail(data.data);
        setSelectedDetailScope(SCOPE_VALUES.CHARACTERS);
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
    if (!selectedDetail && !detailLoading && !detailError) {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBackToBrowse();
      return true;
    });

    return () => {
      subscription.remove();
    };
  }, [selectedDetail, selectedDetailScope, detailLoading, detailError]);

  useEffect(() => {
    if (!viewAllSection || selectedDetail) {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setViewAllSection(null);
      return true;
    });

    return () => {
      subscription.remove();
    };
  }, [viewAllSection, selectedDetail]);

  useEffect(() => {
    let isCancelled = false;
    const sections = SECTION_CONFIG[activeScope] ?? [];
    const cachedData = scopeDataCache[activeScope];
    const shouldShowLoading = !cachedData;

    if (cachedData) {
      setSectionsData(cachedData);
      setLoading(false);
    }

    const fetchScopeSections = async (showLoading) => {
      try {
        if (showLoading) {
          setLoading(true);
          setError(null);
          if (!isCancelled) {
            setSectionsData({});
          }
        } else {
          setError(null);
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
          setScopeDataCache((prev) => ({
            ...prev,
            [activeScope]: nextData,
          }));
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
        if (!isCancelled && showLoading) {
          setLoading(false);
        }
      }
    };

    fetchScopeSections(shouldShowLoading);

    return () => {
      isCancelled = true;
    };
  }, [activeScope]);

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
    const showRankBadge =
      Boolean(section.showRankBadge) && activeScope === SCOPE_VALUES.MANGA;
    const cardVariant =
      activeScope === SCOPE_VALUES.USERS
        ? 'user'
        : useGrid
        ? 'grid'
        : 'carousel';
    const cardOnSelect =
      activeScope === SCOPE_VALUES.ANIME
        ? handleSelectAnime
        : activeScope === SCOPE_VALUES.MANGA
        ? handleSelectManga
        : activeScope === SCOPE_VALUES.CHARACTERS
        ? handleSelectCharacter
        : undefined;

    const keyExtractor = (item, index) => getItemKey(item, index, key);

    const renderItem = ({ item }) => {
      const baseRank =
        data.findIndex((entry) => entry?.mal_id === item?.mal_id) + 1;
      const absoluteRank = baseRank > 0 ? baseRank : data.indexOf(item) + 1;
      const badgeColor =
        RANK_BADGE_COLORS[(absoluteRank - 1) % RANK_BADGE_COLORS.length];
      return (
        <MediaCard
          item={item}
          onSelect={cardOnSelect}
          variant={cardVariant}
          badgeLabel={showRankBadge ? `#${absoluteRank}` : null}
          badgeColor={showRankBadge ? badgeColor : null}
        />
      );
    };

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

  if (selectedDetail) {
    return (
      <ExploreDetailView
        detailError={detailError}
        detailLoading={detailLoading}
        selectedDetail={selectedDetail}
        selectedDetailScope={selectedDetailScope}
        libraryEntriesById={libraryEntriesById}
        libraryStatusMeta={libraryStatusMeta}
        libraryStatusOrder={libraryStatusOrder}
        resolveLibraryStatusLabel={resolveLibraryStatusLabel}
        libraryDefaultStatus={libraryDefaultStatus}
        upsertLibraryEntry={upsertLibraryEntry}
        removeLibraryEntry={removeLibraryEntry}
      />
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
      contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset }]}
      scrollIndicatorInsets={{ bottom: bottomInset }}
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

      <SearchResultsSection
        searchQuery={searchQuery}
        filteredSearchResults={filteredSearchResults}
        searchLoading={searchLoading}
        searchError={searchError}
        supportsGenreFilter={supportsGenreFilter}
        activeScope={activeScope}
        activeScopeLabel={activeScopeLabel}
        onSelectAnime={handleSelectAnime}
        onSelectManga={handleSelectManga}
        onSelectCharacter={handleSelectCharacter}
      />

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

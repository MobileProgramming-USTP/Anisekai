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

const AnimeCard = ({ item, onSelect, variant = 'carousel' }) => {
  const title = item.title;
  const imageUrl = item.images?.jpg?.large_image_url;
  const cardStyle = variant === 'grid' ? styles.gridCard : styles.card;
  const imageStyle = variant === 'grid' ? styles.gridCardImage : styles.cardImage;

  return (
    <Pressable style={cardStyle} onPress={() => onSelect(item.mal_id)} hitSlop={4}>
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
  const [trending, setTrending] = useState([]);
  const [seasonPopular, setSeasonPopular] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [allTimePopular, setAllTimePopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleToggleViewAll = (sectionKey) => {
    setViewAllSection((prev) => (prev === sectionKey ? null : sectionKey));
  };

  const handleGenreSelect = (genreName) => {
    setSelectedGenre(genreName || null);
    setViewAllSection(null);
  };

  const handleBackToBrowse = () => {
    setSelectedAnime(null);
    setDetailError(null);
    setGenrePickerOpen(false);
  };

  const handleSelectAnime = async (id) => {
    try {
      setDetailLoading(true);
      setDetailError(null);
      setSelectedAnime(null);
      setViewAllSection(null);
      setGenrePickerOpen(false);

      const data = await fetchJsonWithRetry(`${JIKAN_API_URL}/anime/${id}/full`, {
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
    const fetchLists = async () => {
      try {
        setLoading(true);
        setError(null);

        const trendingData = await fetchJsonWithRetry(
          `${JIKAN_API_URL}/top/anime?filter=airing&limit=24`,
          { retries: 3 }
        );
        await delay(150);

        const seasonData = await fetchJsonWithRetry(
          `${JIKAN_API_URL}/seasons/now?limit=24`,
          { retries: 3 }
        );
        await delay(150);

        const upcomingData = await fetchJsonWithRetry(
          `${JIKAN_API_URL}/seasons/upcoming?limit=24`,
          { retries: 3 }
        );
        await delay(150);

        const allTimeData = await fetchJsonWithRetry(
          `${JIKAN_API_URL}/top/anime?limit=24`,
          { retries: 3 }
        );

        setTrending(trendingData?.data ?? []);
        setSeasonPopular(seasonData?.data ?? []);
        setUpcoming(upcomingData?.data ?? []);
        setAllTimePopular(allTimeData?.data ?? []);
      } catch (e) {
        const friendlyMessage =
          typeof e?.message === 'string' && e.message.includes('429')
            ? 'Jikan rate limit reached. Please try again shortly.'
            : 'Failed to fetch data from Jikan API.';
        setError(friendlyMessage);
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchError(null);
      setSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setSearchLoading(true);
        setSearchError(null);

        const data = await fetchJsonWithRetry(
          `${JIKAN_API_URL}/anime?q=${encodeURIComponent(searchQuery)}&limit=20`,
          { signal: controller.signal, retries: 1, backoff: 800 }
        );
        setSearchResults(data?.data ?? []);
      } catch (e) {
        if (e.name !== 'AbortError') {
          setSearchError('Failed to search anime.');
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
  }, [searchQuery]);

  const genreOptions = useMemo(() => {
    const genreSet = new Set();
    [trending, seasonPopular, upcoming, allTimePopular].forEach((list) => {
      list?.forEach((anime) => {
        anime.genres?.forEach((genre) => {
          if (genre?.name) {
            genreSet.add(genre.name);
          }
        });
      });
    });
    return Array.from(genreSet).sort((a, b) => a.localeCompare(b));
  }, [trending, seasonPopular, upcoming, allTimePopular]);

  const filteredSections = useMemo(() => {
    const filterList = (list) => {
      if (!selectedGenre) return list;
      return list.filter((anime) =>
        anime.genres?.some(
          (genre) => genre?.name?.toLowerCase() === selectedGenre.toLowerCase()
        )
      );
    };

    return {
      trending: filterList(trending),
      season: filterList(seasonPopular),
      upcoming: filterList(upcoming),
      allTime: filterList(allTimePopular),
    };
  }, [selectedGenre, trending, seasonPopular, upcoming, allTimePopular]);

  const filteredSearchResults = useMemo(() => {
    if (!selectedGenre) return searchResults;
    return searchResults.filter((anime) =>
      anime.genres?.some(
        (genre) => genre?.name?.toLowerCase() === selectedGenre.toLowerCase()
      )
    );
  }, [searchResults, selectedGenre]);

  const sectionGenreMatches = useMemo(
    () =>
      filteredSections.trending.length +
      filteredSections.season.length +
      filteredSections.upcoming.length +
      filteredSections.allTime.length,
    [filteredSections]
  );

  useEffect(() => {
    if (!viewAllSection) return;

    const lengthMap = {
      [SECTION_KEYS.TRENDING]: filteredSections.trending.length,
      [SECTION_KEYS.SEASON]: filteredSections.season.length,
      [SECTION_KEYS.UPCOMING]: filteredSections.upcoming.length,
      [SECTION_KEYS.ALL_TIME]: filteredSections.allTime.length,
    };

    if (lengthMap[viewAllSection] === 0) {
      setViewAllSection(null);
    }
  }, [
    viewAllSection,
    filteredSections.trending.length,
    filteredSections.season.length,
    filteredSections.upcoming.length,
    filteredSections.allTime.length,
  ]);

  const renderSection = (title, data, key) => {
    if (!data || data.length === 0) {
      return null;
    }

    const showingAll = viewAllSection === key;
    const listData = showingAll ? data : data.slice(0, 10);
    const listKey = showingAll ? `grid-${key}` : `carousel-${key}`;

    return (
      <View style={styles.sectionContainer} key={key}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Pressable onPress={() => handleToggleViewAll(key)} hitSlop={8}>
            <Text style={styles.viewAllText}>{showingAll ? 'Show Less' : 'View All'}</Text>
          </Pressable>
        </View>

        {showingAll ? (
          <FlatList
            data={listData}
            key={listKey}
            numColumns={2}
            keyExtractor={(item) => item.mal_id.toString()}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.gridList}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <AnimeCard item={item} onSelect={handleSelectAnime} variant="grid" />
            )}
          />
        ) : (
          <FlatList
            data={listData}
            key={listKey}
            keyExtractor={(item) => item.mal_id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
            renderItem={({ item }) => (
              <AnimeCard item={item} onSelect={handleSelectAnime} variant="carousel" />
            )}
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
    >
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Explore</Text>
        <Pressable style={styles.scopeButton} hitSlop={8}>
          <Text style={styles.scopeButtonLabel}>Anime</Text>
          <Ionicons name="chevron-down" size={16} color="#A5B2C2" />
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={18} color="#6f7a89" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search"
            placeholderTextColor="#6f7a89"
            style={styles.searchInput}
          />
        </View>
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
      </View>

      {(genrePickerOpen || selectedGenre) && genreOptions.length > 0 && (
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

      {selectedGenre && sectionGenreMatches === 0 && !searchQuery.trim() && (
        <Text style={[styles.emptyText, styles.genreEmptyText]}>
          No anime found for {selectedGenre}.
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
            <Text style={styles.emptyText}>No anime match that search.</Text>
          ) : (
            <FlatList
              data={filteredSearchResults.slice(0, 10)}
              key="search-grid"
              numColumns={2}
              keyExtractor={(item) => item.mal_id.toString()}
              columnWrapperStyle={styles.gridRow}
              contentContainerStyle={styles.gridList}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <AnimeCard item={item} onSelect={handleSelectAnime} variant="grid" />
              )}
            />
          )}
        </View>
      )}

      {renderSection('TRENDING NOW', filteredSections.trending, SECTION_KEYS.TRENDING)}
      {renderSection(
        'POPULAR THIS SEASON',
        filteredSections.season,
        SECTION_KEYS.SEASON
      )}
      {renderSection('UPCOMING ANIMES', filteredSections.upcoming, SECTION_KEYS.UPCOMING)}
      {renderSection(
        'ALL TIME POPULAR',
        filteredSections.allTime,
        SECTION_KEYS.ALL_TIME
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
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#E7EDF5',
  },
  scopeButton: {
    backgroundColor: '#1E2A3A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  scopeButtonLabel: {
    color: '#A5B2C2',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 6,
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

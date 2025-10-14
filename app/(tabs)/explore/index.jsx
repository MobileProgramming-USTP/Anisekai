import axios from 'axios';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const JIKAN_API_URL = 'https://api.jikan.moe/v4';
const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 40 - 20) / 3;
const ITEM_HEIGHT = ITEM_WIDTH * 1.5;

const AnimeCard = ({ item, onSelect }) => {
  const id = item.mal_id;
  const title = item.title;
  const imageUrl = item.images?.jpg?.large_image_url;

  return (
    <Pressable style={styles.card} onPress={() => onSelect(id)}>
      <Image source={{ uri: imageUrl }} style={styles.cardImage} />
      <Text style={styles.cardText} numberOfLines={2}>{title}</Text>
    </Pressable>
  );
};

const AnimeGrid = ({ title, data, onSelect }) => (
  <View style={styles.gridContainer}>
    <View style={styles.gridHeader}>
      <Text style={styles.gridTitle}>{title}</Text>
      <Pressable onPress={() => console.log(`View All ${title}`)}>
        <Text style={styles.viewAllText}>View All</Text>
      </Pressable>
    </View>
    <FlatList
      data={data.slice(0, 9)}
      renderItem={({ item }) => <AnimeCard item={item} onSelect={onSelect} />}
      keyExtractor={(item, index) => `${item.mal_id}-${index}`}
      numColumns={3}
      scrollEnabled={false}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={styles.gridContentContainer}
    />
  </View>
);

const ExploreScreen = () => {
  const [trending, setTrending] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedAnime, setSelectedAnime] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const handleBackToBrowse = () => {
    setSelectedAnime(null);
    setDetailError(null);
  };

  const handleSelectAnime = async (id) => {
    try {
      setDetailLoading(true);
      setDetailError(null);
      setSelectedAnime(null);

      const response = await axios.get(`${JIKAN_API_URL}/anime/${id}/full`);
      setSelectedAnime(response.data.data);
    } catch (e) {
      setDetailError("Failed to load details.");
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [trendingRes, upcomingRes] = await Promise.all([
          axios.get(`${JIKAN_API_URL}/top/anime`, { params: { filter: 'airing', limit: 9 } }),
          axios.get(`${JIKAN_API_URL}/seasons/upcoming`, { params: { limit: 9 } })
        ]);

        setTrending(trendingRes.data.data);
        setUpcoming(upcomingRes.data.data);
      } catch (e) {
        setError("Failed to fetch data from Jikan API.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Render logic ---

  if (detailLoading || detailError || selectedAnime) {
    if (detailLoading) {
      return (
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color="#fcbf49" />
        </View>
      );
    }

    if (detailError) {
      return (
        <View style={[styles.container, styles.centered]}>
          <Pressable style={styles.backButton} onPress={handleBackToBrowse}>
            <Text style={styles.backButtonText}>Back to Explore</Text>
          </Pressable>
          <Text style={styles.errorText}>{detailError}</Text>
        </View>
      );
    }

    if (selectedAnime) {
      const bannerImage = selectedAnime.trailer?.images?.maximum_image_url || selectedAnime.images?.jpg?.large_image_url;
      const genres = selectedAnime.genres?.map((g) => g.name).join(', ') || 'N/A';

      return (
        <ScrollView style={styles.container}>
          <Pressable style={styles.backButton} onPress={handleBackToBrowse}>
            <Text style={styles.backButtonText}>Back to Explore</Text>
          </Pressable>
          <Image source={{ uri: bannerImage }} style={styles.detailBannerImage} />
          <View style={styles.detailContent}>
            <Text style={styles.detailTitle}>{selectedAnime.title}</Text>
            <Text style={styles.detailText}>Status: {selectedAnime.status}</Text>
            <Text style={styles.detailText}>Episodes: {selectedAnime.episodes || 'N/A'}</Text>
            <Text style={styles.detailGenres}>Genres: {genres}</Text>
            <Text style={styles.detailDescription}>{selectedAnime.synopsis}</Text>
          </View>
        </ScrollView>
      );
    }
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
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Explore</Text>
        <Pressable style={styles.dropdownButton}>
          <Text style={styles.dropdownText}>Anime</Text>
        </Pressable>
      </View>
      <View style={styles.searchBarContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchInput}>Search</Text>
        <Pressable style={styles.filterButton}>
          <Text style={styles.filterIcon}>☰</Text>
        </Pressable>
      </View>

      <AnimeGrid title="TRENDING NOW" data={trending} onSelect={handleSelectAnime} />
      <AnimeGrid title="UPCOMING ANIMES" data={upcoming} onSelect={handleSelectAnime} />
    </ScrollView>
  );
};

export default ExploreScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 60,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 0,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  dropdownButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 30,
  },
  searchIcon: {
    color: 'gray',
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: 'gray',
    fontSize: 16,
  },
  filterButton: {
    backgroundColor: '#4a4a4a',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  filterIcon: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gridContainer: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  gridTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  viewAllText: {
    color: '#fcbf49',
    fontSize: 14,
    fontWeight: '600',
  },
  gridContentContainer: {
    justifyContent: 'space-between',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  card: {
    width: ITEM_WIDTH,
  },
  cardImage: {
    width: '100%',
    height: ITEM_HEIGHT,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
  },
  cardText: {
    color: 'white',
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'left',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(31, 31, 31, 0.7)',
  },
  backButtonText: {
    color: '#fcbf49',
    fontWeight: 'bold',
    fontSize: 16,
  },
  detailBannerImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#2a2a2a'
  },
  detailContent: {
    padding: 20
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10
  },
  detailText: {
    fontSize: 16,
    color: 'lightgray',
    marginBottom: 5
  },
  detailGenres: {
    fontSize: 16,
    color: 'gray',
    fontStyle: 'italic',
    marginBottom: 20
  },
  detailDescription: {
    fontSize: 16,
    color: 'white',
    lineHeight: 24
  },
});
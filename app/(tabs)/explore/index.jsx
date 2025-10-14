import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const JIKAN_API_URL = 'https://api.jikan.moe/v4';

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

const AnimeCarousel = ({ title, data, onSelect }) => (
  <View style={styles.carouselContainer}>
    <Text style={styles.carouselTitle}>{title}</Text>
    <FlatList
      data={data}
      renderItem={({ item }) => <AnimeCard item={item} onSelect={onSelect} />}
      keyExtractor={(item, index) => `${item.mal_id}-${index}`}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingLeft: 20 }}
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

      const response = await fetch(`${JIKAN_API_URL}/anime/${id}/full`);

      if (!response.ok) {
        throw new Error(`Non-200 response while fetching anime ${id}`);
      }

      const data = await response.json();
      setSelectedAnime(data.data);
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
          fetch(`${JIKAN_API_URL}/top/anime?filter=airing`),
          fetch(`${JIKAN_API_URL}/seasons/upcoming`)
        ]);

        if (!trendingRes.ok || !upcomingRes.ok) {
          throw new Error('Non-200 response from Jikan API');
        }

        const [trendingData, upcomingData] = await Promise.all([trendingRes.json(), upcomingRes.json()]);

        setTrending(trendingData.data);
        setUpcoming(upcomingData.data);

      } catch (e) {
        setError("Failed to fetch data from Jikan API.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (detailLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Pressable style={styles.backButton} onPress={handleBackToBrowse}>
          <Text style={styles.backButtonText}>Back to Explore</Text>
        </Pressable>
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
    <View style={styles.container}>
      <Text style={styles.header}>Explore Anime</Text>
      <AnimeCarousel title="Trending Now" data={trending} onSelect={handleSelectAnime} />
      <AnimeCarousel title="Upcoming Animes" data={upcoming} onSelect={handleSelectAnime} />
    </View>
  );
};

export default ExploreScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#121212', 
    paddingTop: 60 
  },
  centered: { 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingTop: 0
  },
  header: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: 'white', 
    paddingHorizontal: 20, 
    marginBottom: 20 
  },
  carouselContainer: { 
    marginBottom: 30 
  },
  carouselTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: 'white', 
    paddingHorizontal: 20, 
    marginBottom: 15 
  },
  card: { 
    width: 150, 
    marginRight: 15 
  },
  cardImage: { 
    width: '100%', 
    height: 220, 
    borderRadius: 8,
    backgroundColor: '#2a2a2a'
  },
  cardText: { 
    color: 'white', 
    marginTop: 8, 
    fontWeight: '600' 
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  backButton: {
    marginTop: 20,
    marginHorizontal: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#1f1f1f',
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#fcbf49',
    fontWeight: 'bold',
    fontSize: 16,
  },
  detailBannerImage: {
    width: '100%',
    height: 250,
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
  }
});

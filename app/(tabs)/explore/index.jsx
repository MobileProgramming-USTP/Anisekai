import axios from 'axios';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";

const JIKAN_API_URL = 'https://api.jikan.moe/v4';

const AnimeCard = ({ item }) => {
  const id = item.mal_id;
  const title = item.title;
  const imageUrl = item.images?.jpg?.large_image_url;

  return (
    <Link href={`/explore/${id}`} asChild>
      <Pressable style={styles.card}>
        <Image source={{ uri: imageUrl }} style={styles.cardImage} />
        <Text style={styles.cardText} numberOfLines={2}>{title}</Text>
      </Pressable>
    </Link>
  );
};

const AnimeCarousel = ({ title, data }) => (
  <View style={styles.carouselContainer}>
    <Text style={styles.carouselTitle}>{title}</Text>
    <FlatList
      data={data}
      renderItem={({ item }) => <AnimeCard item={item} />}
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [trendingRes, upcomingRes] = await Promise.all([
          axios.get(`${JIKAN_API_URL}/top/anime`, { params: { filter: 'airing' } }),
          axios.get(`${JIKAN_API_URL}/seasons/upcoming`)
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
      <AnimeCarousel title="Trending Now" data={trending} />
      <AnimeCarousel title="Upcoming Animes" data={upcoming} />
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
  }
});
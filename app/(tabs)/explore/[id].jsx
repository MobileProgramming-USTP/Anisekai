import axios from 'axios';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

const JIKAN_API_URL = 'https://api.jikan.moe/v4';

export default function AnimeDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${JIKAN_API_URL}/anime/${id}/full`);
        setAnime(response.data.data);
      } catch (e) {
        setError("Failed to load details.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) {
    return <ActivityIndicator size="large" style={[styles.container, styles.centered]} color="#fcbf49" />;
  }

  if (error || !anime) {
    return <Text style={[styles.container, styles.centered, styles.errorText]}>{error || "Anime not found."}</Text>;
  }
  
  const bannerImage = anime.trailer?.images?.maximum_image_url || anime.images?.jpg?.large_image_url;

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: anime.title, headerTintColor: 'white', headerStyle: { backgroundColor: '#121212' } }} />
      <Image source={{ uri: bannerImage }} style={styles.bannerImage} />
      <View style={styles.content}>
        <Text style={styles.title}>{anime.title}</Text>
        <Text style={styles.detailText}>Status: {anime.status}</Text>
        <Text style={styles.detailText}>Episodes: {anime.episodes || 'N/A'}</Text>
        <Text style={styles.genres}>Genres: {anime.genres.map(g => g.name).join(', ')}</Text>
        <Text style={styles.description}>{anime.synopsis}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#121212' 
  },
  centered: { 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  bannerImage: { 
    width: '100%', 
    height: 250,
    backgroundColor: '#2a2a2a'
  },
  content: { 
    padding: 20 
  },
  title: { 
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
  genres: { 
    fontSize: 16, 
    color: 'gray', 
    fontStyle: 'italic', 
    marginBottom: 20 
  },
  description: { 
    fontSize: 16, 
    color: 'white', 
    lineHeight: 24 
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  }
});

import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const API_BASE_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_WAIFU_API_BASE?.trim()) ||
  'https://api.waifu.pics/sfw';
const CATEGORIES = ['waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'kiss', 'lick', 'pat'];

export default function WaifuGeneratorScreen() {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedCategory, setSelectedCategory] = useState('waifu');
  const [history, setHistory] = useState([]);
  const [status, requestPermission] = MediaLibrary.usePermissions();

  const generateWaifu = async (category) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/${category}`);
      if (response.data && response.data.url) {
        const newUrl = response.data.url;
        setImageUrl(newUrl);
        setHistory(prevHistory => {
          if (prevHistory[0] === newUrl) return prevHistory;
          return [newUrl, ...prevHistory].slice(0, 10);
        });
      } else {
        throw new Error('Invalid API response');
      }
    } catch (e) {
      setError('Failed to generate a new waifu. Please try again.');
      console.error(e);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    if (!status?.granted) {
      const { status: newStatus } = await requestPermission();
      if (newStatus !== 'granted') {
        Alert.alert('Permission required', 'We need permission to save photos to your device.');
        return;
      }
    }
    try {
      const fileUri = FileSystem.documentDirectory + `${Date.now()}.jpg`;
      const { uri } = await FileSystem.downloadAsync(imageUrl, fileUri);
      await MediaLibrary.createAssetAsync(uri);
      Alert.alert('Success!', 'Image saved to your gallery.');
    } catch (err) {
      Alert.alert('Error', 'Could not save the image.');
      console.error(err);
    }
  };

  const handleHistorySelect = (url) => {
    setImageUrl(url);
  };

  useEffect(() => {
    generateWaifu(selectedCategory);
  }, [selectedCategory]);

  const renderContent = () => {
    if (loading && !imageUrl) {
      return <ActivityIndicator size="large" color="#fcbf49" />;
    }
    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }
    return (
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fcbf49" />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Waifu Generator' }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Your Waifu</Text>
          <Text style={styles.subtitle}>Select a category and generate!</Text>
        </View>

        {/* --- Category Selector --- */}
        <View style={styles.categorySection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        
        {renderContent()}

        {/* --- Action Buttons --- */}
        <View style={styles.buttonGroup}>
          <Pressable 
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} 
            onPress={() => generateWaifu(selectedCategory)}
            disabled={loading}
          >
            <Ionicons name="sparkles" size={20} color="#121212" />
            <Text style={styles.buttonText}>Generate New</Text>
          </Pressable>
          <Pressable 
            style={({ pressed }) => [styles.downloadButton, pressed && styles.buttonPressed]} 
            onPress={handleDownload}
            disabled={!imageUrl || loading}
          >
            <Ionicons name="download-outline" size={20} color="#fcbf49" />
          </Pressable>
        </View>

        {/* --- History --- */}
        {history.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>History</Text>
            <FlatList
              data={history}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable onPress={() => handleHistorySelect(item)}>
                  <Image source={{ uri: item }} style={styles.historyThumbnail} />
                </Pressable>
              )}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');
const imageSize = width - 80;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    alignItems: 'center',
    padding: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'gray',
    fontSize: 16,
    marginTop: 5,
  },
  categorySection: {
    width: '100%',
    height: 50,
    marginBottom: 20,
  },
  categoryContainer: {
    alignItems: 'center',
  },
  categoryChip: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    justifyContent: 'center',
  },
  categoryChipActive: {
    backgroundColor: '#fcbf49',
  },
  categoryText: {
    color: 'white',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#121212',
  },
  imageContainer: {
    width: imageSize,
    height: imageSize,
    borderRadius: 20,
    backgroundColor: '#1f1f1f',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: 16,
    height: imageSize,
    textAlignVertical: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    marginTop: 30,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fcbf49',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  downloadButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 50,
    padding: 15,
    marginLeft: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#121212',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  historySection: {
    width: '100%',
    marginTop: 40,
  },
  historyTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  historyThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: '#2a2a2a',
  },
});

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Stack } from 'expo-router';
import { Video } from 'expo-video';
import { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

const TRACE_API_URL = 'https://api.trace.moe/search';

const SceneFinderScreen = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [permission, requestPermission] = ImagePicker.useMediaLibraryPermissions();

  const handlePickImage = async () => {
    if (!permission?.granted) {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'We need permission to access your photos.');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Image,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      handleSearch(imageUri);
    }
  };

  const handleSearch = async (imageUri) => {
    try {
      setLoading(true);
      setError(null);
      setSearchResult(null);

      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'upload.jpg',
      });

      const response = await axios.post(TRACE_API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data && response.data.result && response.data.result.length > 0) {
        setSearchResult(response.data.result[0]);
      } else {
        setError("Couldn't find a match. Try a different image.");
      }
    } catch (e) {
      setError("An error occurred during the search. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setSelectedImage(null);
    setSearchResult(null);
    setError(null);
    setLoading(false);
  };
  
  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#fcbf49" style={styles.contentArea} />;
    }

    if (error) {
      return <Text style={[styles.contentArea, styles.errorText]}>{error}</Text>;
    }

    if (searchResult) {
      const { anilist, episode, similarity, video } = searchResult;
      const title = anilist.title.romaji || anilist.title.english;
      const similarityPercent = (similarity * 100).toFixed(2);

      return (
        <View style={styles.resultContainer}>
          <Video
            source={{ uri: video }}
            style={styles.videoPreview}
            useNativeControls={false}
            resizeMode="contain"
            isLooping
            isMuted
            shouldPlay // Replaced with playing={true} for newer versions
          />
          <View style={styles.resultTextContainer}>
            <Text style={styles.resultTitle}>{title}</Text>
            <Text style={styles.resultInfo}>Episode: {episode || 'N/A'}</Text>
            <Text style={styles.resultInfo}>Similarity: {similarityPercent}%</Text>
          </View>
        </View>
      );
    }

    // This is the new placeholder to fill the blank space
    return (
      <View style={[styles.contentArea, styles.placeholderContainer]}>
        <MaterialCommunityIcons name="image-search-outline" size={80} color="#2a2a2a" />
        <Text style={styles.placeholderText}>Ready to find that scene?</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Scene Finder' }} />
      
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Scene Finder</Text>
        <Text style={styles.subtitle}>Upload a screenshot to find what anime it's from!</Text>
      </View>
      
      {renderContent()}

      <Pressable 
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} 
        onPress={searchResult || error ? resetSearch : handlePickImage}
        disabled={loading}
      >
        <Ionicons name={searchResult || error ? "refresh" : "image-outline"} size={20} color="#121212" />
        <Text style={styles.buttonText}>{searchResult || error ? "Search Again" : "Upload Image"}</Text>
      </Pressable>
    </View>
  );
}

export default SceneFinderScreen;

const { width } = Dimensions.get('window');
const resultWidth = width - 40;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
    paddingBottom: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 20,
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
    textAlign: 'center',
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    width: resultWidth,
    height: resultWidth,
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2a2a2a',
    borderStyle: 'dashed',
  },
  placeholderText: {
    marginTop: 15,
    color: '#4a4a4a',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    width: resultWidth,
    borderRadius: 12,
    backgroundColor: '#1f1f1f',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  videoPreview: {
    width: '100%',
    height: resultWidth * (9 / 16),
  },
  resultTextContainer: {
    padding: 15,
  },
  resultTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultInfo: {
    color: 'lightgray',
    fontSize: 14,
    marginTop: 5,
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: 16,
    textAlign: 'center'
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
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#121212',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
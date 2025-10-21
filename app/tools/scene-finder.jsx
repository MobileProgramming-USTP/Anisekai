import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import { Stack } from "expo-router";
import { Video } from "expo-video";

import { API_ENDPOINTS } from "../../src/config/api";
import { theme } from "../../styles/theme";
import { sceneFinderStyles } from "../../styles/tools/sceneFinderStyles";

const TRACE_API_URL = API_ENDPOINTS.trace;

const styles = sceneFinderStyles;

const clampSimilarity = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
};

const formatTime = (seconds) => {
  if (typeof seconds !== "number" || Number.isNaN(seconds)) {
    return "00:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const SceneFinderScreen = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = useCallback(async (imageUri) => {
    try {
      setLoading(true);
      setError(null);
      setSearchResult(null);

      const formData = new FormData();
      formData.append("image", {
        uri: imageUri,
        type: "image/jpeg",
        name: "upload.jpg",
      });

      const response = await axios.post(TRACE_API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (Array.isArray(response.data?.result) && response.data.result.length > 0) {
        setSearchResult(response.data.result[0]);
      } else {
        setError("Couldn't find a match. Try a different image.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during the search. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePickImage = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets?.[0];
      if (!file?.uri) {
        Alert.alert("Error", "No image selected.");
        return;
      }

      setSelectedImage(file.uri);
      handleSearch(file.uri);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to pick an image.");
    }
  }, [handleSearch]);

  const resetSearch = useCallback(() => {
    setSelectedImage(null);
    setSearchResult(null);
    setError(null);
    setLoading(false);
  }, []);

  const content = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Searching anime database...</Text>
            <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
          </View>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <View style={styles.errorCard}>
            <Ionicons name="sad-outline" size={64} color={theme.colors.danger} />
            <Text style={styles.errorTitle}>Oops!</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorHint}>Try uploading a clear anime screenshot.</Text>
          </View>
        </View>
      );
    }

    if (searchResult) {
      const { anilist, episode, similarity, video, from, to } = searchResult || {};
      const title =
        anilist?.title?.romaji ||
        anilist?.title?.english ||
        anilist?.title?.native ||
        "Unknown Title";

      const similarityPercent = (clampSimilarity(similarity) * 100).toFixed(1);
      const highConfidence = clampSimilarity(similarity) >= 0.87;

      return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="cover" />
          )}

          <View
            style={[
              styles.resultContainer,
              highConfidence ? styles.highConfidence : styles.lowConfidence,
            ]}
          >
            <View style={styles.confidenceBadge}>
              <MaterialCommunityIcons
                name={highConfidence ? "shield-check" : "alert-circle-outline"}
                size={18}
                color={theme.colors.text}
                style={styles.confidenceIcon}
              />
              <Text style={styles.confidenceText}>{similarityPercent}% match</Text>
            </View>

            {video ? (
              <View style={styles.videoContainer}>
                <Video
                  source={{ uri: video }}
                  style={styles.videoPreview}
                  useNativeControls
                  resizeMode="cover"
                  shouldPlay
                  isLooping
                />
              </View>
            ) : null}

            <View style={styles.resultInfo}>
              <Text style={styles.resultTitle}>{title}</Text>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoValue}>
                    {typeof episode === "number" ? `Episode ${episode}` : "Unknown Episode"}
                  </Text>
                  <Text style={styles.infoLabel}>Episode</Text>
                </View>

                <View style={[styles.infoItem, styles.infoItemSpacing]}>
                  <Text style={styles.infoValue}>
                    {formatTime(from)} - {formatTime(to)}
                  </Text>
                  <Text style={styles.infoLabel}>Timestamp</Text>
                </View>
              </View>

              <Text style={styles.infoLabel}>
                AniList ID: {anilist?.id || "N/A"}
              </Text>
            </View>
          </View>
        </ScrollView>
      );
    }

    return (
      <View style={styles.placeholderContainer}>
        {selectedImage ? (
          <>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="cover" />
            <Text style={styles.placeholderTitle}>Searching for matches...</Text>
          </>
        ) : (
          <>
            <MaterialCommunityIcons name="image-search" size={48} color={theme.colors.textSubtle} />
            <Text style={styles.placeholderTitle}>Drop an anime scene</Text>
            <Text style={styles.placeholderText}>
              Upload an image or screenshot from any anime scene to identify it.
            </Text>
          </>
        )}
      </View>
    );
  }, [error, loading, searchResult, selectedImage]);

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: "Scene Finder",
          headerStyle: { backgroundColor: theme.colors.backgroundAlt },
          headerTintColor: theme.colors.text,
        }}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Scene Finder</Text>
        <Text style={styles.subtitle}>Identify any anime from a single screenshot</Text>
      </View>

      <View style={styles.contentWrapper}>{content}</View>

      <View style={styles.buttonContainer}>
        {selectedImage ? (
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={resetSearch}
          >
            <Ionicons name="refresh" size={22} color={theme.colors.primaryForeground} />
            <Text style={styles.buttonText}>Reset</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={handlePickImage}
          >
            <Ionicons name="image-outline" size={22} color={theme.colors.primaryForeground} />
            <Text style={styles.buttonText}>Pick Image</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default SceneFinderScreen;

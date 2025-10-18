import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import { Stack } from "expo-router";
import { Video } from "expo-video";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const TRACE_API_URL =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_TRACE_API_URL?.trim()) ||
  "https://api.trace.moe/search";

const SceneFinderScreen = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets?.[0];
      if (!file) {
        Alert.alert("Error", "No image selected.");
        return;
      }

      setSelectedImage(file.uri);
      handleSearch(file.uri);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to pick an image.");
    }
  };

  const handleSearch = async (imageUri) => {
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

      if (response.data?.result?.length > 0) {
        setSearchResult(response.data.result[0]);
      } else {
        setError("Couldn't find a match. Try a different image.");
      }
    } catch (e) {
      console.error(e);
      setError("An error occurred during the search. Please try again.");
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#fcbf49" />
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
            <Ionicons name="sad-outline" size={64} color="#ff6b6b" />
            <Text style={styles.errorTitle}>Oops!</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorHint}>Try uploading a clear anime screenshot</Text>
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
      const similarityPercent = (similarity * 100).toFixed(1);
      const isHighConfidence = similarity > 0.9;

      return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="cover" />
          )}

          <View style={styles.resultContainer}>
            <View
              style={[
                styles.confidenceBadge,
                isHighConfidence ? styles.highConfidence : styles.lowConfidence,
              ]}
            >
              <Ionicons
                name={isHighConfidence ? "checkmark-circle" : "help-circle"}
                size={16}
                color={isHighConfidence ? "#4ade80" : "#fbbf24"}
              />
              <Text style={styles.confidenceText}>{similarityPercent}% Match</Text>
            </View>

            {video ? (
              <View style={styles.videoContainer}>
                <Video
                  source={{ uri: video }}
                  style={styles.videoPreview}
                  useNativeControls
                  resizeMode="contain"
                  shouldPlay
                  isLooping
                />
              </View>
            ) : null}

            <View style={styles.resultInfo}>
              <Text style={styles.resultTitle}>{title}</Text>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Ionicons name="film-outline" size={18} color="#fcbf49" />
                  <Text style={styles.infoLabel}>Episode</Text>
                  <Text style={styles.infoValue}>{episode || "N/A"}</Text>
                </View>

                {from && to && (
                  <View style={styles.infoItem}>
                    <Ionicons name="time-outline" size={18} color="#fcbf49" />
                    <Text style={styles.infoLabel}>Timestamp</Text>
                    <Text style={styles.infoValue}>
                      {formatTime(from)} - {formatTime(to)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      );
    }

    return (
      <View style={styles.placeholderContainer}>
        <MaterialCommunityIcons name="image-search-outline" size={80} color="#fcbf49" />
        <Text style={styles.placeholderTitle}>Find Your Anime Scene</Text>
        <Text style={styles.placeholderText}>
          Upload an image or screenshot from any anime scene to identify it.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Scene Finder",
          headerStyle: { backgroundColor: "#121212" },
          headerTintColor: "#fff",
        }}
      />
      <View style={styles.header}>
        <Text style={styles.title}>Scene Finder</Text>
        <Text style={styles.subtitle}>Identify any anime from a single screenshot</Text>
      </View>

      <View style={styles.contentWrapper}>{renderContent()}</View>

      <View style={styles.buttonContainer}>
        {!selectedImage ? (
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={handlePickImage}
          >
            <Ionicons name="image-outline" size={24} color="#121212" />
            <Text style={styles.buttonText}>Pick Image</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={resetSearch}
          >
            <Ionicons name="refresh" size={24} color="#121212" />
            <Text style={styles.buttonText}>Reset</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default SceneFinderScreen;

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  title: { color: "#fcbf49", fontSize: 32, fontWeight: "bold" },
  subtitle: { color: "#9ca3af", fontSize: 15, marginTop: 6 },
  contentWrapper: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loadingCard: { backgroundColor: "#1f1f1f", borderRadius: 20, padding: 40, alignItems: "center" },
  loadingText: { color: "white", fontSize: 18, fontWeight: "600", marginTop: 20 },
  loadingSubtext: { color: "#9ca3af", fontSize: 14, marginTop: 8 },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  errorCard: { backgroundColor: "#1f1f1f", borderRadius: 20, padding: 32, alignItems: "center" },
  errorTitle: { color: "#ff6b6b", fontSize: 24, fontWeight: "bold", marginTop: 16 },
  errorText: { color: "#e5e7eb", fontSize: 16, textAlign: "center", marginTop: 8 },
  errorHint: { color: "#9ca3af", fontSize: 14, textAlign: "center", marginTop: 12 },
  placeholderContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  placeholderTitle: { color: "white", fontSize: 24, fontWeight: "bold", textAlign: "center", marginTop: 12 },
  placeholderText: { color: "#9ca3af", fontSize: 15, textAlign: "center", marginBottom: 24 },
  previewImage: {
    width: width - 40,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    alignSelf: "center",
  },
  resultContainer: {
    backgroundColor: "#1f1f1f",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  confidenceBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  highConfidence: { borderColor: "rgba(74,222,128,0.3)" },
  lowConfidence: { borderColor: "rgba(251,191,36,0.3)" },
  confidenceText: { color: "white", fontSize: 13, fontWeight: "600" },
  videoContainer: { width: "100%", aspectRatio: 16 / 9, backgroundColor: "#000" },
  videoPreview: { width: "100%", height: "100%" },
  resultInfo: { padding: 20 },
  resultTitle: { color: "white", fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  infoRow: { flexDirection: "row", gap: 16, marginBottom: 16 },
  infoItem: {
    flex: 1,
    backgroundColor: "rgba(252,191,73,0.05)",
    padding: 16,
    borderRadius: 12,
  },
  infoLabel: { color: "#9ca3af", fontSize: 12, marginTop: 6 },
  infoValue: { color: "white", fontSize: 16, fontWeight: "600" },
  buttonContainer: { padding: 20, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fcbf49",
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
  },
  buttonPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  buttonText: { color: "#121212", fontSize: 17, fontWeight: "bold" },
});


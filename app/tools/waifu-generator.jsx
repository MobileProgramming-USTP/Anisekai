import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { Stack } from "expo-router";

import { API_ENDPOINTS } from "../../src/config/api";
import { theme } from "../../styles/theme";
import { waifuGeneratorStyles } from "../../styles/tools/waifuGeneratorStyles";

const CATEGORIES = ["waifu", "neko", "shinobu", "megumin", "bully", "cuddle", "cry", "kiss", "lick", "pat"];
const HISTORY_LIMIT = 10;
const DEFAULT_CATEGORY = "waifu";
const WAIFU_API_BASE = API_ENDPOINTS.waifu;

const formatCategoryLabel = (value) => value.charAt(0).toUpperCase() + value.slice(1);

const styles = waifuGeneratorStyles;

const useMediaLibraryAccess = () => {
  const permissionsTuple = MediaLibrary.usePermissions();
  const status = permissionsTuple?.[0];
  const request = permissionsTuple?.[1];

  return {
    granted: Boolean(status?.granted),
    request,
  };
};

export default function WaifuGeneratorScreen() {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_CATEGORY);
  const [history, setHistory] = useState([]);
  const { granted: mediaLibraryGranted, request: requestMediaLibrary } = useMediaLibraryAccess();

  const generateWaifu = useCallback(
    async (category) => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${WAIFU_API_BASE}/${category}`);
        const newUrl = response.data?.url;

        if (!newUrl) {
          throw new Error("The Waifu API did not return an image URL.");
        }

        setImageUrl(newUrl);
        setHistory((prevHistory) => {
          if (prevHistory[0] === newUrl) {
            return prevHistory;
          }
          return [newUrl, ...prevHistory].slice(0, HISTORY_LIMIT);
        });
      } catch (err) {
        console.error(err);
        setError("Failed to generate a new waifu. Please try again.");
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    },
    []
  );

  const handleDownload = useCallback(async () => {
    if (!imageUrl) {
      return;
    }

    let hasPermission = mediaLibraryGranted;

    if (!hasPermission && typeof requestMediaLibrary === "function") {
      const permission = await requestMediaLibrary();
      hasPermission = Boolean(permission?.granted);
    }

    if (!hasPermission) {
      Alert.alert(
        "Permission required",
        "We need permission to save photos to your device. You can enable photo access in your device settings."
      );
      return;
    }

    try {
      const fileUri = `${FileSystem.documentDirectory}${Date.now()}.jpg`;
      const { uri } = await FileSystem.downloadAsync(imageUrl, fileUri);
      await MediaLibrary.createAssetAsync(uri);
      Alert.alert("Success!", "Image saved to your gallery.");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not save the image.");
    }
  }, [imageUrl, mediaLibraryGranted, requestMediaLibrary]);

  useEffect(() => {
    generateWaifu(selectedCategory);
  }, [selectedCategory, generateWaifu]);

  const content = useMemo(() => {
    if (loading && !imageUrl) {
      return <ActivityIndicator size="large" color={theme.colors.primary} />;
    }

    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }

    return (
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}
      </View>
    );
  }, [error, imageUrl, loading]);

  const renderHistoryItem = useCallback(
    ({ item }) => (
      <Pressable onPress={() => setImageUrl(item)}>
        <Image source={{ uri: item }} style={styles.historyThumbnail} />
      </Pressable>
    ),
    []
  );

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: "Waifu Generator" }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Your Waifu</Text>
          <Text style={styles.subtitle}>Select a category and generate!</Text>
        </View>

        <View style={styles.categorySection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          >
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <Pressable
                  key={category}
                  style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                    {formatCategoryLabel(category)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {content}

        <View style={styles.buttonGroup}>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={() => generateWaifu(selectedCategory)}
            disabled={loading}
          >
            <Ionicons name="sparkles" size={20} color={theme.colors.primaryForeground} />
            <Text style={styles.buttonText}>Generate New</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.downloadButton, pressed && styles.buttonPressed]}
            onPress={handleDownload}
            disabled={!imageUrl || loading}
          >
            <Ionicons name="download-outline" size={20} color={theme.colors.primary} />
          </Pressable>
        </View>

        {history.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>History</Text>
            <FlatList
              data={history}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item}
              renderItem={renderHistoryItem}
              contentContainerStyle={styles.historyList}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

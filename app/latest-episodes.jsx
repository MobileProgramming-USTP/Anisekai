import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Image, Linking, Pressable, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import fetchLatestStreamingEpisodes from "../src/data/latestEpisodes";
import { latestEpisodesStyles } from "../styles/latestEpisodesStyles";
import { theme } from "../styles/theme";

const EPISODE_LIMIT = 20;
const styles = latestEpisodesStyles;

const formatReleaseDate = (isoDate) => {
  if (!isoDate || typeof isoDate !== "string") {
    return null;
  }

  const timestamp = Date.parse(isoDate);
  if (!Number.isFinite(timestamp)) {
    return null;
  }

  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatGenres = (genres) => {
  if (!Array.isArray(genres) || genres.length === 0) {
    return null;
  }
  return genres.slice(0, 3).join(" • ");
};

const LatestEpisodesScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [episodes, setEpisodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadEpisodes = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const data = await fetchLatestStreamingEpisodes({
          limit: EPISODE_LIMIT,
          signal: controller.signal,
        });

        setEpisodes(data);
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }
        console.error("Failed to fetch latest streaming episodes", error);
        setErrorMessage("Unable to load the latest streaming episodes right now.");
      } finally {
        setIsLoading(false);
      }
    };

    loadEpisodes();

    return () => controller.abort();
  }, []);

  const renderedContent = useMemo(() => {
    if (isLoading) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.statusText}>Loading latest streaming episodes...</Text>
        </View>
      );
    }

    if (errorMessage) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.statusText}>{errorMessage}</Text>
        </View>
      );
    }

    if (!episodes.length) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.statusText}>No recent streaming episodes found.</Text>
        </View>
      );
    }

    return null;
  }, [episodes.length, errorMessage, isLoading]);

  const handleOpenStreamingUrl = async (url) => {
    if (!url) {
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.warn("Streaming URL is not supported:", url);
      }
    } catch (error) {
      console.error("Failed to open streaming URL", error);
    }
  };

  const renderEpisodeItem = ({ item }) => {
    const releaseDateLabel = formatReleaseDate(item.releaseDate);
    const showEpisodeBadge =
      typeof item.episodeNumber === "number" && Number.isFinite(item.episodeNumber);

    const fallbackInitial = item.title?.charAt?.(0)?.toUpperCase?.() || "?";
    const genreLabel = formatGenres(item.genres);
    const subtitleText = genreLabel || item.episodeTitle || null;

    return (
      <Pressable
        style={styles.episodeRow}
        onPress={() => handleOpenStreamingUrl(item.streamingUrl)}
        disabled={!item.streamingUrl}
      >
        <View style={styles.episodeImageWrapper}>
          {item.coverImage ? (
            <Image source={{ uri: item.coverImage }} style={styles.episodeImage} />
          ) : (
            <View style={styles.episodeImageFallback}>
              <Text style={styles.episodeFallbackText}>{fallbackInitial}</Text>
            </View>
          )}
        </View>

        <View style={styles.episodeContent}>
          <Text style={styles.episodeTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {subtitleText ? (
            <Text style={styles.episodeSubtitle} numberOfLines={1}>
              {subtitleText}
            </Text>
          ) : null}
          <View style={styles.episodeMetaRow}>
            {showEpisodeBadge ? (
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>Episode {item.episodeNumber}</Text>
              </View>
            ) : null}
            {releaseDateLabel ? (
              <Text style={styles.metaText}>Released {releaseDateLabel}</Text>
            ) : null}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + theme.spacing.medium }]}>
      <Stack.Screen
        options={{
          title: "Latest Episodes",
          headerStyle: { backgroundColor: theme.colors.backgroundAlt },
          headerTintColor: theme.colors.text,
        }}
      />

      <Pressable
        style={[styles.closeButton, { top: insets.top + theme.spacing.medium }]}
        onPress={() => router.back()}
        hitSlop={12}
        accessibilityRole="button"
      >
        <Ionicons name="close" size={22} color={theme.colors.text} />
      </Pressable>

      {renderedContent ? (
        renderedContent
      ) : (
        <FlatList
          data={episodes}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderEpisodeItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
};

export default LatestEpisodesScreen;

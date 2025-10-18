import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import fetchLatestStreamingEpisodes from "../src/data/latestEpisodes";

const EPISODE_LIMIT = 20;

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
          <ActivityIndicator size="large" color="#fcbf49" />
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
            <View style={[styles.episodeImage, styles.episodeImageFallback]}>
              <Text style={styles.episodeFallbackText}>{fallbackInitial}</Text>
            </View>
          )}
        </View>
        <View style={styles.episodeContent}>
          <Text style={styles.episodeTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.episodeTitle ? (
            <Text style={styles.episodeSubtitle} numberOfLines={1}>
              {item.episodeTitle}
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
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Stack.Screen
        options={{
          title: "Latest Episodes",
          headerStyle: { backgroundColor: "#121212" },
          headerTintColor: "#fff",
        }}
      />

      <Pressable
        style={[styles.closeButton, { top: insets.top + 16 }]}
        onPress={() => router.back()}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Close latest episodes"
      >
        <Ionicons name="close" size={22} color="#E7EDF5" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F1719",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  closeButton: {
    position: "absolute",
    left: 16,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 25, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(231, 237, 245, 0.08)",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    marginTop: 16,
    color: "#A5B2C2",
    fontSize: 16,
    textAlign: "center",
  },
  listContent: {
    paddingTop: 76,
    paddingBottom: 24,
  },
  episodeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#1E2A3A",
    borderRadius: 16,
  },
  episodeImage: {
    width: 90,
    height: 130,
    borderRadius: 12,
    backgroundColor: "#121A21",
  },
  episodeImageWrapper: {
    marginRight: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#121A21",
  },
  episodeImageFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  episodeFallbackText: {
    color: "#fcbf49",
    fontSize: 32,
    fontWeight: "700",
  },
  episodeContent: {
    flex: 1,
  },
  episodeTitle: {
    color: "#E7EDF5",
    fontSize: 17,
    fontWeight: "700",
  },
  episodeSubtitle: {
    color: "#A5B2C2",
    fontSize: 14,
    marginTop: 4,
  },
  episodeMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 10,
  },
  metaBadge: {
    backgroundColor: "rgba(252,191,73,0.18)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 12,
    marginBottom: 6,
  },
  metaBadgeText: {
    color: "#fcbf49",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.4,
  },
  metaText: {
    color: "#A5B2C2",
    fontSize: 13,
    marginRight: 12,
    marginBottom: 6,
  },
  separator: {
    height: 14,
  },
});

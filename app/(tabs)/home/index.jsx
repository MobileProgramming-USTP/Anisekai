import { useEffect, useState } from "react";
import { Image, ImageBackground, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";

import styles from "../../../styles/homeStyles";
import { JIKAN_API_URL } from "../../../src/explore/constants";
import { fetchJsonWithRetry } from "../../../src/explore/utils/api";

const HERO_LOGO = require("../../login/assets/anisekai.png");
const HERO_BACKGROUND = require("../../../assets/images/anime-collage.png");

const resolveEpisodeImage = (entry, episode) =>
  episode?.images?.jpg?.large_image_url ||
  episode?.images?.jpg?.image_url ||
  episode?.images?.webp?.large_image_url ||
  episode?.images?.webp?.image_url ||
  entry?.images?.jpg?.large_image_url ||
  entry?.images?.jpg?.image_url ||
  entry?.images?.webp?.large_image_url ||
  entry?.images?.webp?.image_url ||
  null;

const formatAiredDate = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  try {
    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return null;
  }
};

const normalizeLatestEpisodes = (payload = []) =>
  payload
    .map((item) => {
      if (!item) {
        return null;
      }

      const entry = item.entry ?? {};
      const latestEpisode =
        Array.isArray(item.episodes) && item.episodes.length ? item.episodes[0] : null;

      const coverImage = resolveEpisodeImage(entry, latestEpisode);

      const rawEpisodeNumber = latestEpisode?.episode;
      const episodeNumber =
        typeof rawEpisodeNumber === "number" && Number.isFinite(rawEpisodeNumber)
          ? rawEpisodeNumber
          : Number.isFinite(latestEpisode?.mal_id)
            ? latestEpisode.mal_id
            : null;

      const detailParts = [];
      if (typeof latestEpisode?.title === "string" && latestEpisode.title.trim()) {
        detailParts.push(latestEpisode.title.trim());
      }
      const airedDisplay = formatAiredDate(
        (typeof latestEpisode?.aired === "string" ? latestEpisode.aired : null) ??
          (typeof latestEpisode?.aired_at === "string" ? latestEpisode.aired_at : null)
      );
      if (airedDisplay) {
        detailParts.push(airedDisplay);
      }

      const normalizeTotal = (value) => {
        if (typeof value === "number" && Number.isFinite(value) && value > 0) {
          return value;
        }
        if (typeof value === "string" && value.trim()) {
          const numeric = Number(value.trim().replace(/[^0-9.]+/g, ""));
          if (Number.isFinite(numeric) && numeric > 0) {
            return numeric;
          }
        }
        return null;
      };

      const totalEpisodesValue = normalizeTotal(entry?.episodes);
      const airedEpisodesValue = normalizeTotal(entry?.episodes_aired);
      const totalEpisodesRaw = totalEpisodesValue ?? airedEpisodesValue ?? null;

      const id =
        entry?.mal_id ??
        latestEpisode?.mal_id ??
        `${entry?.title ?? "episode"}-${episodeNumber ?? Math.random().toString(36).slice(2)}`;

      return {
        id,
        title: entry?.title ?? latestEpisode?.title ?? "Untitled",
        episodeNumber,
        episodeDetail: detailParts.length ? detailParts.join(" \u2022 ") : null,
        totalEpisodes: totalEpisodesRaw,
        coverImage,
      };
    })
    .filter((item) => item && item.title);

const Home = () => {
const router = useRouter();
const tabBarHeight = useBottomTabBarHeight();
const bottomInset = tabBarHeight + 32;

  const [latestEpisodes, setLatestEpisodes] = useState([]);
  const [episodesLoading, setEpisodesLoading] = useState(true);
  const [episodesError, setEpisodesError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadLatestEpisodes = async () => {
      try {
        setEpisodesLoading(true);
        setEpisodesError(null);

        const response = await fetchJsonWithRetry(`${JIKAN_API_URL}/watch/episodes`, {
          signal: controller.signal,
          retries: 3,
          backoff: 800,
        });

        if (!isMounted) {
          return;
        }

        const normalized = normalizeLatestEpisodes(response?.data ?? []).slice(0, 6);
        setLatestEpisodes(normalized);
      } catch (error) {
        if (!isMounted || error?.name === "AbortError") {
          return;
        }
        console.error("Failed to load latest streaming episodes", error);
        setEpisodesError("Unable to load the latest streaming episodes right now.");
        setLatestEpisodes([]);
      } finally {
        if (isMounted) {
          setEpisodesLoading(false);
        }
      }
    };

    loadLatestEpisodes();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const handleViewAll = () => {
    router.push("/(tabs)/library");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: bottomInset }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroWrapper}>
        <ImageBackground source={HERO_BACKGROUND} style={styles.hero} imageStyle={styles.heroImage}>
          <LinearGradient
            colors={["rgba(15, 23, 25, 0.05)", "rgba(15, 23, 25, 0.45)", "rgba(15, 23, 25, 0.95)"]}
            locations={[0, 0.55, 1]}
            style={styles.heroGradient}
          />
          <Image source={HERO_LOGO} style={styles.heroLogo} resizeMode="contain" />
        </ImageBackground>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Latest Episodes</Text>
          {latestEpisodes.length ? (
            <TouchableOpacity onPress={handleViewAll} hitSlop={8}>
              <Text style={styles.sectionAction}>View All</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {episodesLoading ? (
          <Text style={styles.emptyStateText}>Loading latest streaming episodes…</Text>
        ) : episodesError ? (
          <Text style={styles.emptyStateText}>{episodesError}</Text>
        ) : latestEpisodes.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.episodeList}
          >
            {latestEpisodes.map((episode) => (
              <View key={episode.id} style={styles.episodeCard}>
                <View style={styles.episodeImageWrapper}>
                  {episode.coverImage ? (
                    <Image source={{ uri: episode.coverImage }} style={styles.episodeImage} />
                  ) : (
                    <View style={[styles.episodeImage, styles.episodeImageFallback]}>
                      <Text style={styles.episodeFallbackText}>
                        {episode.title.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <LinearGradient
                    colors={[
                      "rgba(15, 23, 25, 0)",
                      "rgba(15, 23, 25, 0.55)",
                      "rgba(15, 23, 25, 0.92)",
                    ]}
                    locations={[0.45, 0.75, 1]}
                    style={styles.episodeImageOverlay}
                  />
                  {episode.episodeNumber ? (
                    <View style={styles.episodeBadge}>
                      <Text style={styles.episodeBadgeText}>Episode {episode.episodeNumber}</Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.episodeDetails}>
                  <Text style={styles.episodeTitle} numberOfLines={2}>
                    {episode.title}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.emptyStateText}>
            Start watching anime to see your latest episodes here.
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

export default Home;

import { useEffect, useState } from "react";
import { Image, ImageBackground, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";

import styles from "../../../styles/homeStyles";
import fetchLatestStreamingEpisodes from "../../../src/data/latestEpisodes";

const HERO_LOGO = require("../../login/assets/anisekai.png");
const HERO_BACKGROUND = require("../../../assets/images/anime-collage.png");

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

        const episodes = await fetchLatestStreamingEpisodes({
          limit: 20,
          signal: controller.signal,
        });

        if (!isMounted) {
          return;
        }

        setLatestEpisodes(episodes);
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
    router.push("/latest-episodes");
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
          <Text style={styles.emptyStateText}>Loading latest streaming episodes...</Text>
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
                    <Text style={styles.episodeBadgeText}>Episode {episode.episodeNumber}</Text>
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

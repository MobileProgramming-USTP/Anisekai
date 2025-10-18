import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";

import styles from "../../../styles/homeStyles";
import fetchLatestStreamingEpisodes from "../../../src/data/latestEpisodes";
import fetchAiAnimeMangaRecommendations, {
  isGeminiConfigured,
} from "../../../src/data/geminiRecommendations";

const HERO_LOGO = require("../../login/assets/anisekai.png");
const HERO_BACKGROUND = require("../../../assets/images/anime-collage.png");

const AI_PROMPT_SUGGESTIONS = [
  {
    label: "Shonen",
    prompt: "High-energy shonen adventures packed with intense battles, loyal friends, and hype arcs.",
  },
  {
    label: "Slice of Life",
    prompt: "Comforting slice-of-life series with everyday charm, cozy pacing, and heartwarming moments.",
  },
  {
    label: "Romance",
    prompt: "Romance anime or manga full of chemistry, slow-burn tension, and emotional payoffs.",
  },
];

const Home = () => {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const bottomInset = tabBarHeight + 32;

  const [latestEpisodes, setLatestEpisodes] = useState([]);
  const [episodesLoading, setEpisodesLoading] = useState(true);
  const [episodesError, setEpisodesError] = useState(null);
  const [aiPreference, setAiPreference] = useState("");
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const aiAbortControllerRef = useRef(null);

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

  useEffect(
    () => () => {
      aiAbortControllerRef.current?.abort();
    },
    []
  );

  const handleViewAll = () => {
    router.push("/latest-episodes");
  };

  const handleGenerateRecommendations = useCallback(
    async (overridePreference) => {
      if (!isGeminiConfigured) {
        setAiError("Add EXPO_PUBLIC_GEMINI_API_KEY to enable AI recommendations.");
        return;
      }

      const trimmedPreference =
        typeof overridePreference === "string" && overridePreference.trim().length
          ? overridePreference.trim()
          : aiPreference.trim();

      if (!trimmedPreference) {
        setAiError("Tell Gemini what genre or title you're craving first.");
        return;
      }

      setAiPreference(trimmedPreference);

      aiAbortControllerRef.current?.abort();

      const controller = new AbortController();
      aiAbortControllerRef.current = controller;

      setAiLoading(true);
      setAiError(null);
      setAiRecommendations([]);

      try {
        const recommendations = await fetchAiAnimeMangaRecommendations({
          preference: trimmedPreference,
          signal: controller.signal,
        });

        setAiRecommendations(recommendations);

        if (!recommendations.length) {
          setAiError("Gemini could not find matches. Try a different vibe or genre.");
        }
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }

        setAiError(error?.message ?? "Unable to generate AI recommendations right now.");
      } finally {
        if (aiAbortControllerRef.current === controller) {
          aiAbortControllerRef.current = null;
        }
        setAiLoading(false);
      }
    },
    [aiPreference]
  );

  const handleClearRecommendations = useCallback(() => {
    aiAbortControllerRef.current?.abort();
    aiAbortControllerRef.current = null;
    setAiPreference("");
    setAiRecommendations([]);
    setAiError(null);
    setAiLoading(false);
  }, []);

  const handlePromptSelect = useCallback(
    (prompt) => {
      if (typeof prompt !== "string" || !prompt.trim().length) {
        return;
      }

      const cleaned = prompt.trim();
      setAiPreference(cleaned);
      handleGenerateRecommendations(cleaned);
    },
    [handleGenerateRecommendations]
  );

  const trimmedAiPreference = aiPreference.trim();
  const hasAiPreference = trimmedAiPreference.length > 0;
  const aiButtonDisabled = !isGeminiConfigured || aiLoading || !hasAiPreference;

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
          <Text style={styles.sectionTitle}>AI Recommendations</Text>
        </View>
        {!isGeminiConfigured ? (
          <Text style={styles.sectionDescription}>
            Set EXPO_PUBLIC_GEMINI_API_KEY in your env to unlock AI powered recommendations.
          </Text>
        ) : null}
        <Text style={styles.aiPromptLead}>What genre or anime/manga are you in the mood for?</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.aiPromptScroll}
        >
          {AI_PROMPT_SUGGESTIONS.map((item) => {
            const isSelected = trimmedAiPreference === item.prompt;
            return (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.aiPromptChip,
                  isSelected && styles.aiPromptChipActive,
                  (!isGeminiConfigured || aiLoading) && styles.aiPromptChipDisabled,
                ]}
                onPress={() => handlePromptSelect(item.prompt)}
                disabled={!isGeminiConfigured || aiLoading}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.aiPromptChipText,
                    isSelected && styles.aiPromptChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <TextInput
          value={aiPreference}
          onChangeText={setAiPreference}
          placeholder="e.g. A bittersweet romance manga or a chill iyashikei anime"
          placeholderTextColor="rgba(227, 235, 243, 0.45)"
          style={styles.aiInput}
          multiline
          autoCorrect
          autoCapitalize="sentences"
          editable={isGeminiConfigured && !aiLoading}
          onSubmitEditing={() => handleGenerateRecommendations()}
          blurOnSubmit
          returnKeyType="search"
        />
        <View style={styles.aiActionsRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={aiButtonDisabled}
            onPress={() => handleGenerateRecommendations()}
            style={styles.aiPrimaryButton}
          >
            <LinearGradient
              colors={["#ff0080", "#a445b2", "#5b5ff7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.aiPrimaryGradient, aiButtonDisabled && styles.aiPrimaryButtonDisabled]}
            >
              <Text style={styles.aiPrimaryText}>
                {aiLoading ? "Summoning Gemini..." : "Ask Gemini"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          {aiRecommendations.length ? (
            <TouchableOpacity onPress={handleClearRecommendations} style={styles.aiClearButton}>
              <Text style={styles.aiClearButtonText}>Clear</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {aiLoading ? (
          <View style={styles.aiLoadingRow}>
            <ActivityIndicator color="#FFB300" size="small" />
            <Text style={styles.aiLoadingText}>Asking Gemini for titles...</Text>
          </View>
        ) : null}
        {aiError ? <Text style={styles.aiErrorText}>{aiError}</Text> : null}
        {aiRecommendations.length ? (
          <View style={styles.recommendationList}>
            {aiRecommendations.map((item) => {
              const metaParts = [
                item.type,
                item.genres && item.genres.length ? item.genres.join(", ") : null,
              ].filter(Boolean);
              return (
                <View key={item.id} style={styles.recommendationCard}>
                  <Text style={styles.recommendationTitle}>{item.title}</Text>
                  {metaParts.length ? (
                    <Text style={styles.recommendationMeta}>{metaParts.join(" | ")}</Text>
                  ) : null}
                  {item.synopsis ? (
                    <Text style={styles.recommendationSynopsis}>{item.synopsis}</Text>
                  ) : null}
                  {item.reason ? (
                    <Text style={styles.recommendationReason}>{item.reason}</Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : null}
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

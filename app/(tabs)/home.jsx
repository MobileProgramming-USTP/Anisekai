import { useMemo, useState } from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import styles from "../styles/homeStyles";

const USER_PROFILE = {
  name: "Daven",
  avatar: "https://cdn.myanimelist.net/images/characters/9/501643.jpg",
  seasonTheme: "Autumn Cour 2025",
};

const DAILY_MIX = [
  {
    type: "waifu",
    title: "Waifu of the Day",
    name: "Sora Miyazaki",
    blurb: "Synthwave DJ by night, shrine keeper by dawn.",
    traits: ["Builds custom keyblades", "Collects ramen stickers", "Writes haiku"],
  },
  {
    type: "quote",
    title: "Quote of the Day",
    quote:
      "A lesson without pain is meaningless. You cannot gain something without sacrificing something else.",
    source: "Edward Elric, Fullmetal Alchemist",
  },
  {
    type: "waifu",
    title: "Waifu of the Day",
    name: "Kana Hoshino",
    blurb: "Stargazer who sketches constellations into manga panels.",
    traits: ["Sleeps with headphones", "Trains rescue cats", "Holds midnight tea ceremonies"],
  },
  {
    type: "quote",
    title: "Quote of the Day",
    quote: "Whatever you lose, you will find it again. But what you throw away you will never get back.",
    source: "Gintoki Sakata, Gintama",
  },
];

const WATCHING_LIST = [
  {
    id: "frieren",
    title: "Frieren: Beyond Journey's End",
    poster: "https://cdn.myanimelist.net/images/anime/1561/138701.jpg",
    episodesWatched: 18,
    totalEpisodes: 24,
    lastWatched: "Yesterday",
    nextEpisode: "Episode 19",
  },
  {
    id: "jjk",
    title: "Jujutsu Kaisen Season 2",
    poster: "https://cdn.myanimelist.net/images/anime/1015/138006.jpg",
    episodesWatched: 14,
    totalEpisodes: 23,
    lastWatched: "3 days ago",
    nextEpisode: "Episode 15",
  },
  {
    id: "haikyuu",
    title: "Haikyuu!!",
    poster: "https://cdn.myanimelist.net/images/anime/7/76014.jpg",
    episodesWatched: 52,
    totalEpisodes: 85,
    lastWatched: "Last week",
    nextEpisode: "Episode 53",
  },
  {
    id: "violet",
    title: "Violet Evergarden",
    poster: "https://cdn.myanimelist.net/images/anime/1795/95088.jpg",
    episodesWatched: 6,
    totalEpisodes: 13,
    lastWatched: "2 days ago",
    nextEpisode: "Episode 7",
  },
];

const QUICK_ACTIONS = [
  {
    key: "add",
    label: "Add Anime",
    description: "Log a new series to your lists.",
  },
  {
    key: "explore",
    label: "Discover Anime",
    description: "Jump into the explore tab.",
  },
  {
    key: "trace",
    label: "Try Anime Trace",
    description: "Identify scenes from screenshots.",
  },
  {
    key: "waifu",
    label: "Generate Waifu",
    description: "Spin up a new companion profile.",
  },
];

const WEEKLY_ACTIVITY = {
  totalHours: 14,
  topGenres: ["Fantasy", "Drama", "Slice of Life"],
  hours: [
    { day: "Mon", hours: 2 },
    { day: "Tue", hours: 1 },
    { day: "Wed", hours: 3 },
    { day: "Thu", hours: 2 },
    { day: "Fri", hours: 2 },
    { day: "Sat", hours: 3 },
    { day: "Sun", hours: 1 },
  ],
};

const COMMUNITY_HIGHLIGHT = {
  title: "Top picks by Anisekai users",
  summary: "Frieren, Solo Leveling, and Apothecary Diaries are trending this week.",
  cta: "See community list",
};

const ProgressBar = ({ percent }) => (
  <View style={styles.progressTrack}>
    <View style={[styles.progressFill, { width: `${percent}%` }]} />
  </View>
);

const Home = () => {
  const [dailyMixIndex, setDailyMixIndex] = useState(() => Math.floor(Math.random() * DAILY_MIX.length));

  const dailyMix = DAILY_MIX[dailyMixIndex];
  const spotlight = useMemo(
    () => WATCHING_LIST[Math.floor(Math.random() * WATCHING_LIST.length)],
    []
  );

  const handleShuffleMix = () => {
    setDailyMixIndex((prev) => {
      let next = Math.floor(Math.random() * DAILY_MIX.length);
      if (next === prev && DAILY_MIX.length > 1) {
        next = (prev + 1) % DAILY_MIX.length;
      }
      return next;
    });
  };

  const handleQuickAction = (actionKey) => {
    console.log(`Quick action selected: ${actionKey}`);
  };

  const maxHours = useMemo(
    () => WEEKLY_ACTIVITY.hours.reduce((max, entry) => Math.max(max, entry.hours), 1),
    []
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ImageBackground
        source={require("../../assets/images/anime-collage.png")}
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        <View style={styles.heroOverlay}>
          <View style={styles.welcomeRow}>
            <View>
              <Text style={styles.heroTitle}>Welcome back, {USER_PROFILE.name}</Text>
              <Text style={styles.heroSubtitle}>Season focus: {USER_PROFILE.seasonTheme}</Text>
            </View>
            <Image source={{ uri: USER_PROFILE.avatar }} style={styles.heroAvatar} />
          </View>
        </View>
      </ImageBackground>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Daily Mix</Text>
        <View style={styles.mixCard}>
          <View style={styles.mixHeader}>
            <Text style={styles.mixTitle}>{dailyMix.title}</Text>
            <TouchableOpacity style={styles.shuffleButton} onPress={handleShuffleMix}>
              <Text style={styles.shuffleText}>Shuffle</Text>
            </TouchableOpacity>
          </View>
          {dailyMix.type === "waifu" ? (
            <View>
              <Text style={styles.mixHeadline}>{dailyMix.name}</Text>
              <Text style={styles.mixBlurb}>{dailyMix.blurb}</Text>
              <View style={styles.traitRow}>
                {dailyMix.traits.map((trait) => (
                  <View key={trait} style={styles.traitBadge}>
                    <Text style={styles.traitText}>{trait}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.mixQuote}>"{dailyMix.quote}"</Text>
              <Text style={styles.mixSource}>{dailyMix.source}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Spotlight</Text>
        <View style={styles.spotlightCard}>
          <Image source={{ uri: spotlight.poster }} style={styles.spotlightPoster} />
          <View style={styles.spotlightDetails}>
            <Text style={styles.spotlightTitle}>{spotlight.title}</Text>
            <Text style={styles.spotlightMeta}>Last watched: {spotlight.lastWatched}</Text>
            <Text style={styles.spotlightMeta}>Up next: {spotlight.nextEpisode}</Text>
            <TouchableOpacity style={styles.spotlightButton}>
              <Text style={styles.spotlightButtonText}>Open Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Continue Watching</Text>
          <Text style={styles.sectionSubtitle}>Pick up where you left off.</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
        >
          {WATCHING_LIST.map((anime) => {
            const percent = anime.totalEpisodes
              ? Math.round((anime.episodesWatched / anime.totalEpisodes) * 100)
              : 0;
            return (
              <View key={anime.id} style={styles.carouselCard}>
                <Image source={{ uri: anime.poster }} style={styles.carouselPoster} />
                <Text style={styles.carouselTitle} numberOfLines={2}>
                  {anime.title}
                </Text>
                <Text style={styles.carouselMeta}>
                  {anime.episodesWatched}/{anime.totalEpisodes} episodes
                </Text>
                <ProgressBar percent={percent} />
                <Text style={styles.carouselMeta}>Next: {anime.nextEpisode}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Text style={styles.sectionSubtitle}>Jump straight into popular tools.</Text>
        </View>
        <View style={styles.quickGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={styles.quickTile}
              onPress={() => handleQuickAction(action.key)}
            >
              <Text style={styles.quickLabel}>{action.label}</Text>
              <Text style={styles.quickDescription}>{action.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Weekly Activity Snapshot</Text>
          <Text style={styles.sectionSubtitle}>
            {WEEKLY_ACTIVITY.totalHours} hours watched - Top genres: {WEEKLY_ACTIVITY.topGenres.join(", ")}
          </Text>
        </View>
        <View style={styles.activityChart}>
          {WEEKLY_ACTIVITY.hours.map((entry) => {
            const heightPercent = Math.round((entry.hours / maxHours) * 100);
            return (
              <View key={entry.day} style={styles.activityColumn}>
                <View style={styles.activityBarShell}>
                  <View style={[styles.activityBarFill, { height: `${heightPercent}%` }]} />
                </View>
                <Text style={styles.activityLabel}>{entry.day}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Community Highlight</Text>
        <View style={styles.communityCard}>
          <Text style={styles.communityTitle}>{COMMUNITY_HIGHLIGHT.title}</Text>
          <Text style={styles.communitySummary}>{COMMUNITY_HIGHLIGHT.summary}</Text>
          <TouchableOpacity style={styles.communityButton}>
            <Text style={styles.communityButtonText}>{COMMUNITY_HIGHLIGHT.cta}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default Home;

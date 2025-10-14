import { useMemo, useState } from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import styles from "../styles/profileStyles";
import { useAuth } from "../context/AuthContext";

const STATUS_COLORS = {
  watching: "#5b5ff7",
  completed: "#4caf50",
  plan: "#fcbf49",
  hold: "#e63946",
};

const STATUS_LABELS = {
  watching: "Watching",
  completed: "Completed",
  plan: "Plan to Watch",
  hold: "Dropped / On Hold",
};

const STATUS_ORDER = ["watching", "completed", "plan", "hold"];

const MOCK_PROFILE = {
  username: "Starlit Sage",
  bio: "Collector of quiet slice-of-life moments and cosmic epics.",
  avatar: "https://cdn.myanimelist.net/images/characters/10/284726.jpg",
  banner: "https://images.unsplash.com/photo-1526401281623-3596aa0132a3?auto=format&fit=crop&w=1600&q=80",
  tags: ["Night Owl", "Review Writer", "Waifu Enthusiast"],
  stats: {
    hoursWatched: 486,
    reviewsWritten: 14,
    topGenres: ["Slice of Life", "Fantasy", "Drama"],
    statusBreakdown: {
      watching: 32,
      completed: 148,
      plan: 56,
      hold: 9,
    },
  },
  achievements: [
    {
      id: "ach-episodes-100",
      title: "Watched 100 Episodes",
      detail: "Hit triple digits in tracked episodes.",
      unlocked: true,
      unlockedAt: "Aug 2024",
    },
    {
      id: "ach-first-review",
      title: "First Review Written",
      detail: "Shared your thoughts on Made in Abyss.",
      unlocked: true,
      unlockedAt: "Jun 2024",
    },
    {
      id: "ach-weekend-binge",
      title: "Weekend Binger",
      detail: "Logged 12 episodes in a single weekend.",
      unlocked: false,
      unlockedAt: null,
    },
  ],
  activity: [
    {
      id: "act-1",
      type: "episode",
      summary: "Completed Frieren: Beyond Journey's End episode 24.",
      timestamp: "2 hours ago",
    },
    {
      id: "act-2",
      type: "review",
      summary: "Reviewed Made in Abyss (10/10).",
      timestamp: "Yesterday",
    },
    {
      id: "act-3",
      type: "library",
      summary: "Moved Chainsaw Man to Plan to Watch.",
      timestamp: "3 days ago",
    },
    {
      id: "act-4",
      type: "badge",
      summary: "Unlocked Weekend Binger milestone.",
      timestamp: "5 days ago",
    },
  ],
  favorites: [
    {
      id: "fav-1",
      title: "Frieren: Beyond Journey's End",
      poster: "https://cdn.myanimelist.net/images/anime/1561/138701.jpg",
      note: "A reflective epic about time and memory.",
    },
    {
      id: "fav-2",
      title: "Violet Evergarden",
      poster: "https://cdn.myanimelist.net/images/anime/1795/95088.jpg",
      note: "Letters that heal, visuals that stun.",
    },
    {
      id: "fav-3",
      title: "Haikyuu!!",
      poster: "https://cdn.myanimelist.net/images/anime/7/76014.jpg",
      note: "Pure adrenaline and heart in every rally.",
    },
  ],
};

const SETTINGS_TEMPLATE = {
  themeDark: true,
  notifications: true,
  autoImport: false,
  weeklyDigest: true,
};

const SETTING_DEFS = [
  {
    key: "themeDark",
    label: "Enable Midnight Theme",
    description: "Switch between bright and midnight palettes.",
    requiresAuth: false,
  },
  {
    key: "notifications",
    label: "Notifications",
    description: "Get alerts for new episodes and reminders.",
    requiresAuth: false,
  },
  {
    key: "autoImport",
    label: "Auto-import from AniList",
    description: "Keep your lists synced automatically.",
    requiresAuth: true,
  },
  {
    key: "weeklyDigest",
    label: "Weekly Digest",
    description: "Receive curated watch suggestions every Sunday.",
    requiresAuth: true,
  },
];

const ACTIVITY_TYPE_COLORS = {
  episode: STATUS_COLORS.watching,
  review: "#ff0080",
  library: STATUS_COLORS.completed,
  badge: STATUS_COLORS.plan,
};

const SWITCH_COLORS = {
  thumbOn: "#fcbf49",
  thumbOff: "#5d5d64",
  trackOn: "rgba(252,191,73,0.35)",
  trackOff: "rgba(255,255,255,0.2)",
};

const StatCard = ({ label, value, sublabel }) => (
  <View style={styles.statCard}>
    <Text style={styles.statCardLabel}>{label}</Text>
    <Text style={styles.statCardValue}>{value}</Text>
    {sublabel ? <Text style={styles.statCardSub}>{sublabel}</Text> : null}
  </View>
);

const AchievementCard = ({ achievement }) => (
  <View
    style={[
      styles.achievementCard,
      achievement.unlocked ? styles.achievementUnlocked : styles.achievementLocked,
    ]}
  >
    <Text style={styles.achievementTitle}>{achievement.title}</Text>
    <Text style={styles.achievementDetail}>{achievement.detail}</Text>
    <Text style={styles.achievementMeta}>
      {achievement.unlocked ? `Unlocked ${achievement.unlockedAt}` : "Locked"}
    </Text>
  </View>
);

const ActivityRow = ({ entry }) => {
  const color = ACTIVITY_TYPE_COLORS[entry.type] ?? STATUS_COLORS.watching;

  return (
    <View style={styles.activityRow}>
      <View style={[styles.activityIcon, { backgroundColor: color }]} />
      <View style={styles.activityCopy}>
        <Text style={styles.activityDescription}>{entry.summary}</Text>
        <Text style={styles.activityTime}>{entry.timestamp}</Text>
      </View>
    </View>
  );
};

const FavoriteCard = ({ favorite }) => (
  <View style={styles.favoriteCard}>
    <Image source={{ uri: favorite.poster }} style={styles.favoritePoster} />
    <Text style={styles.favoriteTitle} numberOfLines={2}>
      {favorite.title}
    </Text>
    <Text style={styles.favoriteNote} numberOfLines={2}>
      {favorite.note}
    </Text>
  </View>
);

const SettingRow = ({ setting, value, onToggle, disabled }) => (
  <View style={styles.settingRow}>
    <View style={styles.settingCopy}>
      <Text style={styles.settingLabel}>{setting.label}</Text>
      <Text style={styles.settingDescription}>{setting.description}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      disabled={disabled}
      trackColor={{ false: SWITCH_COLORS.trackOff, true: SWITCH_COLORS.trackOn }}
      thumbColor={value ? SWITCH_COLORS.thumbOn : SWITCH_COLORS.thumbOff}
    />
  </View>
);

const StatusPie = ({ breakdown }) => {
  const entries = useMemo(() => {
    const total = STATUS_ORDER.reduce(
      (sum, status) => sum + (breakdown[status] ?? 0),
      0
    );
    return STATUS_ORDER.map((status) => {
      const count = breakdown[status] ?? 0;
      const percent = total ? Math.round((count / total) * 100) : 0;
      return {
        key: status,
        label: STATUS_LABELS[status],
        count,
        percent,
        color: STATUS_COLORS[status],
      };
    });
  }, [breakdown]);

  return (
    <View style={styles.pieContainer}>
      <View
        style={[
          styles.pieChart,
          {
            borderTopColor: entries[0]?.color ?? "rgba(255,255,255,0.12)",
            borderRightColor: entries[1]?.color ?? "rgba(255,255,255,0.12)",
            borderBottomColor: entries[2]?.color ?? "rgba(255,255,255,0.12)",
            borderLeftColor: entries[3]?.color ?? "rgba(255,255,255,0.12)",
          },
        ]}
      />
      <View style={styles.pieCenter}>
        <Text style={styles.pieTotal}>
          {entries.reduce((sum, entry) => sum + entry.count, 0)}
        </Text>
        <Text style={styles.pieLabel}>series</Text>
      </View>
      <View style={styles.legendList}>
        {entries.map((entry) => (
          <View key={entry.key} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: entry.color }]} />
            <Text style={styles.legendLabel}>{entry.label}</Text>
            <Text style={styles.legendValue}>
              {entry.count} ({entry.percent}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const Profile = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [settings, setSettings] = useState(SETTINGS_TEMPLATE);

  const handleLogout = () => {
    signOut();
    router.replace("/login/login");
  };

  const isSignedIn = Boolean(user);

  const displayName = user?.username ?? MOCK_PROFILE.username;
  const displayEmail = user?.email ?? "Sign in to sync your viewing stats.";
  const displayAvatar = user?.avatarUrl ?? MOCK_PROFILE.avatar;
  const displayBanner = user?.bannerUrl ?? MOCK_PROFILE.banner;
  const displayBio = user?.bio ?? MOCK_PROFILE.bio;
  const displayTags = user?.tags ?? MOCK_PROFILE.tags;

  const stats = useMemo(() => MOCK_PROFILE.stats, []);
  const achievements = MOCK_PROFILE.achievements;
  const activityFeed = MOCK_PROFILE.activity;
  const favorites = MOCK_PROFILE.favorites;

  const totalSeries = useMemo(
    () =>
      Object.values(stats.statusBreakdown).reduce(
        (sum, value) => sum + value,
        0
      ),
    [stats.statusBreakdown]
  );

  const statCards = useMemo(
    () => [
      {
        key: "hours",
        label: "Hours Watched",
        value: stats.hoursWatched,
        sublabel: "+12 this month",
      },
      {
        key: "reviews",
        label: "Reviews Written",
        value: stats.reviewsWritten,
        sublabel: "Keep sharing insights",
      },
      {
        key: "series",
        label: "Series Tracked",
        value: totalSeries,
        sublabel: "Across all statuses",
      },
    ],
    [stats.hoursWatched, stats.reviewsWritten, totalSeries]
  );

  const handleToggleSetting = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ImageBackground
        source={{ uri: displayBanner }}
        style={styles.banner}
        imageStyle={styles.bannerImage}
      >
        <View style={styles.bannerOverlay} />
        <TouchableOpacity style={styles.bannerCta}>
          <Text style={styles.bannerCtaText}>Customize Banner</Text>
        </TouchableOpacity>
      </ImageBackground>

      <View style={styles.header}>
        <View style={styles.avatarRing}>
          <Image source={{ uri: displayAvatar }} style={styles.avatar} />
        </View>
        <Text style={styles.username}>{displayName}</Text>
        <Text style={styles.bio}>{displayBio}</Text>
        <Text style={styles.email}>{displayEmail}</Text>
        <View style={styles.tagRow}>
          {displayTags.map((tag) => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stats Dashboard</Text>
        <Text style={styles.sectionSubtitle}>
          Snapshot of your watch habits over the last year.
        </Text>
        <View style={styles.statGrid}>
          {statCards.map((card) => (
            <StatCard
              key={card.key}
              label={card.label}
              value={card.value}
              sublabel={card.sublabel}
            />
          ))}
        </View>
        <View style={styles.genreCard}>
          <Text style={styles.genreTitle}>Top Genres</Text>
          <View style={styles.genreRow}>
            {stats.topGenres.map((genre) => (
              <View key={genre} style={styles.genreChip}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.pieSection}>
          <Text style={styles.genreTitle}>Anime Count by Status</Text>
          <StatusPie breakdown={stats.statusBreakdown} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <Text style={styles.sectionSubtitle}>
          Unlock milestones as you log more anime and reviews.
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.achievementScroller}
        >
          {achievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Favorite Anime Showcase</Text>
        <Text style={styles.sectionSubtitle}>
          A curated shelf of stories that define your taste.
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.favoriteScroller}
        >
          {favorites.map((favorite) => (
            <FavoriteCard key={favorite.id} favorite={favorite} />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Log</Text>
        <Text style={styles.sectionSubtitle}>
          Recent actions across your library and reviews.
        </Text>
        <View style={styles.activityCard}>
          {activityFeed.map((entry) => (
            <ActivityRow key={entry.id} entry={entry} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <Text style={styles.sectionSubtitle}>
          Personalize your experience and data preferences.
        </Text>
        <View style={styles.settingsPanel}>
          {SETTING_DEFS.map((setting) => (
            <SettingRow
              key={setting.key}
              setting={setting}
              value={settings[setting.key]}
              onToggle={() => handleToggleSetting(setting.key)}
              disabled={!isSignedIn && setting.requiresAuth}
            />
          ))}
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkButtonText}>Import / Export Lists</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, !isSignedIn && styles.logoutButtonDisabled]}
        onPress={handleLogout}
        disabled={!isSignedIn}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Profile;

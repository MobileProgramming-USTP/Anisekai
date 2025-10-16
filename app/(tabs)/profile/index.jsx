import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

import styles from "../../../styles/profileStyles";
import { useAuth } from "../../context/AuthContext";
import { useLibrary } from "../../context/LibraryContext";

const PROFILE_TABS = [
  { key: "overview", label: "Overview" },
  { key: "anime", label: "Anime List" },
  { key: "manga", label: "Manga List" },
];

const AVATAR_PLACEHOLDER = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const formatNumber = (value, fractionDigits = 0) => {
  const numeric =
    typeof value === "number" && Number.isFinite(value) ? value : Number(value ?? 0);

  if (!Number.isFinite(numeric)) {
    return "0";
  }

  try {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(numeric);
  } catch (error) {
    const factor = Math.pow(10, fractionDigits);
    return String(Math.round(numeric * factor) / factor);
  }
};

const Profile = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { entries = [], resolveStatusLabel } = useLibrary();

  const [activeTab, setActiveTab] = useState("overview");

  const handleLogout = () => {
    signOut();
    router.replace("/login/login");
  };

  const isSignedIn = Boolean(user);

  const handleEditProfile = () => {
    if (!isSignedIn) {
      router.push("/login/login");
      return;
    }
    router.push("/profile/edit");
  };

  const segregatedEntries = useMemo(() => {
    const anime = [];
    const manga = [];

    entries.forEach((entry) => {
      const scope = (entry?.scope ?? "anime").toLowerCase();
      if (scope === "manga") {
        manga.push(entry);
      } else {
        anime.push(entry);
      }
    });

    return { anime, manga };
  }, [entries]);

  const stats = useMemo(() => {
    const pickScore = (entry) => {
      if (typeof entry?.rating === "number" && Number.isFinite(entry.rating)) {
        return entry.rating;
      }
      const fallbackScore = Number(entry?.score);
      return Number.isFinite(fallbackScore) ? fallbackScore : null;
    };

    const averageScore = (collection) => {
      const values = collection
        .map(pickScore)
        .filter((value) => value != null && Number.isFinite(value));

      if (values.length === 0) {
        return 0;
      }

      const total = values.reduce((acc, value) => acc + value, 0);
      return total / values.length;
    };

    const totalEpisodes = segregatedEntries.anime.reduce(
      (acc, entry) => acc + (entry?.progress?.watchedEpisodes ?? 0),
      0,
    );

    const totalChapters = segregatedEntries.manga.reduce(
      (acc, entry) => acc + (entry?.progress?.readChapters ?? 0),
      0,
    );

    return [
      [
        { label: "Total Animes", value: formatNumber(segregatedEntries.anime.length) },
        { label: "Episodes Watched", value: formatNumber(totalEpisodes) },
        { label: "Total Score", value: formatNumber(averageScore(segregatedEntries.anime), 1) },
      ],
      [
        { label: "Total Manga", value: formatNumber(segregatedEntries.manga.length) },
        { label: "Chapters Read", value: formatNumber(totalChapters) },
        { label: "Total Score", value: formatNumber(averageScore(segregatedEntries.manga), 1) },
      ],
    ];
  }, [segregatedEntries]);

  const activityItems = useMemo(() => {
    if (!entries.length) {
      return [];
    }

    return [...entries]
      .sort((a, b) => (b?.updatedAt ?? 0) - (a?.updatedAt ?? 0))
      .slice(0, 5)
      .map((entry, index) => {
        const scope = (entry?.scope ?? "anime").toLowerCase();
        const isAnime = scope !== "manga";
        const progressValue = isAnime
          ? entry?.progress?.watchedEpisodes ?? 0
          : entry?.progress?.readChapters ?? 0;

        const statusLabel = resolveStatusLabel?.(entry?.status, scope) ?? null;
        const scopeLabel = isAnime ? "Anime" : "Manga";
        const highlight = (entry?.title ?? "Untitled").trim() || "Untitled";
        const normalizedProgress = Number.isFinite(progressValue) ? progressValue : 0;
        const unitLabel = isAnime ? "episode" : "chapter";

        let primaryText;
        if (normalizedProgress > 0) {
          const unitCount = normalizedProgress === 1 ? unitLabel : `${unitLabel}s`;
          primaryText = `${isAnime ? "Watched" : "Read"} ${formatNumber(normalizedProgress)} ${unitCount} of`;
        } else if (statusLabel) {
          primaryText = statusLabel;
        } else {
          primaryText = isAnime ? "Anime update" : "Manga update";
        }

        const metaParts = [];
        if (statusLabel && statusLabel !== primaryText) {
          metaParts.push(statusLabel);
        }
        metaParts.push(scopeLabel);

        return {
          id: `${scope}-${entry?.mal_id ?? entry?.id ?? entry?.title ?? index}`,
          highlight,
          primaryText,
          meta: metaParts.filter(Boolean).join(" | "),
          coverImage: entry?.coverImage ?? null,
        };
      });
  }, [entries, resolveStatusLabel]);

  const renderLibraryCard = (entry, scopeKey) => {
    const isAnime = scopeKey === "anime";
    const progressValue = isAnime
      ? entry?.progress?.watchedEpisodes ?? 0
      : entry?.progress?.readChapters ?? 0;

    const totalValueRaw = isAnime ? entry?.episodes : entry?.chapters;
    const hasTotal = typeof totalValueRaw === "number" && Number.isFinite(totalValueRaw) && totalValueRaw > 0;
    const totalValue = hasTotal ? formatNumber(totalValueRaw) : "--";
    const unit = isAnime ? "eps" : "ch";

    const fallbackInitial =
      String(entry?.title ?? "?")
        .trim()
        .charAt(0)
        .toUpperCase() || "?";

    return (
      <View
        key={`${scopeKey}-${entry?.mal_id ?? entry?.id ?? entry?.title}`}
        style={styles.libraryCard}
      >
        <View style={styles.libraryImageWrapper}>
          {entry?.coverImage ? (
            <Image
              source={{ uri: entry.coverImage }}
              style={styles.libraryImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.libraryImagePlaceholder}>
              <Text style={styles.libraryImagePlaceholderText}>{fallbackInitial}</Text>
            </View>
          )}
        </View>

        <View style={styles.libraryCardBody}>
          <Text style={styles.libraryTitle}>{entry?.title ?? "Untitled"}</Text>
          <Text style={styles.libraryMeta}>
            {resolveStatusLabel?.(entry?.status, entry?.scope) ?? "Status Unknown"} |{" "}
            {formatNumber(progressValue)} / {totalValue} {unit} | {isAnime ? "Anime" : "Manga"}
          </Text>
        </View>
      </View>
    );
  };

  const tabDescriptors = PROFILE_TABS.map((tab) => ({
    ...tab,
    disabled: !isSignedIn && tab.key !== "overview",
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.coverContainer}>
        <View style={styles.coverProfileRow}>
          <TouchableOpacity
            style={[
              styles.avatarFrame,
              !isSignedIn && styles.avatarFrameDisabled,
            ]}
            onPress={handleEditProfile}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={
              isSignedIn ? "Edit profile" : "Sign in to edit your profile"
            }
          >
            <Image
              source={{ uri: user?.avatar ?? AVATAR_PLACEHOLDER }}
              style={styles.avatar}
              resizeMode="cover"
            />
          </TouchableOpacity>

          <View style={styles.profileDetails}>
            <Text style={styles.username}>{user?.username ?? "Guest"}</Text>
            <Text style={styles.email}>
              {user?.email ?? "Sign in to see your profile details"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.tabStrip}>
        {tabDescriptors.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.85}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.tabButtonActive,
              tab.disabled && styles.tabButtonDisabled,
            ]}
            onPress={() => !tab.disabled && setActiveTab(tab.key)}
            disabled={tab.disabled}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && styles.tabLabelActive,
                tab.disabled && styles.tabLabelDisabled,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "overview" && (
        <>
          <View style={styles.statsBlock}>
            {stats.map((row, rowIndex) => (
              <View
                key={`row-${rowIndex}`}
                style={[
                  styles.statRow,
                  rowIndex % 2 === 0 ? styles.statRowPrimary : styles.statRowSecondary,
                  rowIndex === stats.length - 1 && styles.statRowLast,
                ]}
              >
                {row.map((stat, index) => (
                  <View
                    key={stat.label}
                    style={[
                      styles.statSegment,
                      index > 0 && styles.statSegmentDivider,
                    ]}
                  >
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, styles.sectionTitleAccent]}>ACTIVITY</Text>
            <Text style={styles.sectionSubtitle}>
              {activityItems.length
                ? "Latest updates from your library"
                : isSignedIn
                  ? "Recent updates will appear here once you start watching or reading."
                  : "Sign in to start tracking your anime and manga journey."}
            </Text>
          </View>

          {activityItems.length ? (
            <View style={styles.activityList}>
              {activityItems.map((item) => {
                const placeholderInitial =
                  String(item.highlight ?? "?")
                    .trim()
                    .charAt(0)
                    .toUpperCase() || "?";

                return (
                  <View key={item.id} style={styles.activityCard}>
                    <View style={styles.activityImageWrapper}>
                      {item.coverImage ? (
                        <Image
                          source={{ uri: item.coverImage }}
                          style={styles.activityImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.activityPlaceholder}>
                          <Text style={styles.activityPlaceholderText}>{placeholderInitial}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.activityContent}>
                      <View style={styles.activityHeadlineRow}>
                        <Text style={styles.activityHeadline}>{item.primaryText}</Text>
                        {item.highlight ? (
                          <Text style={styles.activityHighlight}> {item.highlight}</Text>
                        ) : null}
                      </View>
                      {item.meta ? <Text style={styles.activityMeta}>{item.meta}</Text> : null}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.activityList}>
              <View style={styles.emptyStateCard}>
                <Text style={styles.emptyStateText}>
                  {isSignedIn
                    ? "No recent activity yet. Start watching or reading to see your updates."
                    : "Sign in to track your activity across anime and manga."}
                </Text>
              </View>
            </View>
          )}
        </>
      )}

      {activeTab === "anime" && (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Anime List</Text>
          {segregatedEntries.anime.length ? (
            segregatedEntries.anime.map((entry) => renderLibraryCard(entry, "anime"))
          ) : (
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyStateText}>
                {isSignedIn
                  ? "Your anime list is empty. Add anime from the Explore tab to start tracking."
                  : "Sign in to build and view your anime list."}
              </Text>
            </View>
          )}
        </View>
      )}

      {activeTab === "manga" && (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Manga List</Text>
          {segregatedEntries.manga.length ? (
            segregatedEntries.manga.map((entry) => renderLibraryCard(entry, "manga"))
          ) : (
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyStateText}>
                {isSignedIn
                  ? "Your manga list is empty. Add manga from the Explore tab to start tracking."
                  : "Sign in to build and view your manga list."}
              </Text>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.logoutButton,
          !isSignedIn && styles.logoutButtonDisabled,
        ]}
        onPress={handleLogout}
        disabled={!isSignedIn}
        activeOpacity={0.85}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Profile;


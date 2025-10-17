import { useCallback, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import styles from "../../../styles/profileStyles";
import { theme } from "../../../styles/theme";
import { useAuth } from "../../context/AuthContext";
import { useLibrary } from "../../context/LibraryContext";

const PROFILE_TABS = [
  { key: "overview", label: "Overview" },
  { key: "anime", label: "Anime List" },
  { key: "manga", label: "Manga List" },
];

const MAX_FAVORITES = 6;
const EMPTY_SET = new Set();

const toFiniteNumber = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed.length) {
      return null;
    }
    const numeric = Number(trimmed);
    return Number.isFinite(numeric) ? numeric : null;
  }

  return null;
};

const getEntryScore = (entry) => {
  const userRating = toFiniteNumber(entry?.rating);
  if (userRating != null) {
    return userRating;
  }

  return toFiniteNumber(entry?.score);
};

const computeScoreMetrics = (collection) => {
  if (!Array.isArray(collection) || !collection.length) {
    return { mean: 0, count: 0 };
  }

  const values = collection
    .map(getEntryScore)
    .filter((value) => typeof value === "number" && Number.isFinite(value));

  if (!values.length) {
    return { mean: 0, count: 0 };
  }

  const total = values.reduce((acc, value) => acc + value, 0);
  const mean = total / values.length;

  return {
    mean: Math.min(100, mean),
    count: values.length,
  };
};

const pickFavoriteEntries = (collection, favoriteIds) => {
  const isValidFavoriteSet =
    favoriteIds instanceof Set && favoriteIds.size > 0;

  if (!Array.isArray(collection) || !collection.length || !isValidFavoriteSet) {
    return [];
  }

  const resolveFavoriteId = (entry) => {
    const primary = entry?.mal_id ?? entry?.id;
    if (typeof primary === "number" && Number.isFinite(primary)) {
      return primary;
    }
    if (typeof primary === "string") {
      const numeric = Number(primary);
      return Number.isFinite(numeric) ? numeric : null;
    }
    return null;
  };

  const filtered = collection.filter((entry) => {
    const favoriteId = resolveFavoriteId(entry);
    return favoriteId != null && favoriteIds.has(favoriteId);
  });

  if (!filtered.length) {
    return [];
  }

  const ranked = filtered
    .map((entry) => ({
      entry,
      score: getEntryScore(entry),
      updatedAt: typeof entry?.updatedAt === "number" ? entry.updatedAt : 0,
    }))
    .sort((a, b) => {
      const scoreA = a.score ?? Number.NEGATIVE_INFINITY;
      const scoreB = b.score ?? Number.NEGATIVE_INFINITY;
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      return (b.updatedAt ?? 0) - (a.updatedAt ?? 0);
    });

  const favorites = [];
  const seen = new Set();

  for (const item of ranked) {
    if (favorites.length >= MAX_FAVORITES) {
      break;
    }

    const favoriteId = resolveFavoriteId(item.entry);
    if (favoriteId == null || seen.has(favoriteId)) {
      continue;
    }

    favorites.push(item.entry);
    seen.add(favoriteId);
  }

  return favorites;
};

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
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const bottomInset = useMemo(() => tabBarHeight + 32, [tabBarHeight]);
  const safeTop = Math.max(insets.top, 0);
  const coverTopStyle = useMemo(() => {
    if (!safeTop) {
      return null;
    }
    return {
      paddingTop: theme.spacing.medium + safeTop,
      marginTop: -safeTop,
    };
  }, [safeTop]);
  const { user, signOut } = useAuth();
  const {
    entries = [],
    resolveStatusLabel,
    statusMeta = {},
    statusOrder = [],
    favoriteEntryIds,
  } = useLibrary();

  const sanitizedAvatar = useMemo(() => {
    const candidate = typeof user?.avatar === "string" ? user.avatar.trim() : "";
    return candidate.length ? candidate : null;
  }, [user?.avatar]);

  const displayName = useMemo(() => {
    const candidate = typeof user?.username === "string" ? user.username.trim() : "";
    return candidate.length ? candidate : "Guest";
  }, [user?.username]);

  const avatarInitial = useMemo(
    () => displayName.charAt(0).toUpperCase(),
    [displayName],
  );

  const favoriteIdsSet = favoriteEntryIds instanceof Set ? favoriteEntryIds : EMPTY_SET;

  const [activeTab, setActiveTab] = useState("overview");

  const sortedEntries = useMemo(() => {
    if (!Array.isArray(entries) || !entries.length) {
      return [];
    }

    return [...entries].sort((a, b) => (b?.updatedAt ?? 0) - (a?.updatedAt ?? 0));
  }, [entries]);

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

    sortedEntries.forEach((entry) => {
      const scope = (entry?.scope ?? "anime").toLowerCase();
      if (scope === "manga") {
        manga.push(entry);
      } else {
        anime.push(entry);
      }
    });

    return { anime, manga };
  }, [sortedEntries]);

  const stats = useMemo(() => {
    const animeScores = computeScoreMetrics(segregatedEntries.anime);
    const mangaScores = computeScoreMetrics(segregatedEntries.manga);
    const totalEpisodes = segregatedEntries.anime.reduce(
      (acc, entry) => acc + (entry?.progress?.watchedEpisodes ?? 0),
      0,
    );

    const totalChapters = segregatedEntries.manga.reduce(
      (acc, entry) => acc + (entry?.progress?.readChapters ?? 0),
      0,
    );

    const formatScoreStat = (metrics) => {
      if (!metrics.count) {
        return "0.0";
      }
      return formatNumber(metrics.mean, 1);
    };

    return [
      [
        { label: "Total Animes", value: formatNumber(segregatedEntries.anime.length) },
        { label: "Episodes Watched", value: formatNumber(totalEpisodes) },
        { label: "Mean Score", value: formatScoreStat(animeScores) },
      ],
      [
        { label: "Total Manga", value: formatNumber(segregatedEntries.manga.length) },
        { label: "Chapters Read", value: formatNumber(totalChapters) },
        { label: "Mean Score", value: formatScoreStat(mangaScores) },
      ],
    ];
  }, [segregatedEntries]);

  const orderedStatusKeys = useMemo(() => {
    if (Array.isArray(statusOrder) && statusOrder.length) {
      return statusOrder;
    }

    return Object.keys(statusMeta ?? {});
  }, [statusMeta, statusOrder]);

  const buildStatusData = useCallback(
    (collection, scopeKey) => {
      if (!Array.isArray(collection) || !collection.length) {
        return { total: 0, barSegments: [], legend: [] };
      }

      const formatStatusName = (value) => {
        if (typeof value !== "string" || !value.length) {
          return "Other";
        }
        return value.charAt(0).toUpperCase() + value.slice(1);
      };

      const counts = new Map();
      collection.forEach((entry) => {
        const rawStatus =
          typeof entry?.status === "string" && entry.status.trim()
            ? entry.status.toLowerCase()
            : "unknown";
        counts.set(rawStatus, (counts.get(rawStatus) ?? 0) + 1);
      });

      const legend = [];

      orderedStatusKeys.forEach((key) => {
        if (!key) {
          return;
        }
        const meta = statusMeta?.[key] ?? {};
        const label =
          resolveStatusLabel?.(key, scopeKey) ?? meta.label ?? formatStatusName(key);
        const color = meta.color ?? "#4C82FF";
        const count = counts.get(key) ?? 0;
        legend.push({ key, label, color, count });
      });

      counts.forEach((count, key) => {
        if (legend.some((item) => item.key === key)) {
          return;
        }

        const label =
          resolveStatusLabel?.(key, scopeKey) ??
          formatStatusName(typeof key === "string" ? key : "Other");

        legend.push({
          key: key ?? "other",
          label,
          color: "#6f7a89",
          count,
        });
      });

      const barSegments = legend.filter((item) => item.count > 0);
      const total = legend.reduce((sum, item) => sum + item.count, 0);

      return { total, barSegments, legend };
    },
    [orderedStatusKeys, resolveStatusLabel, statusMeta],
  );

  const animeStatusData = useMemo(
    () => buildStatusData(segregatedEntries.anime, "anime"),
    [buildStatusData, segregatedEntries.anime],
  );

  const mangaStatusData = useMemo(
    () => buildStatusData(segregatedEntries.manga, "manga"),
    [buildStatusData, segregatedEntries.manga],
  );

  const favoriteAnimeEntries = useMemo(
    () => pickFavoriteEntries(segregatedEntries.anime, favoriteIdsSet),
    [segregatedEntries.anime, favoriteIdsSet],
  );

  const favoriteMangaEntries = useMemo(
    () => pickFavoriteEntries(segregatedEntries.manga, favoriteIdsSet),
    [segregatedEntries.manga, favoriteIdsSet],
  );

  const activityItems = useMemo(() => {
    if (!sortedEntries.length) {
      return [];
    }

    return sortedEntries
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
  }, [resolveStatusLabel, sortedEntries]);

  const renderLibraryCard = (entry, scopeKey, cardIndex = 0) => {
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
        style={[
          styles.libraryCard,
          cardIndex === 0 && styles.libraryCardFirst,
        ]}
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

  const renderFavoriteCard = (entry, index, scopeKey = "anime") => {
    if (!entry) {
      return null;
    }

    const cardKey = `favorite-${entry?.mal_id ?? entry?.id ?? entry?.title ?? index}`;
    const favoriteScore = getEntryScore(entry);
    const statusLabel = resolveStatusLabel?.(entry?.status, scopeKey) ?? null;
    const metaParts = [];
    if (statusLabel) {
      metaParts.push(statusLabel);
    }
    if (favoriteScore != null) {
      metaParts.push(formatNumber(favoriteScore, 1));
    }
    const metaText = metaParts.join(" | ");

    const fallbackInitial =
      String(entry?.title ?? "?")
        .trim()
        .charAt(0)
        .toUpperCase() || "?";

    return (
      <View key={cardKey} style={styles.favoriteCard}>
        {entry?.coverImage ? (
          <Image
            source={{ uri: entry.coverImage }}
            style={styles.favoriteCardImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.favoriteCardImage, styles.favoriteCardPlaceholder]}>
            <Text style={styles.favoriteCardPlaceholderText}>{fallbackInitial}</Text>
          </View>
        )}

        <View style={styles.favoriteCardBody}>
          <Text style={styles.favoriteCardTitle} numberOfLines={2}>
            {entry?.title ?? "Untitled"}
          </Text>
          {metaText ? <Text style={styles.favoriteCardMeta}>{metaText}</Text> : null}
        </View>
      </View>
    );
  };

  const tabDescriptors = PROFILE_TABS.map((tab) => ({
    ...tab,
    disabled: !isSignedIn && tab.key !== "overview",
  }));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
      scrollIndicatorInsets={{ bottom: bottomInset }}
    >
      <View style={[styles.coverBackground, coverTopStyle]}>
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
              {sanitizedAvatar ? (
                <Image source={{ uri: sanitizedAvatar }} style={styles.avatar} resizeMode="cover" />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>{avatarInitial}</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.profileDetails}>
              <Text style={styles.username}>{displayName}</Text>
              <Text style={styles.email}>
                {user?.email ?? "Sign in to see your profile details"}
              </Text>
            </View>
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
            <Text style={[styles.sectionTitle, styles.sectionTitleAccent, styles.sectionTitleUpper]}>
              Activity
            </Text>
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
        <>
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionTitle, styles.sectionTitleAccent, styles.sectionTitleUpper]}>
              Anime Stats
            </Text>
            {animeStatusData.total ? (
              <View style={styles.mediaStatsCard}>
                {animeStatusData.barSegments.length ? (
                  <View style={styles.mediaStatsBar}>
                    {animeStatusData.barSegments.map((segment) => (
                      <View
                        key={`bar-${segment.key}`}
                        style={[
                          styles.mediaStatsBarSegment,
                          { flex: segment.count, backgroundColor: segment.color },
                        ]}
                      />
                    ))}
                  </View>
                ) : (
                  <View style={[styles.mediaStatsBar, styles.mediaStatsBarEmpty]} />
                )}

                <View style={styles.mediaStatsLegend}>
                  {animeStatusData.legend.map((item) => (
                    <View key={`legend-${item.key}`} style={styles.mediaStatsLegendItem}>
                      <View
                        style={[
                          styles.mediaStatsDot,
                          { backgroundColor: item.color },
                        ]}
                      />
                      <Text style={styles.mediaStatsLegendLabel}>{item.label}</Text>
                      <Text style={styles.mediaStatsLegendValue}>{formatNumber(item.count)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.emptyStateCard}>
                <Text style={styles.emptyStateText}>
                  {isSignedIn
                    ? "Add anime to your library to start seeing statistics."
                    : "Sign in and add anime to track your stats."}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionTitle, styles.sectionTitleAccent, styles.sectionTitleUpper]}>
              Favorite Animes
            </Text>
            {favoriteAnimeEntries.length ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.favoritesList}
              >
                {favoriteAnimeEntries.map((entry, index) =>
                  renderFavoriteCard(entry, index, "anime"),
                )}
              </ScrollView>
            ) : (
              <View style={styles.emptyStateCard}>
                <Text style={styles.emptyStateText}>
                  {isSignedIn
                    ? "Mark anime as favorites in your library to see them here."
                    : "Sign in to curate a list of favorite anime."}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionTitle, styles.sectionTitleAccent, styles.sectionTitleUpper]}>
              Anime List
            </Text>
            {segregatedEntries.anime.length ? (
              segregatedEntries.anime.map((entry, index) =>
                renderLibraryCard(entry, "anime", index),
              )
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
        </>
      )}

      {activeTab === "manga" && (
        <>
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionTitle, styles.sectionTitleAccent, styles.sectionTitleUpper]}>
              Manga Stats
            </Text>
            {mangaStatusData.total ? (
              <View style={styles.mediaStatsCard}>
                {mangaStatusData.barSegments.length ? (
                  <View style={styles.mediaStatsBar}>
                    {mangaStatusData.barSegments.map((segment) => (
                      <View
                        key={`bar-${segment.key}`}
                        style={[
                          styles.mediaStatsBarSegment,
                          { flex: segment.count, backgroundColor: segment.color },
                        ]}
                      />
                    ))}
                  </View>
                ) : (
                  <View style={[styles.mediaStatsBar, styles.mediaStatsBarEmpty]} />
                )}

                <View style={styles.mediaStatsLegend}>
                  {mangaStatusData.legend.map((item) => (
                    <View key={`legend-${item.key}`} style={styles.mediaStatsLegendItem}>
                      <View
                        style={[
                          styles.mediaStatsDot,
                          { backgroundColor: item.color },
                        ]}
                      />
                      <Text style={styles.mediaStatsLegendLabel}>{item.label}</Text>
                      <Text style={styles.mediaStatsLegendValue}>{formatNumber(item.count)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.emptyStateCard}>
                <Text style={styles.emptyStateText}>
                  {isSignedIn
                    ? "Add manga to your library to start seeing statistics."
                    : "Sign in and add manga to track your stats."}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionTitle, styles.sectionTitleAccent, styles.sectionTitleUpper]}>
              Favorite Mangas
            </Text>
            {favoriteMangaEntries.length ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.favoritesList}
              >
                {favoriteMangaEntries.map((entry, index) =>
                  renderFavoriteCard(entry, index, "manga"),
                )}
              </ScrollView>
            ) : (
              <View style={styles.emptyStateCard}>
                <Text style={styles.emptyStateText}>
                  {isSignedIn
                    ? "Mark manga as favorites in your library to see them here."
                    : "Sign in to curate a list of favorite manga."}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionTitle, styles.sectionTitleAccent, styles.sectionTitleUpper]}>
              Manga List
            </Text>
            {segregatedEntries.manga.length ? (
              segregatedEntries.manga.map((entry, index) =>
                renderLibraryCard(entry, "manga", index),
              )
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
        </>
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


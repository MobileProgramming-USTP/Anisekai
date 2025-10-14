import { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import styles from "../styles/libraryStyles";

const TAB_DEFS = [
  { key: "watching", label: "Watching", color: "#5b5ff7" },
  { key: "completed", label: "Completed", color: "#4caf50" },
  { key: "plan", label: "Plan to Watch", color: "#fcbf49" },
  { key: "hold", label: "Dropped / On Hold", color: "#e63946" },
];

const LIBRARY_ITEMS = [
  {
    id: "demon-slayer",
    title: "Demon Slayer: Kimetsu no Yaiba",
    poster: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
    episodesWatched: 18,
    totalEpisodes: 26,
    score: 8.6,
    year: 2019,
    genres: ["Action", "Fantasy"],
    studio: "ufotable",
    favoriteCharacters: ["Tanjiro", "Nezuko", "Zenitsu"],
    status: "watching",
    review: "Breath-taking animation and a cast you can't help but cheer for.",
    rating: 9,
    lastTouched: "2025-09-20T12:00:00Z",
  },
  {
    id: "made-in-abyss",
    title: "Made in Abyss",
    poster: "https://cdn.myanimelist.net/images/anime/6/86733.jpg",
    episodesWatched: 13,
    totalEpisodes: 13,
    score: 8.7,
    year: 2017,
    genres: ["Adventure", "Drama"],
    studio: "Kinema Citrus",
    favoriteCharacters: ["Nanachi"],
    status: "completed",
    review: "Hauntingly beautiful with worldbuilding that lingers long after the credits.",
    rating: 10,
    lastTouched: "2025-08-15T18:45:00Z",
  },
  {
    id: "chainsaw-man",
    title: "Chainsaw Man",
    poster: "https://cdn.myanimelist.net/images/anime/1806/126216.jpg",
    episodesWatched: 0,
    totalEpisodes: 12,
    score: 8.6,
    year: 2022,
    genres: ["Action", "Horror"],
    studio: "MAPPA",
    favoriteCharacters: ["Power", "Makima"],
    status: "plan",
    review: "",
    rating: null,
    lastTouched: "2025-09-01T09:30:00Z",
  },
  {
    id: "violet-evergarden",
    title: "Violet Evergarden",
    poster: "https://cdn.myanimelist.net/images/anime/1795/95088.jpg",
    episodesWatched: 9,
    totalEpisodes: 13,
    score: 8.7,
    year: 2018,
    genres: ["Drama", "Slice of Life"],
    studio: "Kyoto Animation",
    favoriteCharacters: ["Violet", "Gilbert"],
    status: "hold",
    review: "Paused because I wasn't ready for more emotional damage - resume soon.",
    rating: 8,
    lastTouched: "2025-07-02T14:12:00Z",
  },
  {
    id: "haikyuu",
    title: "Haikyuu!!",
    poster: "https://cdn.myanimelist.net/images/anime/7/76014.jpg",
    episodesWatched: 60,
    totalEpisodes: 85,
    score: 8.5,
    year: 2014,
    genres: ["Sports", "Comedy"],
    studio: "Production I.G",
    favoriteCharacters: ["Hinata", "Kageyama"],
    status: "watching",
    review: "Peak sports hype - every volley feels like match point.",
    rating: 9,
    lastTouched: "2025-09-21T20:10:00Z",
  },
  {
    id: "mushoku-tensei",
    title: "Mushoku Tensei",
    poster: "https://cdn.myanimelist.net/images/anime/1284/110092.jpg",
    episodesWatched: 12,
    totalEpisodes: 24,
    score: 8.4,
    year: 2021,
    genres: ["Adventure", "Fantasy"],
    studio: "Studio Bind",
    favoriteCharacters: ["Rudeus", "Roxy"],
    status: "plan",
    review: "",
    rating: null,
    lastTouched: "2025-08-31T10:00:00Z",
  },
];

const SORT_OPTIONS = [
  { key: "recent", label: "Recently Updated" },
  { key: "score", label: "Score" },
  { key: "year", label: "Year" },
  { key: "progress", label: "Progress" },
];

const RatingSelector = ({ value, onSelect }) => {
  const choices = [6, 7, 8, 9, 10];

  return (
    <View style={styles.ratingRow}>
      {choices.map((choice) => {
        const isActive = value === choice;
        return (
          <Pressable
            key={choice}
            style={[styles.ratingPill, isActive && styles.ratingPillActive]}
            onPress={() => onSelect(choice)}
          >
            <Text
              style={[styles.ratingPillText, isActive && styles.ratingPillTextActive]}
            >
              {choice}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const ProgressBar = ({ progress, accent }) => (
  <View style={styles.progressTrack}>
    <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: accent }]} />
  </View>
);

const AnimeCard = ({
  anime,
  accent,
  reviewState,
  onEditReview,
  onCancelEdit,
  onSaveReview,
  onReviewChange,
  onRatingChange,
}) => {
  const progress = anime.totalEpisodes
    ? Math.round((anime.episodesWatched / anime.totalEpisodes) * 100)
    : 0;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image source={{ uri: anime.poster }} style={styles.poster} />
        <View style={styles.cardMeta}>
          <Text style={styles.cardTitle}>{anime.title}</Text>
          <Text style={styles.cardSub}>
            {anime.year} | {anime.studio}
          </Text>
          <Text style={styles.cardSub}>Genres: {anime.genres.join(", ")}</Text>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              {anime.episodesWatched}/{anime.totalEpisodes} episodes
            </Text>
            <Text style={[styles.progressPercent, { color: accent }]}>{progress}%</Text>
          </View>
          <ProgressBar progress={progress} accent={accent} />
          <Text style={styles.scoreText}>
            My Rating:{" "}
            {reviewState.rating ? `${reviewState.rating}/10` : "Tap to add a rating"}
          </Text>
          <Text style={styles.scoreText}>Community Score: {anime.score}/10</Text>
        </View>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewLabel}>Review</Text>
        {reviewState.isEditing ? (
          <View>
            <RatingSelector value={reviewState.draftRating} onSelect={onRatingChange} />
            <TextInput
              style={styles.reviewInput}
              multiline
              placeholder="Share your thoughts..."
              placeholderTextColor="#9a9aa1"
              value={reviewState.draftReview}
              onChangeText={onReviewChange}
            />
            <View style={styles.reviewActions}>
              <Pressable style={styles.secondaryButton} onPress={onCancelEdit}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.primaryButton, { backgroundColor: accent }]} onPress={onSaveReview}>
                <Text style={styles.primaryButtonText}>Save Review</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.reviewBody}>
              {reviewState.review?.trim()
                ? reviewState.review
                : "No review yet. Capture what made this title memorable."}
            </Text>
            <Pressable style={styles.addReviewButton} onPress={onEditReview}>
              <Text style={[styles.addReviewText, { color: accent }]}>
                {reviewState.review?.trim() ? "Edit Review" : "Add Review"}
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.tagGroup}>
          <Text style={styles.tagLabel}>Favorite Characters</Text>
          <View style={styles.tagRow}>
            {anime.favoriteCharacters.map((name) => (
              <View key={name} style={styles.tagPill}>
                <Text style={styles.tagText}>{name}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const Library = () => {
  const [activeTab, setActiveTab] = useState("watching");
  const [genreFilter, setGenreFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [sortBy, setSortBy] = useState("recent");
  const [editingId, setEditingId] = useState(null);
  const [draftReview, setDraftReview] = useState("");
  const [draftRating, setDraftRating] = useState(null);
  const [reviews, setReviews] = useState(() => {
    const map = {};
    LIBRARY_ITEMS.forEach((anime) => {
      map[anime.id] = {
        review: anime.review,
        rating: anime.rating,
        lastTouched: anime.lastTouched,
      };
    });
    return map;
  });

  const availableGenres = useMemo(() => {
    const set = new Set();
    LIBRARY_ITEMS.forEach((anime) => {
      anime.genres.forEach((genre) => set.add(genre));
    });
    return ["All", ...Array.from(set).sort()];
  }, []);

  const availableYears = useMemo(() => {
    const years = Array.from(new Set(LIBRARY_ITEMS.map((anime) => anime.year))).sort(
      (a, b) => b - a
    );
    return ["All", ...years];
  }, []);

  const tabAccent = useMemo(
    () => TAB_DEFS.find((tab) => tab.key === activeTab)?.color ?? "#5b5ff7",
    [activeTab]
  );

  const filteredItems = useMemo(() => {
    const base = LIBRARY_ITEMS.filter((anime) => {
      const matchesTab =
        (activeTab === "watching" && anime.status === "watching") ||
        (activeTab === "completed" && anime.status === "completed") ||
        (activeTab === "plan" && anime.status === "plan") ||
        (activeTab === "hold" && anime.status === "hold");

      const matchesGenre =
        genreFilter === "All" || anime.genres.some((genre) => genre === genreFilter);

      const matchesYear = yearFilter === "All" || anime.year === yearFilter;

      return matchesTab && matchesGenre && matchesYear;
    });

    const sorted = [...base].sort((a, b) => {
      if (sortBy === "score") {
        return b.score - a.score;
      }

      if (sortBy === "year") {
        return b.year - a.year;
      }

      if (sortBy === "progress") {
        const progressA = a.totalEpisodes
          ? a.episodesWatched / a.totalEpisodes
          : 0;
        const progressB = b.totalEpisodes
          ? b.episodesWatched / b.totalEpisodes
          : 0;
        return progressB - progressA;
      }

      const dateA = new Date(reviews[a.id]?.lastTouched ?? a.lastTouched ?? 0).getTime();
      const dateB = new Date(reviews[b.id]?.lastTouched ?? b.lastTouched ?? 0).getTime();
      return dateB - dateA;
    });

    return sorted;
  }, [activeTab, genreFilter, yearFilter, sortBy, reviews]);

  const favorites = useMemo(() => {
    const characters = new Set();
    const studios = new Set();

    LIBRARY_ITEMS.forEach((anime) => {
      anime.favoriteCharacters.forEach((character) => characters.add(character));
      studios.add(anime.studio);
    });

    return {
      characters: Array.from(characters).sort(),
      studios: Array.from(studios).sort(),
    };
  }, []);

  const handleStartEdit = (animeId) => {
    setEditingId(animeId);
    setDraftReview(reviews[animeId]?.review ?? "");
    setDraftRating(reviews[animeId]?.rating ?? 8);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setDraftReview("");
    setDraftRating(null);
  };

  const handleSaveReview = (animeId) => {
    setReviews((prev) => ({
      ...prev,
      [animeId]: {
        review: draftReview,
        rating: draftRating,
        lastTouched: new Date().toISOString(),
      },
    }));
    handleCancelEdit();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Library</Text>
        <Text style={styles.pageSubtitle}>
          Curate, track, and celebrate your anime journey in one place.
        </Text>
      </View>

      <View style={styles.tabRow}>
        {TAB_DEFS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <Pressable
              key={tab.key}
              style={[styles.tabPill, isActive && { backgroundColor: tab.color }]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[styles.tabText, isActive && styles.tabTextActive]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.filterPanel}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Genre</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {availableGenres.map((genre) => {
              const isActive = genreFilter === genre;
              return (
                <Pressable
                  key={genre}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setGenreFilter(genre)}
                >
                  <Text
                    style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
                  >
                    {genre}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Year</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {availableYears.map((yearOption) => {
              const isActive = yearFilter === yearOption;
              return (
                <Pressable
                  key={yearOption}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setYearFilter(yearOption)}
                >
                  <Text
                    style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
                  >
                    {yearOption}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Sort By</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {SORT_OPTIONS.map((option) => {
              const isActive = sortBy === option.key;
              return (
                <Pressable
                  key={option.key}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setSortBy(option.key)}
                >
                  <Text
                    style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {TAB_DEFS.find((tab) => tab.key === activeTab)?.label ?? "Library"} (
          {filteredItems.length})
        </Text>
        <Text style={styles.sectionSubtitle}>
          Keep tabs on your progress, impressions, and favorites.
        </Text>
      </View>

      {filteredItems.map((anime) => {
        const reviewEntry = reviews[anime.id] ?? { review: "", rating: null };
        const reviewState = {
          review: reviewEntry.review,
          rating: reviewEntry.rating,
          draftReview: editingId === anime.id ? draftReview : reviewEntry.review,
          draftRating: editingId === anime.id ? draftRating : reviewEntry.rating,
          isEditing: editingId === anime.id,
        };

        return (
          <AnimeCard
            key={anime.id}
            anime={anime}
            accent={tabAccent}
            reviewState={reviewState}
            onEditReview={() => handleStartEdit(anime.id)}
            onCancelEdit={handleCancelEdit}
            onSaveReview={() => handleSaveReview(anime.id)}
            onReviewChange={setDraftReview}
            onRatingChange={setDraftRating}
          />
        );
      })}

      {!filteredItems.length && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptyCopy}>
            Add titles to this category or adjust your filters to see more results.
          </Text>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Favorites Spotlight</Text>
        <Text style={styles.sectionSubtitle}>
          Characters and studios that appear most in your library.
        </Text>
      </View>

      <View style={styles.favoritesGrid}>
        <View style={styles.favoriteColumn}>
          <Text style={styles.favoriteLabel}>Characters</Text>
          {favorites.characters.map((name) => (
            <Text key={name} style={styles.favoriteItem}>
              - {name}
            </Text>
          ))}
        </View>
        <View style={styles.favoriteColumn}>
          <Text style={styles.favoriteLabel}>Studios</Text>
          {favorites.studios.map((studio) => (
            <Text key={studio} style={styles.favoriteItem}>
              - {studio}
            </Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default Library;

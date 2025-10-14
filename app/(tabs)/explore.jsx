import { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import styles from "../styles/exploreStyles";

const FILTERS = ["All", "Action", "Romance", "Comedy", "Sci-Fi", "Drama", "Fantasy"];

const WATCHLIST_SEED = {
  title: "Starlit Odyssey",
  tags: ["Space Opera", "Found Family", "Slow Burn Romance"],
};

const SECTION_DATA = [
  {
    key: "topRated",
    title: "Top Rated",
    subtitle: "Powered by AniList community scores",
    data: [
      {
        id: "fmab",
        title: "Fullmetal Alchemist: Brotherhood",
        poster:
          "https://cdn.myanimelist.net/images/anime/1208/94745.jpg",
        rating: "9.2",
        genres: ["Action", "Drama"],
        synopsis:
          "Two brothers risk everything in search of the Philosopher's Stone and redemption.",
      },
      {
        id: "aot",
        title: "Attack on Titan Final Season",
        poster:
          "https://cdn.myanimelist.net/images/anime/1734/117255.jpg",
        rating: "9.0",
        genres: ["Action", "Drama"],
        synopsis:
          "Eren's war for freedom ignites a global conflict that challenges every alliance.",
      },
      {
        id: "mob",
        title: "Mob Psycho 100 III",
        poster:
          "https://cdn.myanimelist.net/images/anime/1017/128886.jpg",
        rating: "8.8",
        genres: ["Action", "Comedy"],
        synopsis:
          "Mob confronts adulthood, the supernatural, and his own growing power.",
      },
    ],
  },
  {
    key: "currentlyAiring",
    title: "Currently Airing",
    subtitle: "Catch new episodes dropping this week",
    data: [
      {
        id: "jjk",
        title: "Jujutsu Kaisen S2",
        poster:
          "https://cdn.myanimelist.net/images/anime/1015/138006.jpg",
        rating: "8.7",
        genres: ["Action", "Fantasy"],
        synopsis:
          "Sorcerers battle curses as Shibuya descends into chaos.",
      },
      {
        id: "frieren",
        title: "Frieren: Beyond Journey's End",
        poster:
          "https://cdn.myanimelist.net/images/anime/1561/138701.jpg",
        rating: "8.9",
        genres: ["Fantasy", "Drama"],
        synopsis:
          "An elven mage retraces a legendary quest to understand what it means to be human.",
      },
      {
        id: "apothecary",
        title: "The Apothecary Diaries",
        poster:
          "https://cdn.myanimelist.net/images/anime/1286/138611.jpg",
        rating: "8.6",
        genres: ["Drama", "Romance"],
        synopsis:
          "Maomao's sharp wit unravels mysteries inside the imperial palace.",
      },
    ],
  },
  {
    key: "upcoming",
    title: "Upcoming Releases",
    subtitle: "Mark your calendar and prep the snacks",
    data: [
      {
        id: "solo-leveling-arise",
        title: "Solo Leveling: Arise",
        poster:
          "https://cdn.myanimelist.net/images/anime/1171/138216.jpg",
        genres: ["Action", "Fantasy"],
        synopsis:
          "Sung Jinwoo returns in a cinematic adaptation of the hit webtoon.",
        releaseDate: "2025-10-15T03:00:00Z",
      },
      {
        id: "haikyuu-dawn",
        title: "Haikyuu!!: Dawn of the Crows",
        poster:
          "https://cdn.myanimelist.net/images/anime/1792/138463.jpg",
        genres: ["Sports", "Comedy"],
        synopsis:
          "Karasuno faces their toughest rivals on the world stage.",
        releaseDate: "2025-12-05T15:00:00Z",
      },
      {
        id: "garden",
        title: "The Secret Garden of Aria",
        poster:
          "https://cdn.myanimelist.net/images/anime/1681/138544.jpg",
        genres: ["Fantasy", "Romance"],
        synopsis:
          "A botanist uncovers a hidden realm where dreams cultivate reality.",
        releaseDate: "2026-01-20T09:00:00Z",
      },
    ],
  },
  {
    key: "hiddenGems",
    title: "Hidden Gems",
    subtitle: "Critics' darlings that slipped under the radar",
    data: [
      {
        id: "odd-taxi",
        title: "Odd Taxi",
        poster:
          "https://cdn.myanimelist.net/images/anime/1175/113320.jpg",
        genres: ["Drama", "Mystery"],
        synopsis:
          "A deadpan taxi driver navigates a city of secrets with a noir twist.",
      },
      {
        id: "sonny-boy",
        title: "Sonny Boy",
        poster:
          "https://cdn.myanimelist.net/images/anime/1022/116195.jpg",
        genres: ["Sci-Fi", "Drama"],
        synopsis:
          "Drifting students explore realities shaped by their own desires.",
      },
      {
        id: "eizouken",
        title: "Keep Your Hands Off Eizouken!",
        poster:
          "https://cdn.myanimelist.net/images/anime/1983/110512.jpg",
        genres: ["Comedy", "Drama"],
        synopsis:
          "Three creative misfits build worlds that blur fiction and reality.",
      },
    ],
  },
  {
    key: "becauseYouWatched",
    title: `Because You Watched ${WATCHLIST_SEED.title}`,
    subtitle: `Curated for fans of ${WATCHLIST_SEED.tags.join(", ")}`,
    data: [
      {
        id: "violet-evergarden",
        title: "Violet Evergarden",
        poster:
          "https://cdn.myanimelist.net/images/anime/1795/95088.jpg",
        genres: ["Drama", "Romance"],
        synopsis:
          "A former soldier learns to translate emotions into letters for others.",
      },
      {
        id: "ascendance",
        title: "Ascendance of a Bookworm",
        poster:
          "https://cdn.myanimelist.net/images/anime/1762/102303.jpg",
        genres: ["Fantasy", "Slice of Life"],
        synopsis:
          "A book-loving girl rebuilds literature from scratch in a new world.",
      },
      {
        id: "hoshiai",
        title: "Stars Align",
        poster:
          "https://cdn.myanimelist.net/images/anime/1099/103374.jpg",
        genres: ["Drama", "Sports"],
        synopsis:
          "A middle-school team fights for more than victory on the court.",
      },
    ],
  },
];

const formatCountdown = (releaseDate, now) => {
  const release = new Date(releaseDate);
  const diff = release.getTime() - now.getTime();

  if (Number.isNaN(release.getTime())) {
    return "Date TBA";
  }

  if (diff <= 0) {
    return "Now Streaming";
  }

  const minutes = Math.floor(diff / (1000 * 60));
  const days = Math.floor(minutes / (60 * 24));
  const hours = Math.floor((minutes % (60 * 24)) / 60);
  const mins = minutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }

  return `${mins}m`;
};

const AnimeCard = ({ anime, onAddToLibrary }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const showDetails = isHovered || isExpanded;

  return (
    <Pressable
      style={styles.card}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      onPress={() => setIsExpanded((prev) => !prev)}
    >
      <Image source={{ uri: anime.poster }} style={styles.poster} />

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {anime.title}
        </Text>
        {anime.rating && (
          <Text style={styles.cardMeta}>⭐ {anime.rating}</Text>
        )}
        {anime.countdown && (
          <View style={styles.countdownPill}>
            <Text style={styles.countdownText}>{anime.countdown}</Text>
          </View>
        )}
      </View>

      {showDetails && (
        <View style={styles.cardOverlay}>
          <Text style={styles.synopsis} numberOfLines={5}>
            {anime.synopsis}
          </Text>
          <View style={styles.tagRow}>
            {anime.genres.map((genre) => (
              <View key={genre} style={styles.genreTag}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </View>
          <Pressable
            style={styles.addButton}
            onPress={() => onAddToLibrary?.(anime)}
          >
            <Text style={styles.addButtonText}>Add to Library</Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
};

const SectionCarousel = ({ title, subtitle, data, onAddToLibrary }) => {
  if (!data.length) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContent}
      >
        {data.map((anime) => (
          <AnimeCard
            key={anime.id}
            anime={anime}
            onAddToLibrary={onAddToLibrary}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeGenre, setActiveGenre] = useState("All");
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const tick = setInterval(() => setClock(new Date()), 60000);
    return () => clearInterval(tick);
  }, []);

  const lowercaseSearch = searchTerm.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    return SECTION_DATA.map((section) => {
      const filtered = section.data
        .filter((anime) => {
          const matchesGenre =
            activeGenre === "All" || anime.genres.includes(activeGenre);
          const matchesSearch =
            !lowercaseSearch ||
            anime.title.toLowerCase().includes(lowercaseSearch) ||
            (anime.synopsis && anime.synopsis.toLowerCase().includes(lowercaseSearch));

          return matchesGenre && matchesSearch;
        })
        .map((anime) =>
          section.key === "upcoming"
            ? {
                ...anime,
                countdown: formatCountdown(anime.releaseDate, clock),
              }
            : anime
        );

      return {
        ...section,
        data: filtered,
      };
    });
  }, [activeGenre, lowercaseSearch, clock]);

  const resultsCount = useMemo(
    () => filteredSections.reduce((acc, section) => acc + section.data.length, 0),
    [filteredSections]
  );

  const handleAddToLibrary = (anime) => {
    console.log(`Add to library: ${anime.title}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.filterBar}>
        <View style={styles.searchBox}>
          <Text style={styles.searchLabel}>Search</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Find titles, studios, or vibes..."
            placeholderTextColor="#aaaaaa"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChips}
        >
          {FILTERS.map((filter) => {
            const isActive = filter === activeGenre;

            return (
              <Pressable
                key={filter}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setActiveGenre(filter)}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Explore Page</Text>
        <Text style={styles.summaryCopy}>
          Curated around what's trending, airing, and tailored to your watch habits.
        </Text>
        <Text style={styles.summaryMetrics}>
          Showing {resultsCount} picks across {filteredSections.length} sections
        </Text>
      </View>

      {filteredSections.map((section) => (
        <SectionCarousel
          key={section.key}
          title={section.title}
          subtitle={section.subtitle}
          data={section.data}
          onAddToLibrary={handleAddToLibrary}
        />
      ))}

      {!resultsCount && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No matches yet</Text>
          <Text style={styles.emptyCopy}>
            Try another search term or filter to discover more anime gems.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default Explore;

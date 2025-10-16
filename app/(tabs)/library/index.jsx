import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useLibrary } from '../../context/LibraryContext';

const SCOPE_OPTIONS = [
  { label: 'Anime', value: 'anime' },
  { label: 'Manga', value: 'manga' },
];

const PREVIEW_COUNT = 10;
const VIEW_ALL_BUTTON_THRESHOLD = 3;

const resolveEntryCoverImage = (entry) =>
  entry?.coverImage ||
  entry?.raw?.images?.jpg?.large_image_url ||
  entry?.raw?.images?.jpg?.image_url ||
  entry?.raw?.images?.webp?.large_image_url ||
  entry?.raw?.images?.webp?.image_url ||
  entry?.raw?.image_url ||
  entry?.raw?.pictures?.[0]?.jpg?.large_image_url ||
  entry?.raw?.pictures?.[0]?.jpg?.image_url ||
  null;

const LibraryMediaCard = ({ entry, variant = 'carousel', onPress }) => {
  const imageUrl = resolveEntryCoverImage(entry);
  const cardStyle = variant === 'grid' ? styles.gridCard : styles.carouselCard;
  const imageStyle =
    variant === 'grid' ? styles.gridCardImage : styles.carouselCardImage;

  return (
    <Pressable
      style={cardStyle}
      onPress={onPress}
      disabled={!onPress}
      hitSlop={6}
    >
      {imageUrl ? (
        <ExpoImage
          source={{ uri: imageUrl }}
          style={imageStyle}
          contentFit="cover"
          transition={180}
          cachePolicy="memory-disk"
        />
      ) : (
        <View style={[imageStyle, styles.cardImageFallback]}>
          <Ionicons name="image-outline" size={28} color="#6f7a89" />
        </View>
      )}
      <Text style={styles.cardTitle} numberOfLines={2}>
        {entry?.title || 'Untitled'}
      </Text>
    </Pressable>
  );
};

const LibraryScreen = () => {
  const {
    entries: libraryEntries,
    statusMeta: libraryStatusMeta,
    statusOrder: libraryStatusOrder,
    resolveStatusLabel: resolveLibraryStatusLabel,
    updateEntryStatus,
    removeEntry,
    updateEntryProgress,
    updateEntryRating,
    defaultStatus: libraryDefaultStatus,
    toggleFavoriteEntry,
    isFavoriteEntry,
  } = useLibrary();

  const statusMeta = libraryStatusMeta || {};
  const statusOrder = useMemo(
    () => (Array.isArray(libraryStatusOrder) ? libraryStatusOrder : []),
    [libraryStatusOrder]
  );
  const entries = useMemo(
    () => (Array.isArray(libraryEntries) ? libraryEntries : []),
    [libraryEntries]
  );

  const [activeScope, setActiveScope] = useState(SCOPE_OPTIONS[0].value);
  const [scopeMenuOpen, setScopeMenuOpen] = useState(false);
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [selectedStatusKey, setSelectedStatusKey] = useState(null);
  const [viewAllStatusKey, setViewAllStatusKey] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [statusPickerVisible, setStatusPickerVisible] = useState(false);
  const [statusSelection, setStatusSelection] = useState(null);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [progressInputValue, setProgressInputValue] = useState('');
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [ratingInputValue, setRatingInputValue] = useState('');

  const activeScopeLabel = useMemo(
    () => SCOPE_OPTIONS.find((option) => option.value === activeScope)?.label ?? 'Anime',
    [activeScope]
  );

  const closeScopeMenu = useCallback(() => setScopeMenuOpen(false), []);

  const scopedEntries = useMemo(
    () => entries.filter((entry) => entry?.scope === activeScope),
    [entries, activeScope]
  );

  const searchFilteredEntries = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return scopedEntries;
    }

    return scopedEntries.filter((entry) =>
      entry?.title?.toLowerCase().includes(normalizedQuery)
    );
  }, [scopedEntries, searchQuery]);

  const selectedEntry = useMemo(() => {
    if (selectedEntryId == null) {
      return null;
    }

    return (
      entries.find((entry) => entry?.id === selectedEntryId) ?? null
    );
  }, [entries, selectedEntryId]);

  const selectedEntryScope = selectedEntry?.scope || null;
  const selectedEntryMalId =
    typeof selectedEntry?.mal_id === 'number' ? selectedEntry.mal_id : null;

  const isSelectedFavorite = useMemo(
    () => (selectedEntryMalId != null ? isFavoriteEntry(selectedEntryMalId) : false),
    [isFavoriteEntry, selectedEntryMalId]
  );

  const sectionsByStatus = useMemo(() => {
    const grouped = statusOrder.reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {});

    searchFilteredEntries.forEach((entry) => {
      const key = entry?.status;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(entry);
    });

    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => (b?.updatedAt ?? 0) - (a?.updatedAt ?? 0));
    });

    return grouped;
  }, [statusOrder, searchFilteredEntries]);

  const baseStatusKeys = viewAllStatusKey ? [viewAllStatusKey] : selectedStatusKey
    ? [selectedStatusKey]
    : statusOrder;

  const sectionsToRender = baseStatusKeys.filter(
    (statusKey) => (sectionsByStatus[statusKey]?.length ?? 0) > 0
  );

  const totalVisibleEntries = sectionsToRender.reduce(
    (acc, key) => acc + (sectionsByStatus[key]?.length ?? 0),
    0
  );

  const hasAnyInScope = scopedEntries.length > 0;
  const showEmptyLibrary = !hasAnyInScope;
  const showEmptyFiltered = hasAnyInScope && totalVisibleEntries === 0;

  const handleScopeChange = (nextScope) => {
    if (nextScope === activeScope) {
      closeScopeMenu();
      return;
    }

    setActiveScope(nextScope);
    closeScopeMenu();
    setSelectedStatusKey(null);
    setViewAllStatusKey(null);
    setSearchQuery('');
    setStatusFilterOpen(false);
  };

  const handleStatusSelect = (statusKey) => {
    if (statusKey && statusKey === selectedStatusKey) {
      setSelectedStatusKey(null);
      setViewAllStatusKey(null);
      return;
    }

    setSelectedStatusKey(statusKey);
    setViewAllStatusKey(statusKey || null);
  };

  const handleViewAllPress = (statusKey) => {
    if (!statusKey) {
      return;
    }

    closeScopeMenu();
    setStatusFilterOpen(false);
    setViewAllStatusKey((prev) => (prev === statusKey ? null : statusKey));
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setViewAllStatusKey(null);
  };

  const filterIconActive = statusFilterOpen || Boolean(selectedStatusKey);
  const statusChipsVisible =
    (statusFilterOpen || selectedStatusKey) && statusOrder.length > 0;

  useEffect(() => {
    if (!viewAllStatusKey) {
      return;
    }

    const entriesForViewAll = sectionsByStatus[viewAllStatusKey];
    if (!Array.isArray(entriesForViewAll) || entriesForViewAll.length === 0) {
      setViewAllStatusKey(null);
    }
  }, [viewAllStatusKey, sectionsByStatus]);

  useEffect(() => {
    if (selectedEntryId == null) {
      return;
    }

    if (!selectedEntry) {
      setSelectedEntryId(null);
    }
  }, [selectedEntryId, selectedEntry]);

  const handleEntrySelect = useCallback(
    (entry) => {
      if (!entry?.id && !entry?.mal_id) {
        return;
      }

      closeScopeMenu();
      setStatusFilterOpen(false);
      setSelectedStatusKey(null);
      setViewAllStatusKey(null);
      setSelectedEntryId(entry.id ?? entry.mal_id);
    },
    [closeScopeMenu]
  );

  const handleCloseDetail = useCallback(() => {
    setSelectedEntryId(null);
    setStatusPickerVisible(false);
    setStatusSelection(null);
    setProgressModalVisible(false);
    setProgressInputValue('');
    setRatingModalVisible(false);
    setRatingInputValue('');
  }, []);

  const selectedStatusMeta =
    (selectedEntry?.status && statusMeta[selectedEntry.status]) || {};

  const selectedStatusLabel = selectedEntry?.status
    ? resolveLibraryStatusLabel?.(selectedEntry.status, selectedEntry.scope) ||
      selectedEntry.status
    : null;

  const detailCoverImage = selectedEntry
    ? resolveEntryCoverImage(selectedEntry)
    : null;

  const isAnimeDetail = selectedEntryScope === 'anime';
  const isMangaDetail = selectedEntryScope === 'manga';

  const detailProgressState =
    selectedEntry?.progress && typeof selectedEntry.progress === 'object'
      ? selectedEntry.progress
      : { watchedEpisodes: 0, readChapters: 0 };

  const totalCountRaw = isAnimeDetail
    ? selectedEntry?.episodes
    : isMangaDetail
    ? selectedEntry?.chapters
    : null;

  const totalCount =
    typeof totalCountRaw === 'number' && Number.isFinite(totalCountRaw)
      ? totalCountRaw
      : null;

  const currentProgressRaw = isAnimeDetail
    ? detailProgressState.watchedEpisodes
    : isMangaDetail
    ? detailProgressState.readChapters
    : null;

  const currentProgress =
    typeof currentProgressRaw === 'number' && Number.isFinite(currentProgressRaw)
      ? currentProgressRaw
      : 0;

  const progressUnit = isAnimeDetail ? 'EP' : isMangaDetail ? 'CH' : '';
  const progressChipText = `${currentProgress} / ${
    totalCount != null ? totalCount : '?'
  }${progressUnit ? ` ${progressUnit}` : ''}`;

  const personalRating =
    typeof selectedEntry?.rating === 'number' && Number.isFinite(selectedEntry.rating)
      ? selectedEntry.rating
      : null;

  const baseScore =
    typeof selectedEntry?.score === 'number' && Number.isFinite(selectedEntry.score)
      ? selectedEntry.score
      : null;

  const ratingChipValue =
    personalRating != null
      ? personalRating.toFixed(1)
      : baseScore != null
      ? baseScore.toFixed(1)
      : null;

  const ratingChipText =
    ratingChipValue != null ? `${ratingChipValue} / 10.0` : '? / 10.0';

  const statusChipAccent = selectedStatusMeta.color || '#4C82FF';
  const favoriteChipText = isSelectedFavorite ? 'Favorited' : 'Add to favorites';

  const rawDetail = selectedEntry?.raw || {};
  const studioNames = Array.isArray(rawDetail?.studios)
    ? rawDetail.studios.map((studio) => studio?.name).filter(Boolean)
    : [];
  const authorNames = Array.isArray(rawDetail?.authors)
    ? rawDetail.authors.map((author) => author?.name).filter(Boolean)
    : [];
  const creatorsList = isAnimeDetail
    ? studioNames
    : isMangaDetail
    ? authorNames
    : [];
  const creatorsText =
    Array.isArray(creatorsList) && creatorsList.length > 0
      ? creatorsList.join(', ')
      : null;

  const airingStatusText =
    typeof rawDetail?.status === 'string' && rawDetail.status
      ? rawDetail.status
      : 'Status Unknown';

  const lengthText =
    totalCount != null
      ? `${totalCount} ${
          isAnimeDetail ? 'episodes' : isMangaDetail ? 'chapters' : 'entries'
        }`
      : isAnimeDetail
      ? 'Episodes unknown'
      : isMangaDetail
      ? 'Chapters unknown'
      : null;

  const libraryStatusText = selectedStatusLabel
    ? `In Library (${selectedStatusLabel})`
    : 'In Library';

  const baseScoreText =
    baseScore != null ? `${baseScore.toFixed(1)} / 10` : 'Not rated';

  const combinedGenres = [
    ...(Array.isArray(rawDetail?.genres) ? rawDetail.genres : []),
    ...(Array.isArray(rawDetail?.themes) ? rawDetail.themes : []),
    ...(Array.isArray(rawDetail?.demographics) ? rawDetail.demographics : []),
  ];
  const genreNames = combinedGenres
    .map((genre) => genre?.name)
    .filter((name) => typeof name === 'string' && name.length > 0);
  const detailGenres = Array.from(new Set(genreNames));

  const synopsisRaw =
    typeof rawDetail?.synopsis === 'string' ? rawDetail.synopsis.trim() : '';
  const synopsisText =
    synopsisRaw.length > 0
      ? synopsisRaw.replace(/\r?\n/g, '\n\n')
      : 'No summary available.';

  const handleOpenStatusPicker = useCallback(() => {
    if (!selectedEntry) {
      return;
    }

    setStatusSelection(selectedEntry.status || libraryDefaultStatus || null);
    setStatusPickerVisible(true);
  }, [selectedEntry, libraryDefaultStatus]);

  const closeStatusPicker = useCallback(() => {
    setStatusPickerVisible(false);
    setStatusSelection(null);
  }, []);

  const handleConfirmStatusSelection = useCallback(() => {
    if (!selectedEntry) {
      closeStatusPicker();
      return;
    }

    const resolvedStatus =
      statusSelection || selectedEntry.status || libraryDefaultStatus;

    if (!resolvedStatus) {
      closeStatusPicker();
      return;
    }

    updateEntryStatus(selectedEntry.mal_id, resolvedStatus);
    closeStatusPicker();
  }, [
    selectedEntry,
    statusSelection,
    libraryDefaultStatus,
    updateEntryStatus,
    closeStatusPicker,
  ]);

  const handleRemoveSelectedEntry = useCallback(() => {
    if (!selectedEntry) {
      closeStatusPicker();
      return;
    }

    removeEntry(selectedEntry.mal_id);
    closeStatusPicker();
    handleCloseDetail();
  }, [selectedEntry, removeEntry, closeStatusPicker, handleCloseDetail]);

  const handleOpenProgressModal = useCallback(() => {
    if (!selectedEntry) {
      return;
    }

    setProgressInputValue(String(currentProgress));
    setProgressModalVisible(true);
  }, [selectedEntry, currentProgress]);

  const closeProgressModal = useCallback(() => {
    setProgressModalVisible(false);
    setProgressInputValue('');
  }, []);

  const adjustProgressInput = useCallback(
    (delta) => {
      setProgressInputValue((prev) => {
        const numeric = Number(prev);
        const base =
          Number.isFinite(numeric) && numeric >= 0 ? Math.floor(numeric) : 0;
        const next = base + delta;
        const sanitized = next < 0 ? 0 : next;
        const capped =
          totalCount != null ? Math.min(totalCount, sanitized) : sanitized;
        return String(capped);
      });
    },
    [totalCount]
  );

  const handleSubmitProgress = useCallback(() => {
    if (!selectedEntry) {
      closeProgressModal();
      return;
    }

    const progressType = isMangaDetail ? 'chapters' : 'episodes';
    const numericValue = Number(progressInputValue);
    const baseValue =
      Number.isFinite(numericValue) && numericValue >= 0
        ? Math.floor(numericValue)
        : 0;
    const cappedValue =
      totalCount != null ? Math.min(totalCount, baseValue) : baseValue;

    updateEntryProgress(selectedEntry.mal_id, cappedValue, progressType);
    closeProgressModal();
  }, [
    selectedEntry,
    progressInputValue,
    isMangaDetail,
    totalCount,
    updateEntryProgress,
    closeProgressModal,
  ]);

  const handleResetProgress = useCallback(() => {
    if (!selectedEntry) {
      return;
    }

    const progressType = isMangaDetail ? 'chapters' : 'episodes';
    updateEntryProgress(selectedEntry.mal_id, 0, progressType);
    setProgressInputValue('0');
  }, [selectedEntry, isMangaDetail, updateEntryProgress]);

  const handleOpenRatingModal = useCallback(() => {
    if (!selectedEntry) {
      return;
    }

    const initialValue =
      personalRating != null
        ? personalRating.toFixed(1)
        : baseScore != null
        ? baseScore.toFixed(1)
        : '';

    setRatingInputValue(initialValue);
    setRatingModalVisible(true);
  }, [selectedEntry, personalRating, baseScore]);

  const closeRatingModal = useCallback(() => {
    setRatingModalVisible(false);
    setRatingInputValue('');
  }, []);

  const handleSubmitRating = useCallback(() => {
    if (!selectedEntry) {
      closeRatingModal();
      return;
    }

    const numericValue = Number(ratingInputValue);
    if (!Number.isFinite(numericValue) || numericValue < 0) {
      updateEntryRating(selectedEntry.mal_id, null);
      closeRatingModal();
      return;
    }

    const clamped = Math.min(
      10,
      Math.max(0, Math.round(numericValue * 10) / 10)
    );
    updateEntryRating(selectedEntry.mal_id, clamped);
    closeRatingModal();
  }, [selectedEntry, ratingInputValue, updateEntryRating, closeRatingModal]);

  const handleClearRating = useCallback(() => {
    if (!selectedEntry) {
      closeRatingModal();
      return;
    }

    updateEntryRating(selectedEntry.mal_id, null);
    setRatingInputValue('');
    closeRatingModal();
  }, [selectedEntry, updateEntryRating, closeRatingModal]);

  const handleToggleFavorite = useCallback(() => {
    if (selectedEntryMalId == null) {
      return;
    }

    toggleFavoriteEntry(selectedEntryMalId);
  }, [selectedEntryMalId, toggleFavoriteEntry]);

  const renderSection = (statusKey) => {
    const entriesForStatus = sectionsByStatus[statusKey] ?? [];
    if (entriesForStatus.length === 0) {
      return null;
    }

    const statusInfo = statusMeta[statusKey] || {};
    const statusLabel =
      resolveLibraryStatusLabel?.(statusKey, activeScope) ||
      statusInfo.label ||
      statusKey;
    const showingAll = viewAllStatusKey === statusKey;
    const visibleCount = showingAll
      ? entriesForStatus.length
      : Math.min(PREVIEW_COUNT, entriesForStatus.length);
    const sectionData = entriesForStatus.slice(0, visibleCount);

    return (
      <View style={styles.sectionContainer} key={statusKey}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View
              style={[
                styles.sectionStatusDot,
                { backgroundColor: statusInfo.color || '#fcbf49' },
              ]}
            />
            <Text style={styles.sectionTitle}>
              {statusLabel.toUpperCase()}
            </Text>
          </View>
          {entriesForStatus.length >= VIEW_ALL_BUTTON_THRESHOLD || showingAll ? (
            <Pressable onPress={() => handleViewAllPress(statusKey)} hitSlop={6}>
              <Text style={styles.sectionActionText}>
                {showingAll ? 'Back' : 'View All'}
              </Text>
            </Pressable>
          ) : null}
        </View>

        {showingAll ? (
          <FlatList
            data={sectionData}
            key={`${statusKey}-grid`}
            numColumns={2}
            scrollEnabled={false}
            keyExtractor={(item, index) =>
              item?.id != null ? item.id.toString() : `${statusKey}-${index}`
            }
            renderItem={({ item }) => (
              <LibraryMediaCard
                entry={item}
                variant="grid"
                onPress={() => handleEntrySelect(item)}
              />
            )}
            contentContainerStyle={styles.gridList}
            columnWrapperStyle={styles.gridListRow}
          />
        ) : (
          <FlatList
            data={sectionData}
            key={`${statusKey}-carousel`}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) =>
              item?.id != null ? item.id.toString() : `${statusKey}-${index}`
            }
            renderItem={({ item }) => (
              <LibraryMediaCard
                entry={item}
                onPress={() => handleEntrySelect(item)}
              />
            )}
            contentContainerStyle={styles.carouselContent}
          />
        )}
      </View>
    );
  };

  return (
    <>
      <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      onScrollBeginDrag={closeScopeMenu}
      onMomentumScrollBegin={closeScopeMenu}
    >
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Library</Text>
        <View style={styles.scopeDropdownContainer}>
          <Pressable
            style={[
              styles.scopeButton,
              scopeMenuOpen && styles.scopeButtonActive,
            ]}
            onPress={() => setScopeMenuOpen((prev) => !prev)}
            hitSlop={8}
          >
            <Text style={styles.scopeButtonLabel}>{activeScopeLabel}</Text>
            <Ionicons
              name={scopeMenuOpen ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#A5B2C2"
            />
          </Pressable>
          {scopeMenuOpen && (
            <View style={styles.scopeMenu}>
              {SCOPE_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.scopeMenuItem,
                    option.value === activeScope && styles.scopeMenuItemActive,
                  ]}
                  onPress={() => handleScopeChange(option.value)}
                  hitSlop={6}
                >
                  <Text
                    style={[
                      styles.scopeMenuItemLabel,
                      option.value === activeScope && styles.scopeMenuItemLabelActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={18} color="#6f7a89" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={closeScopeMenu}
            placeholder="Search your library"
            placeholderTextColor="#6f7a89"
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery ? (
            <Pressable onPress={handleClearSearch} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#6f7a89" />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          style={[
            styles.filterButton,
            filterIconActive && styles.filterButtonActive,
          ]}
          onPress={() => {
            closeScopeMenu();
            setStatusFilterOpen((prev) => !prev);
          }}
          hitSlop={8}
        >
          <Ionicons
            name="options"
            size={20}
            color={filterIconActive ? '#fcbf49' : '#A5B2C2'}
          />
        </Pressable>
      </View>

      {statusChipsVisible && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statusChipsContainer}
          contentContainerStyle={styles.statusChipsContent}
        >
          <Pressable
            key="status-all"
            style={[
              styles.statusChip,
              !selectedStatusKey && styles.statusChipActive,
            ]}
            onPress={() => handleStatusSelect(null)}
            hitSlop={6}
          >
            <Text
              style={[
                styles.statusChipLabel,
                !selectedStatusKey && styles.statusChipLabelActive,
              ]}
            >
              All Statuses
            </Text>
          </Pressable>

          {statusOrder.map((statusKey) => {
            const statusInfo = statusMeta[statusKey] || {};
            const isActive = selectedStatusKey === statusKey;
            const statusLabel =
              resolveLibraryStatusLabel?.(statusKey, activeScope) ||
              statusInfo.label ||
              statusKey;
            return (
              <Pressable
                key={statusKey}
                style={[styles.statusChip, isActive && styles.statusChipActive]}
                onPress={() => handleStatusSelect(statusKey)}
                hitSlop={6}
              >
                <View
                  style={[
                    styles.statusChipDot,
                    { backgroundColor: statusInfo.color || '#fcbf49' },
                  ]}
                />
                <Text
                  style={[
                    styles.statusChipLabel,
                    isActive && styles.statusChipLabelActive,
                  ]}
                >
                  {statusLabel}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {showEmptyLibrary ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="bookmark-outline"
            size={42}
            color="#6f7a89"
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>
            Your {activeScope === 'anime' ? 'anime' : 'manga'} shelf is empty
          </Text>
          <Text style={styles.emptySubtitle}>
            Add titles from the explore tab to start building your library.
          </Text>
        </View>
      ) : showEmptyFiltered ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="search-outline"
            size={42}
            color="#6f7a89"
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>No matches found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your status filter or search query.
          </Text>
        </View>
      ) : (
        sectionsToRender.map(renderSection)
      )}
    </ScrollView>

      {selectedEntry ? (
        <Modal
          visible
          animationType="slide"
          onRequestClose={handleCloseDetail}
        >
          <View style={styles.detailScreen}>
            <Pressable
              style={styles.detailCloseButton}
              onPress={handleCloseDetail}
              hitSlop={8}
            >
              <Ionicons name="close" size={22} color="#A5B2C2" />
            </Pressable>
            <ScrollView
              style={styles.detailScroll}
              contentContainerStyle={styles.detailScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.detailHeader}>
                <View style={styles.detailCoverWrapper}>
                  {detailCoverImage ? (
                    <ExpoImage
                      source={{ uri: detailCoverImage }}
                      style={styles.detailCoverImage}
                      contentFit="cover"
                      transition={180}
                      cachePolicy="memory-disk"
                    />
                  ) : (
                    <View
                      style={[styles.detailCoverImage, styles.detailCoverFallback]}
                    >
                      <Ionicons name="image-outline" size={28} color="#6f7a89" />
                    </View>
                  )}
                </View>
                <View style={styles.detailHeaderInfo}>
                  <Text style={styles.detailTitle} numberOfLines={2}>
                    {selectedEntry?.title || 'Untitled'}
                  </Text>
                  {creatorsText ? (
                    <View style={styles.detailMetaRow}>
                      <Ionicons
                        name={isAnimeDetail ? 'business-outline' : 'person-outline'}
                        size={18}
                        color="#A5B2C2"
                      />
                      <Text style={styles.detailMetaText}>{creatorsText}</Text>
                    </View>
                  ) : null}
                  <View style={styles.detailMetaRow}>
                    <Ionicons
                      name={isAnimeDetail ? 'tv-outline' : 'book-outline'}
                      size={18}
                      color="#A5B2C2"
                    />
                    <Text style={styles.detailMetaText}>{airingStatusText}</Text>
                  </View>
                  {lengthText ? (
                    <View style={styles.detailMetaRow}>
                      <Ionicons
                        name={isAnimeDetail ? 'albums-outline' : 'library-outline'}
                        size={18}
                        color="#A5B2C2"
                      />
                      <Text style={styles.detailMetaText}>{lengthText}</Text>
                    </View>
                  ) : null}
                  <View style={styles.detailMetaRow}>
                    <Ionicons name="star-outline" size={18} color="#A5B2C2" />
                    <Text style={styles.detailMetaText}>{baseScoreText}</Text>
                  </View>
                  <View style={styles.detailMetaRow}>
                    <Ionicons name="heart" size={18} color={statusChipAccent} />
                    <Text style={styles.detailMetaText}>{libraryStatusText}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailActionsRow}>
                <Pressable
                  style={[
                    styles.detailActionChip,
                    styles.detailActionChipStatus,
                    styles.detailActionChipHalf,
                  ]}
                  onPress={handleOpenStatusPicker}
                  hitSlop={6}
                >
                  <View style={styles.detailActionInline}>
                    <View
                      style={[
                        styles.detailActionDot,
                        { backgroundColor: statusChipAccent },
                      ]}
                    />
                    <Text
                      style={[
                        styles.detailActionLabel,
                        { color: statusChipAccent },
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {selectedStatusLabel || 'Set status'}
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  style={[
                    styles.detailActionChip,
                    styles.detailActionChipDark,
                    styles.detailActionChipHalf,
                    styles.detailActionChipRight,
                  ]}
                  onPress={handleOpenProgressModal}
                  hitSlop={6}
                >
                  <View style={styles.detailActionInline}>
                    <Ionicons
                      name={isAnimeDetail ? 'tv-outline' : 'book-outline'}
                      size={16}
                      color="#58CC8A"
                    />
                    <Text
                      style={styles.detailActionLabel}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {progressChipText}
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  style={[
                    styles.detailActionChip,
                    styles.detailActionChipDark,
                    styles.detailActionChipHalf,
                  ]}
                  onPress={handleOpenRatingModal}
                  hitSlop={6}
                >
                  <View style={styles.detailActionInline}>
                    <Ionicons name="star" size={16} color="#F9C74F" />
                    <Text
                      style={styles.detailActionLabel}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {ratingChipText}
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  style={[
                    styles.detailActionChip,
                    styles.detailActionChipDark,
                    styles.detailActionChipHalf,
                    styles.detailActionChipRight,
                    isSelectedFavorite && styles.detailActionChipFavoriteActive,
                  ]}
                  onPress={handleToggleFavorite}
                  hitSlop={6}
                >
                  <View style={styles.detailActionInline}>
                    <Ionicons
                      name={isSelectedFavorite ? 'heart' : 'heart-outline'}
                      size={16}
                      color="#FF6B6B"
                    />
                    <Text
                      style={[
                        styles.detailActionLabel,
                        isSelectedFavorite && styles.detailActionLabelFavorite,
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {favoriteChipText}
                    </Text>
                  </View>
                </Pressable>
              </View>

              {detailGenres.length > 0 ? (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionHeading}>Genres</Text>
                  <View style={styles.detailGenresWrap}>
                    {detailGenres.map((genre) => (
                      <View key={genre} style={styles.detailGenreChip}>
                        <Text style={styles.detailGenreChipText}>{genre}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionHeading}>Summary</Text>
                <Text style={styles.detailSummaryText}>{synopsisText}</Text>
              </View>
            </ScrollView>
          </View>
        </Modal>
      ) : null}

      <Modal
        visible={statusPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={closeStatusPicker}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={closeStatusPicker}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Set Status</Text>
            <ScrollView
              style={styles.modalList}
              contentContainerStyle={styles.modalListContent}
              showsVerticalScrollIndicator={false}
            >
              {statusOrder.map((statusKey) => {
                const optionLabel =
                  resolveLibraryStatusLabel?.(statusKey, selectedEntryScope) ||
                  statusMeta[statusKey]?.label ||
                  statusKey;
                const optionColor = statusMeta[statusKey]?.color || '#fcbf49';
                const isSelected = statusSelection === statusKey;
                return (
                  <Pressable
                    key={statusKey}
                    style={[
                      styles.modalOptionRow,
                      isSelected && styles.modalOptionRowSelected,
                    ]}
                    onPress={() => setStatusSelection(statusKey)}
                    hitSlop={6}
                  >
                    <View
                      style={[
                        styles.modalOptionDot,
                        { backgroundColor: optionColor },
                      ]}
                    />
                    <Text style={styles.modalOptionLabel}>{optionLabel}</Text>
                    {isSelected ? (
                      <Ionicons name="checkmark" size={18} color="#fcbf49" />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={styles.modalActionsRow}>
              {selectedEntry ? (
                <Pressable
                  style={styles.modalRemoveButton}
                  onPress={handleRemoveSelectedEntry}
                  hitSlop={6}
                >
                  <Text style={styles.modalRemoveText}>Remove</Text>
                </Pressable>
              ) : null}
              <Pressable onPress={closeStatusPicker} hitSlop={6}>
                <Text style={styles.modalActionText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleConfirmStatusSelection} hitSlop={6}>
                <Text style={styles.modalActionText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={progressModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeProgressModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={closeProgressModal}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Update Progress</Text>
            <Text style={styles.modalSubtitle}>
              {isMangaDetail ? 'Chapters read' : 'Episodes watched'}
            </Text>
            <View style={styles.progressInputRow}>
              <Pressable
                style={styles.stepperButton}
                onPress={() => adjustProgressInput(-1)}
                hitSlop={6}
              >
                <Ionicons name="remove" size={18} color="#E7EDF5" />
              </Pressable>
              <TextInput
                value={progressInputValue}
                onChangeText={setProgressInputValue}
                keyboardType="number-pad"
                style={styles.progressInput}
                placeholder="0"
                placeholderTextColor="#6f7a89"
              />
              <Pressable
                style={styles.stepperButton}
                onPress={() => adjustProgressInput(1)}
                hitSlop={6}
              >
                <Ionicons name="add" size={18} color="#E7EDF5" />
              </Pressable>
            </View>
            <Text style={styles.modalHelperText}>
              {totalCount != null
                ? `of ${totalCount} ${isMangaDetail ? 'chapters' : 'episodes'}`
                : 'Total count unknown'}
            </Text>
            <View style={styles.modalActionsRow}>
              <Pressable onPress={handleResetProgress} hitSlop={6}>
                <Text style={styles.modalActionText}>Reset</Text>
              </Pressable>
              <Pressable onPress={closeProgressModal} hitSlop={6}>
                <Text style={styles.modalActionText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSubmitProgress} hitSlop={6}>
                <Text style={styles.modalActionText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={ratingModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeRatingModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={closeRatingModal}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rate Series</Text>
            <Text style={styles.modalSubtitle}>Score between 0 and 10</Text>
            <View style={styles.ratingInputRow}>
              <Ionicons name="star" size={18} color="#F9C74F" />
              <TextInput
                value={ratingInputValue}
                onChangeText={setRatingInputValue}
                keyboardType="decimal-pad"
                style={styles.ratingInput}
                placeholder="8.5"
                placeholderTextColor="#6f7a89"
              />
              <Text style={styles.ratingSuffix}>/ 10</Text>
            </View>
            <View style={styles.modalActionsRow}>
              <Pressable onPress={handleClearRating} hitSlop={6}>
                <Text style={styles.modalActionText}>Clear</Text>
              </Pressable>
              <Pressable onPress={closeRatingModal} hitSlop={6}>
                <Text style={styles.modalActionText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSubmitRating} hitSlop={6}>
                <Text style={styles.modalActionText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </>
  );
};

export default LibraryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1719',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#E7EDF5',
  },
  scopeDropdownContainer: {
    marginLeft: 8,
    position: 'relative',
    alignSelf: 'flex-start',
    zIndex: 5,
  },
  scopeButton: {
    backgroundColor: '#16222E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  scopeButtonActive: {
    borderColor: '#fcbf49',
  },
  scopeButtonLabel: {
    color: '#E7EDF5',
    fontSize: 32,
    fontWeight: '800',
    marginRight: 6,
  },
  scopeMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 10,
    backgroundColor: '#1E2A3A',
    borderRadius: 12,
    paddingVertical: 6,
    minWidth: 160,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  scopeMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  scopeMenuItemActive: {
    backgroundColor: '#263445',
  },
  scopeMenuItemLabel: {
    color: '#A5B2C2',
    fontSize: 16,
    fontWeight: '600',
  },
  scopeMenuItemLabelActive: {
    color: '#fcbf49',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#152029',
    paddingHorizontal: 14,
    borderRadius: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#E7EDF5',
    fontSize: 16,
  },
  filterButton: {
    marginLeft: 12,
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#152029',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    borderColor: '#fcbf49',
  },
  statusChipsContainer: {
    paddingLeft: 20,
    marginTop: 12,
    marginBottom: 6,
  },
  statusChipsContent: {
    paddingRight: 20,
    alignItems: 'center',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E2A3A',
    marginRight: 12,
  },
  statusChipActive: {
    backgroundColor: '#fcbf49',
  },
  statusChipDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusChipLabel: {
    color: '#A5B2C2',
    fontWeight: '600',
  },
  statusChipLabelActive: {
    color: '#0F1719',
  },
  sectionContainer: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  sectionTitle: {
    color: '#E7EDF5',
    fontSize: 18,
    fontWeight: '700',
  },
  sectionActionText: {
    color: '#fcbf49',
    fontSize: 14,
    fontWeight: '600',
  },
  carouselContent: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  gridList: {
    paddingHorizontal: 20,
  },
  gridListRow: {
    justifyContent: 'space-between',
  },
  carouselCard: {
    width: 160,
    marginRight: 16,
  },
  gridCard: {
    flex: 0.48,
    marginBottom: 18,
  },
  carouselCardImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#1E2A3A',
  },
  gridCardImage: {
    width: '100%',
    height: 210,
    borderRadius: 12,
    backgroundColor: '#1E2A3A',
  },
  cardImageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    marginTop: 10,
    color: '#E7EDF5',
    fontWeight: '600',
  },
  detailScreen: {
    flex: 1,
    backgroundColor: '#0F1719',
    paddingTop: 24,
  },
  detailCloseButton: {
    position: 'absolute',
    top: 24,
    right: 24,
    zIndex: 20,
    backgroundColor: 'rgba(4, 13, 18, 0.85)',
    padding: 8,
    borderRadius: 18,
  },
  detailScroll: {
    flex: 1,
  },
  detailScrollContent: {
    paddingTop: 56,
    paddingBottom: 48,
    paddingHorizontal: 24,
  },
  detailHeader: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  detailCoverWrapper: {
    width: 140,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1E2A3A',
    marginRight: 16,
  },
  detailCoverImage: {
    width: '100%',
    height: 210,
    borderRadius: 16,
  },
  detailCoverFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailHeaderInfo: {
    flex: 1,
  },
  detailTitle: {
    color: '#E7EDF5',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  detailMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailMetaText: {
    color: '#A5B2C2',
    marginLeft: 8,
    flexShrink: 1,
  },
  detailActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  detailActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#192736',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    marginRight: 12,
    marginTop: 12,
    minWidth: 0,
  },
  detailActionChipHalf: {
    width: '48%',
  },
  detailActionChipRight: {
    marginRight: 0,
  },
  detailActionChipDark: {
    backgroundColor: '#1E2A3A',
    borderColor: '#1E2A3A',
  },
  detailActionChipStatus: {
    borderWidth: 0,
    backgroundColor: '#1E2A3A',
  },
  detailActionChipFavoriteActive: {
    borderColor: '#FF6B6B',
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
  },
  detailActionInline: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  detailActionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  detailActionLabel: {
    color: '#E7EDF5',
    fontWeight: '600',
    marginLeft: 8,
    flexShrink: 1,
    minWidth: 0,
  },
  detailActionLabelFavorite: {
    color: '#FF6B6B',
  },
  detailSection: {
    marginBottom: 28,
  },
  detailSectionHeading: {
    color: '#E7EDF5',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  detailGenresWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  detailGenreChip: {
    backgroundColor: '#1E2A3A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  detailGenreChipText: {
    color: '#E7EDF5',
    fontSize: 12,
    fontWeight: '600',
  },
  detailSummaryText: {
    color: '#A5B2C2',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 13, 18, 0.8)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    backgroundColor: '#13202F',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
  },
  modalTitle: {
    color: '#E7EDF5',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalSubtitle: {
    color: '#A5B2C2',
    fontSize: 13,
    marginBottom: 16,
  },
  modalList: {
    maxHeight: 260,
    marginBottom: 16,
  },
  modalListContent: {
    paddingVertical: 4,
  },
  modalOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2A3A',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 8,
  },
  modalOptionRowSelected: {
    backgroundColor: '#27374A',
  },
  modalOptionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  modalOptionLabel: {
    color: '#E7EDF5',
    fontWeight: '600',
    flex: 1,
  },
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  modalRemoveButton: {
    marginRight: 'auto',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalRemoveText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  modalActionText: {
    color: '#fcbf49',
    fontWeight: '600',
    marginLeft: 16,
  },
  progressInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2A3A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    marginBottom: 12,
  },
  stepperButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27374A',
  },
  progressInput: {
    flex: 1,
    color: '#E7EDF5',
    fontSize: 16,
    textAlign: 'center',
  },
  modalHelperText: {
    color: '#6f7a89',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  ratingInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2A3A',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 16,
  },
  ratingInput: {
    flex: 1,
    marginHorizontal: 12,
    color: '#E7EDF5',
    fontSize: 16,
  },
  ratingSuffix: {
    color: '#A5B2C2',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 60,
  },
  emptyIcon: {
    marginBottom: 18,
  },
  emptyTitle: {
    color: '#E7EDF5',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#6f7a89',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

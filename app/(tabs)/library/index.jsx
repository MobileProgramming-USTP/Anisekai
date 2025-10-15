import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
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

const LibraryMediaCard = ({ entry, variant = 'carousel' }) => {
  const imageUrl = resolveEntryCoverImage(entry);
  const cardStyle = variant === 'grid' ? styles.gridCard : styles.carouselCard;
  const imageStyle =
    variant === 'grid' ? styles.gridCardImage : styles.carouselCardImage;

  return (
    <View style={cardStyle}>
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
    </View>
  );
};

const LibraryScreen = () => {
  const {
    entries: libraryEntries,
    statusMeta: libraryStatusMeta,
    statusOrder: libraryStatusOrder,
    resolveStatusLabel: resolveLibraryStatusLabel,
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

  const activeScopeLabel = useMemo(
    () => SCOPE_OPTIONS.find((option) => option.value === activeScope)?.label ?? 'Anime',
    [activeScope]
  );

  const closeScopeMenu = () => setScopeMenuOpen(false);

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
              <LibraryMediaCard entry={item} variant="grid" />
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
            renderItem={({ item }) => <LibraryMediaCard entry={item} />}
            contentContainerStyle={styles.carouselContent}
          />
        )}
      </View>
    );
  };

  return (
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
    marginBottom: 10,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2A3A',
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#E7EDF5',
    fontSize: 16,
  },
  filterButton: {
    marginLeft: 12,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1E2A3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    borderWidth: 1,
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

import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import styles from '../../../styles/exploreStyles';
import { SCOPE_VALUES } from '../constants';
import { getItemKey } from '../utils/items';

const ExploreDetailView = ({
  detailError,
  detailLoading,
  selectedDetail,
  selectedDetailScope,
  libraryEntriesById,
  libraryStatusMeta,
  libraryStatusOrder,
  resolveLibraryStatusLabel,
  libraryDefaultStatus,
  upsertLibraryEntry,
  removeLibraryEntry,
}) => {
  const [statusPickerVisible, setStatusPickerVisible] = useState(false);
  const [statusSelection, setStatusSelection] = useState(null);

  useEffect(() => {
    setStatusPickerVisible(false);
    setStatusSelection(null);
  }, [selectedDetail?.mal_id]);

  if (!selectedDetail) {
    return null;
  }

  const isAnimeDetail = selectedDetailScope === SCOPE_VALUES.ANIME;
  const isMangaDetail = selectedDetailScope === SCOPE_VALUES.MANGA;
  const isCharacterDetail = selectedDetailScope === SCOPE_VALUES.CHARACTERS;

  if (isCharacterDetail) {
    const characterName =
      selectedDetail.name || selectedDetail.title || 'Unknown Character';
    const coverImage =
      selectedDetail.images?.jpg?.image_url ||
      selectedDetail.images?.webp?.image_url ||
      selectedDetail.images?.jpg?.large_image_url;
    const favoritesCount =
      typeof selectedDetail.favorites === 'number' ? selectedDetail.favorites : null;
    const favoritesText =
      favoritesCount != null
        ? `${favoritesCount.toLocaleString()} favorites`
        : 'Favorites data unavailable.';
    const nicknameList = Array.isArray(selectedDetail.nicknames)
      ? selectedDetail.nicknames.filter(Boolean)
      : [];
    const aliasText =
      nicknameList.length > 0
        ? nicknameList.join(', ')
        : 'No alternative names listed.';
    const aboutRaw =
      typeof selectedDetail.about === 'string'
        ? selectedDetail.about.trim()
        : '';
    const aboutText =
      aboutRaw.length > 0
        ? aboutRaw.replace(/\r?\n/g, '\n\n')
        : 'No additional information available.';
    const kanjiName =
      typeof selectedDetail.name_kanji === 'string'
        ? selectedDetail.name_kanji.trim()
        : '';

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.detailScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.detailCard}>
          <View style={styles.detailCoverWrapper}>
            {coverImage ? (
              <ExpoImage
                source={{ uri: coverImage }}
                style={styles.detailCoverImage}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
            ) : (
              <View style={[styles.detailCoverImage, styles.cardImageFallback]}>
                <Ionicons name="image-outline" size={28} color="#6f7a89" />
              </View>
            )}
          </View>
          <View style={[styles.detailHeaderInfo, styles.characterHeaderInfo]}>
            <Text style={styles.detailTitle}>{characterName}</Text>
            {kanjiName ? <Text style={styles.detailSubtitle}>{kanjiName}</Text> : null}
            <View style={styles.detailMetaRow}>
              <Ionicons name="heart" size={18} color="#f55f5f" />
              <Text style={styles.detailMetaText}>{favoritesText}</Text>
            </View>
            {nicknameList.length > 0 ? (
              <View style={styles.characterAliasContainer}>
                <Text style={styles.characterAliasLabel}>A.K.A</Text>
                <Text style={styles.characterAliasText}>{aliasText}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {detailError ? (
          <Text style={[styles.errorText, styles.detailInlineError]}>{detailError}</Text>
        ) : null}

        <View style={styles.detailSummarySection}>
          <Text style={styles.detailSectionHeading}>About</Text>
          <Text style={styles.detailSummaryText}>{aboutText}</Text>
        </View>
      </ScrollView>
    );
  }

  const coverImage =
    selectedDetail.images?.jpg?.large_image_url ||
    selectedDetail.images?.webp?.large_image_url ||
    selectedDetail.images?.jpg?.image_url;

  const statusLabel = selectedDetail.status || 'Status Unknown';
  const statusIcon = isMangaDetail ? 'time-outline' : 'tv-outline';
  const scoreLabel =
    typeof selectedDetail.score === 'number'
      ? `${selectedDetail.score.toFixed(1)} / 10`
      : 'Not rated';
  const synopsis = selectedDetail.synopsis?.trim() || 'No summary available.';
  const genres = Array.isArray(selectedDetail.genres) ? selectedDetail.genres : [];
  const currentLibraryEntry = selectedDetail.mal_id
    ? libraryEntriesById[selectedDetail.mal_id]
    : null;
  const isInLibrary = Boolean(currentLibraryEntry);
  const entryScope = currentLibraryEntry?.scope || selectedDetailScope;
  const libraryStatusLabel = currentLibraryEntry
    ? resolveLibraryStatusLabel?.(currentLibraryEntry.status, entryScope) || 'In Library'
    : null;
  const statusAccentColor = currentLibraryEntry
    ? libraryStatusMeta?.[currentLibraryEntry.status]?.color || '#f55f5f'
    : '#A5B2C2';
  const statusOptions = useMemo(
    () => (Array.isArray(libraryStatusOrder) ? libraryStatusOrder : []),
    [libraryStatusOrder]
  );

  const lengthLabel = isAnimeDetail
    ? typeof selectedDetail.episodes === 'number'
      ? `${selectedDetail.episodes} episodes`
      : 'N/A episodes'
    : typeof selectedDetail.chapters === 'number'
    ? `${selectedDetail.chapters} chapters`
    : 'N/A chapters';

  const creatorsList = isAnimeDetail
    ? selectedDetail.studios?.map((studio) => studio.name).filter(Boolean) ?? []
    : selectedDetail.authors?.map((author) => author.name).filter(Boolean) ?? [];
  const creatorsText = creatorsList.join(', ');

  const lengthIcon = isAnimeDetail ? 'albums-outline' : 'book-outline';
  const creatorsIcon = isAnimeDetail ? 'business-outline' : 'person-outline';

  const handleOpenStatusPicker = () => {
    if (!selectedDetail?.mal_id) {
      return;
    }

    if (
      selectedDetailScope !== SCOPE_VALUES.ANIME &&
      selectedDetailScope !== SCOPE_VALUES.MANGA
    ) {
      return;
    }

    const existing = libraryEntriesById[selectedDetail.mal_id];
    setStatusSelection(existing?.status ?? libraryDefaultStatus);
    setStatusPickerVisible(true);
  };

  const closeStatusPicker = () => {
    setStatusPickerVisible(false);
    setStatusSelection(null);
  };

  const handleConfirmStatusSelection = () => {
    if (!selectedDetail?.mal_id) {
      closeStatusPicker();
      return;
    }

    const resolvedStatus = statusSelection || libraryDefaultStatus;

    upsertLibraryEntry(selectedDetail, {
      status: resolvedStatus,
      scope: selectedDetailScope,
    });
    closeStatusPicker();
  };

  const handleRemoveFromLibrary = () => {
    if (!selectedDetail?.mal_id) {
      closeStatusPicker();
      return;
    }

    removeLibraryEntry(selectedDetail.mal_id);
    closeStatusPicker();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.detailScrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.detailCard}>
        <View style={styles.detailCoverWrapper}>
          {coverImage ? (
            <ExpoImage
              source={{ uri: coverImage }}
              style={styles.detailCoverImage}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={[styles.detailCoverImage, styles.cardImageFallback]}>
              <Ionicons name="image-outline" size={28} color="#6f7a89" />
            </View>
          )}
        </View>
        <View style={styles.detailHeaderInfo}>
          <Text style={styles.detailTitle}>{selectedDetail.title}</Text>

          {creatorsText ? (
            <View style={styles.detailMetaRow}>
              <Ionicons name={creatorsIcon} size={18} color="#A5B2C2" />
              <Text style={styles.detailMetaText}>{creatorsText}</Text>
            </View>
          ) : null}

          <View style={styles.detailMetaRow}>
            <Ionicons name={statusIcon} size={18} color="#A5B2C2" />
            <Text style={styles.detailMetaText}>{statusLabel}</Text>
          </View>

          <View style={styles.detailMetaRow}>
            <Ionicons name={lengthIcon} size={18} color="#A5B2C2" />
            <Text style={styles.detailMetaText}>{lengthLabel}</Text>
          </View>

          <View style={styles.detailMetaRow}>
            <Ionicons name="star-outline" size={18} color="#A5B2C2" />
            <Text style={styles.detailMetaText}>{scoreLabel}</Text>
          </View>

          <Pressable style={styles.detailMetaRow} onPress={handleOpenStatusPicker} hitSlop={8}>
            <Ionicons
              name={isInLibrary ? 'heart' : 'heart-outline'}
              size={20}
              color={statusAccentColor}
            />
            <Text style={styles.detailMetaText}>
              {isInLibrary
                ? libraryStatusLabel
                  ? `In Library (${libraryStatusLabel})`
                  : 'In Library'
                : 'Add to Library'}
            </Text>
          </Pressable>
        </View>
      </View>

      {detailLoading ? (
        <View style={styles.detailInlineSpinner}>
          <Text style={styles.detailMetaText}>Updating details…</Text>
        </View>
      ) : null}

      {detailError ? (
        <Text style={[styles.errorText, styles.detailInlineError]}>{detailError}</Text>
      ) : null}

      {genres.length > 0 ? (
        <View style={styles.detailGenresSection}>
          <Text style={styles.detailSectionHeading}>Genres</Text>
          <View style={styles.detailGenresWrap}>
            {genres.map((genre, index) => (
              <View key={getItemKey(genre, index, 'genre-detail')} style={styles.detailGenreChip}>
                <Text style={styles.detailGenreChipText}>{genre?.name || 'Unknown'}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.detailSummarySection}>
        <Text style={styles.detailSectionHeading}>Summary</Text>
        <Text style={styles.detailSummaryText}>{synopsis}</Text>
      </View>

      <Modal
        visible={statusPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={closeStatusPicker}
      >
        <View style={styles.statusModalBackdrop}>
          <Pressable style={styles.statusModalDismissArea} onPress={closeStatusPicker} />
          <View style={styles.statusModalContainer}>
            <Text style={styles.statusModalTitle}>Set Status</Text>
            <View style={styles.statusOptionsList}>
              {statusOptions.map((statusKey) => {
                const optionMeta = libraryStatusMeta?.[statusKey];
                const selected = statusSelection === statusKey;
                const optionColor = optionMeta?.color || '#fcbf49';
                const optionLabel =
                  resolveLibraryStatusLabel?.(statusKey, selectedDetailScope) ||
                  optionMeta?.label ||
                  statusKey;

                return (
                  <Pressable
                    key={statusKey}
                    style={[styles.statusOptionRow, selected && styles.statusOptionRowActive]}
                    onPress={() => setStatusSelection(statusKey)}
                    hitSlop={6}
                  >
                    <View
                      style={[
                        styles.statusOptionIndicator,
                        { borderColor: optionColor },
                        selected && { backgroundColor: optionColor },
                      ]}
                    />
                    <Text style={styles.statusOptionLabel}>{optionLabel}</Text>
                    {selected ? <Ionicons name="checkmark" size={18} color="#fcbf49" /> : null}
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.statusModalActions}>
              {isInLibrary ? (
                <Pressable
                  style={styles.statusModalRemove}
                  onPress={handleRemoveFromLibrary}
                  hitSlop={6}
                >
                  <Text style={styles.statusModalRemoveText}>Remove</Text>
                </Pressable>
              ) : null}
              <Pressable onPress={closeStatusPicker} hitSlop={6}>
                <Text style={styles.statusModalActionText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleConfirmStatusSelection} hitSlop={6}>
                <Text style={styles.statusModalActionText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default ExploreDetailView;

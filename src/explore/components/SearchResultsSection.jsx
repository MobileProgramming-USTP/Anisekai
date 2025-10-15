import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SCOPE_VALUES } from '../constants';
import styles from '../../../styles/exploreStyles';
import MediaCard from './MediaCard';
import { getItemKey } from '../utils/items';

const SearchResultsSection = ({
  searchQuery,
  filteredSearchResults,
  searchLoading,
  searchError,
  supportsGenreFilter,
  activeScope,
  activeScopeLabel,
  onSelectAnime,
  onSelectManga,
  onSelectCharacter,
}) => {
  if (!searchQuery.trim().length) {
    return null;
  }

  const renderCard = ({ item }) => (
    <MediaCard
      item={item}
      onSelect={
        activeScope === SCOPE_VALUES.ANIME
          ? onSelectAnime
          : activeScope === SCOPE_VALUES.MANGA
          ? onSelectManga
          : activeScope === SCOPE_VALUES.CHARACTERS
          ? onSelectCharacter
          : undefined
      }
      variant={activeScope === SCOPE_VALUES.USERS ? 'user' : 'grid'}
    />
  );

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>SEARCH RESULTS</Text>
        {filteredSearchResults.length > 0 ? (
          <Text style={styles.searchCount}>{filteredSearchResults.length} found</Text>
        ) : null}
      </View>
      {searchLoading ? (
        <ActivityIndicator size="small" color="#fcbf49" style={styles.searchLoader} />
      ) : searchError ? (
        <Text style={styles.errorText}>{searchError}</Text>
      ) : filteredSearchResults.length === 0 ? (
        <Text style={styles.emptyText}>
          No {activeScopeLabel.toLowerCase()} match that search.
        </Text>
      ) : (
        <FlatList
          data={filteredSearchResults.slice(0, supportsGenreFilter ? 10 : 12)}
          key="search-grid"
          numColumns={2}
          keyExtractor={(item, index) => getItemKey(item, index, 'search')}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridList}
          scrollEnabled={false}
          renderItem={renderCard}
        />
      )}
    </View>
  );
};

export default SearchResultsSection;

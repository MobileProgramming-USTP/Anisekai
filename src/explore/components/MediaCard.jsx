import { Pressable, Text, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../../styles/exploreStyles';

const MediaCard = ({
  item,
  onSelect,
  variant = 'carousel',
  badgeLabel = null,
  badgeColor = null,
}) => {
  const title = item?.title || item?.name || item?.username || 'Untitled';
  const imageUrl =
    item?.images?.jpg?.large_image_url ||
    item?.images?.jpg?.image_url ||
    item?.images?.webp?.image_url ||
    item?.images?.jpg?.small_image_url ||
    item?.image_url ||
    item?.avatar_url;
  const cardStyle =
    variant === 'grid'
      ? styles.gridCard
      : variant === 'user'
      ? styles.userCard
      : styles.card;
  const imageStyle =
    variant === 'grid'
      ? styles.gridCardImage
      : variant === 'user'
      ? styles.userCardImage
      : styles.cardImage;

  const handlePress = () => {
    if (onSelect) {
      onSelect(item);
    }
  };

  return (
    <Pressable style={cardStyle} onPress={handlePress} hitSlop={4} disabled={!onSelect}>
      {badgeLabel ? (
        <View style={[styles.rankBadge, { backgroundColor: badgeColor || '#C7E9F1' }]}>
          <Text style={styles.rankBadgeText}>{badgeLabel}</Text>
        </View>
      ) : null}
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
      <Text style={styles.cardText} numberOfLines={2}>
        {title}
      </Text>
    </Pressable>
  );
};

export default MediaCard;

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const tools = [
  {
    key: 'waifu-gen',
    title: 'Waifu Generator',
    description: 'Create and discover your perfect AI-generated waifu.',
    icon: <MaterialCommunityIcons name="image-plus" size={32} color="#fcbf49" />,
    action: () => router.push('/tools/waifu-generator'),
  },
  {
    key: 'anime-quotes',
    title: 'Anime Quotes',
    description: 'Find iconic quotes from your favorite characters.',
    icon: <Ionicons name="chatbubble-ellipses-outline" size={32} color="#fcbf49" />,
    action: () => console.log('Navigate to Anime Quotes'),
  },
  {
    key: 'anime-trace',
    title: 'Scene Finder',
    description: 'Upload an image to find which anime it\'s from.',
    icon: <Ionicons name="camera-outline" size={32} color="#fcbf49" />,
    action: () => router.push('/tools/scene-finder'),
  },
  {
    key: 'meme-feed',
    title: 'Meme Feed',
    description: 'A curated feed of memes from Reddit\'s best anime subs.',
    icon: <Ionicons name="logo-reddit" size={32} color="#fcbf49" />,
    action: () => console.log('Navigate to Meme Feed'),
  },
  {
    key: 'ai-recs',
    title: 'AI Recommendations',
    description: 'Get personalized anime suggestions powered by AI.',
    icon: <Ionicons name="sparkles-outline" size={32} color="#fcbf49" />,
    action: () => console.log('Navigate to AI Recs'),
  },
  {
    key: 'news-feed',
    title: 'Anime News Feed',
    description: 'The latest news and headlines from the anime world.',
    icon: <Ionicons name="newspaper-outline" size={32} color="#fcbf49" />,
    action: () => console.log('Navigate to News Feed'),
  },
];

const ToolCard = ({ item }) => (
  <Pressable style={styles.card} onPress={item.action}>
    <View style={styles.cardIcon}>{item.icon}</View>
    <Text style={styles.cardTitle}>{item.title}</Text>
    <Text style={styles.cardDescription}>{item.description}</Text>
  </Pressable>
);

const MiscellaneousScreen = () => {
  const tabBarHeight = useBottomTabBarHeight();
  const bottomInset = tabBarHeight + 32;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tools & Fun</Text>
      <FlatList
        data={tools}
        renderItem={({ item }) => <ToolCard item={item} />}
        keyExtractor={(item) => item.key}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[styles.gridContentContainer, { paddingBottom: bottomInset }]}
      />
    </View>
  );
};

export default MiscellaneousScreen;

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // Screen width - horizontal padding - gap

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1719',
    paddingTop: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  gridContentContainer: {
    paddingHorizontal: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#1E2A3A',
    borderRadius: 12,
    padding: 20,
    width: cardWidth,
    marginBottom: 20,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardIcon: {
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  cardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDescription: {
    color: 'gray',
    fontSize: 12,
  },
});

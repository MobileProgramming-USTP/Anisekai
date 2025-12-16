import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";

import { theme } from "../../styles/theme";

const SUBREDDITS = ["animemes", "goodanimemes", "wholesomeanimemes"];

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: theme.colors.backgroundAlt, // Match misc tab background
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: theme.colors.surfaceMuted,
        borderRadius: 16,
        marginBottom: 20,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: theme.colors.borderMuted,
    },
    image: {
        width: "100%",
        backgroundColor: "#000",
    },
    cardContent: {
        padding: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        color: theme.colors.text,
        marginBottom: 8,
        lineHeight: 22,
    },
    metaContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    metaLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: theme.colors.textMuted,
        fontWeight: "500",
    },
    subredditBadge: {
        backgroundColor: theme.colors.primary + "20", // 20% opacity
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    subredditText: {
        fontSize: 10,
        color: theme.colors.primary,
        fontWeight: "700",
        textTransform: "uppercase",
    },
    loadingContainer: {
        padding: 20,
        alignItems: "center",
    },
    errorContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    errorText: {
        color: theme.colors.danger,
        fontSize: 16,
        marginBottom: 16,
        textAlign: "center",
    },
    retryButton: {
        backgroundColor: theme.colors.surfaceMuted,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    retryText: {
        color: theme.colors.text,
        fontWeight: "600",
    },
    titleContainer: {
        marginBottom: 20,
        marginTop: 40, // Add top margin for status bar
        alignItems: "center",
    },
    titleText: {
        fontSize: 32,
        fontWeight: "800",
        color: theme.colors.text,
        marginBottom: 8,
        textAlign: "center",
        letterSpacing: 0.5,
    },
    subtitleText: {
        fontSize: 16,
        color: theme.colors.textMuted,
        textAlign: "center",
        opacity: 0.8,
    },
    headerActions: {
        flexDirection: "row",
        marginBottom: 24,
        gap: 8,
        justifyContent: "center", // Center the chips
    },
    filterChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: theme.colors.surfaceMuted,
        borderWidth: 1,
        borderColor: theme.colors.borderMuted,
    },
    filterChipActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    filterText: {
        fontSize: 12,
        color: theme.colors.textMuted,
        fontWeight: "600",
    },
    filterTextActive: {
        color: theme.colors.primaryForeground,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.95)",
        justifyContent: "center",
        alignItems: "center",
    },
    fullImage: {
        width: "100%",
        height: "100%",
    },
    closeButton: {
        position: "absolute",
        top: 50,
        right: 20,
        zIndex: 1,
        padding: 10,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 20,
    },
    scrollTopButton: {
        position: "absolute",
        bottom: 30,
        right: 30,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.primary,
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        zIndex: 10,
    },
});

export default function MemeFeedScreen() {
    const { width } = useWindowDimensions();
    const flatListRef = useRef(null);
    const [memes, setMemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [after, setAfter] = useState(null);
    const [activeSubreddit, setActiveSubreddit] = useState(SUBREDDITS[0]);
    const [selectedMeme, setSelectedMeme] = useState(null);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const fetchMemes = useCallback(
        async (isRefresh = false, nextAfter = null) => {
            try {
                if (isRefresh) {
                    setRefreshing(true);
                } else if (!nextAfter) {
                    setLoading(true);
                } else {
                    setLoadingMore(true);
                }
                setError(null);

                const url = `https://www.reddit.com/r/${activeSubreddit}/hot.json?limit=25${nextAfter ? `&after=${nextAfter}` : ""
                    }`;

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error("Failed to fetch memes");
                }

                const json = await response.json();
                const children = json.data?.children || [];
                const newAfter = json.data?.after;

                const newMemes = children
                    .map((child) => child.data)
                    .filter((post) => !post.stickied && !post.is_video && post.url && post.url.match(/\.(jpg|jpeg|png|gif)$/i));

                if (isRefresh || !nextAfter) {
                    setMemes(newMemes);
                } else {
                    setMemes((prev) => [...prev, ...newMemes]);
                }

                setAfter(newAfter);
            } catch (err) {
                console.error(err);
                if (!isRefresh && !nextAfter) {
                    setError("Failed to load memes. Please check your connection.");
                }
            } finally {
                setLoading(false);
                setRefreshing(false);
                setLoadingMore(false);
            }
        },
        [activeSubreddit]
    );

    useEffect(() => {
        fetchMemes();
    }, [fetchMemes]);

    const handleRefresh = () => {
        fetchMemes(true);
    };

    const handleLoadMore = () => {
        if (!loadingMore && after) {
            fetchMemes(false, after);
        }
    };

    const handleScroll = (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setShowScrollTop(offsetY > 500);
    };

    const scrollToTop = () => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    };

    const renderItem = useCallback(
        ({ item }) => {
            return (
                <Pressable onPress={() => setSelectedMeme(item)}>
                    <View style={styles.card}>
                        <Image
                            source={{ uri: item.url }}
                            style={[styles.image, { height: width }]} // Square-ish placeholder
                            resizeMode="cover"
                        />
                        <View style={styles.cardContent}>
                            <Text style={styles.title}>{item.title}</Text>

                            <View style={styles.metaContainer}>
                                <View style={styles.metaLeft}>
                                    <View style={styles.metaItem}>
                                        <MaterialCommunityIcons name="arrow-up-bold" size={16} color={theme.colors.primary} />
                                        <Text style={styles.metaText}>{item.ups > 1000 ? `${(item.ups / 1000).toFixed(1)}k` : item.ups}</Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <MaterialCommunityIcons name="comment-outline" size={16} color={theme.colors.textMuted} />
                                        <Text style={styles.metaText}>{item.num_comments}</Text>
                                    </View>
                                </View>

                                <View style={styles.subredditBadge}>
                                    <Text style={styles.subredditText}>r/{item.subreddit}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </Pressable>
            );
        },
        [width]
    );

    const renderHeader = () => (
        <View>
            <View style={styles.titleContainer}>
                <Text style={styles.titleText}>Meme Feed</Text>
                <Text style={styles.subtitleText}>Daily dose of anime memes</Text>
            </View>
            <View style={styles.headerActions}>
                {SUBREDDITS.map((sub) => (
                    <Pressable
                        key={sub}
                        style={[styles.filterChip, activeSubreddit === sub && styles.filterChipActive]}
                        onPress={() => setActiveSubreddit(sub)}
                    >
                        <Text style={[styles.filterText, activeSubreddit === sub && styles.filterTextActive]}>
                            {sub}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={[styles.screen, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.screen}>
                <Stack.Screen options={{ title: "Meme Feed" }} />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <Pressable style={styles.retryButton} onPress={() => fetchMemes()}>
                        <Text style={styles.retryText}>Try Again</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <Stack.Screen options={{
                headerShown: false, // Hide default header to use custom one
            }} />

            <FlatList
                ref={flatListRef}
                data={memes}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
            />

            {showScrollTop && (
                <Pressable style={styles.scrollTopButton} onPress={scrollToTop}>
                    <Ionicons name="arrow-up" size={28} color={theme.colors.primaryForeground} />
                </Pressable>
            )}

            <Modal
                visible={!!selectedMeme}
                transparent={true}
                onRequestClose={() => setSelectedMeme(null)}
                animationType="fade"
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setSelectedMeme(null)}
                    >
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                    {selectedMeme && (
                        <Image
                            source={{ uri: selectedMeme.url }}
                            style={styles.fullImage}
                            resizeMode="contain"
                        />
                    )}
                </View>
            </Modal>
        </View>
    );
}

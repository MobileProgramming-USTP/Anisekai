import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Linking,
    Modal,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { theme } from "../../styles/theme";

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#1a1b26",
    },
    headerContainer: {
        marginBottom: 20,
        marginTop: 40,
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: "800",
        color: theme.colors.text,
        marginBottom: 8,
        textAlign: "center",
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: theme.colors.textMuted,
        textAlign: "center",
        opacity: 0.8,
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        flexDirection: "row",
        backgroundColor: theme.colors.surfaceMuted,
        marginBottom: 16,
        borderRadius: 16,
        overflow: "hidden",
        height: 110,
        borderWidth: 1,
        borderColor: theme.colors.borderMuted,
    },
    thumbnail: {
        width: 110,
        height: "100%",
        backgroundColor: "#000",
    },
    placeholderThumbnail: {
        width: 110,
        height: "100%",
        backgroundColor: theme.colors.surface,
        justifyContent: "center",
        alignItems: "center",
    },
    cardContent: {
        flex: 1,
        padding: 12,
        justifyContent: "space-between",
    },
    title: {
        fontSize: 15,
        fontWeight: "600",
        color: theme.colors.text,
        lineHeight: 20,
    },
    metaContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    domain: {
        fontSize: 12,
        color: theme.colors.primary,
        fontWeight: "500",
    },
    time: {
        fontSize: 12,
        color: theme.colors.textMuted,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    errorText: {
        color: theme.colors.danger,
        textAlign: "center",
        marginBottom: 16,
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
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        minHeight: 400,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalDomain: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: "700",
        textTransform: "uppercase",
    },
    modalCloseButton: {
        padding: 4,
    },
    modalImage: {
        width: "100%",
        height: 200,
        borderRadius: 12,
        marginBottom: 20,
        backgroundColor: theme.colors.surfaceMuted,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: theme.colors.text,
        marginBottom: 12,
        lineHeight: 28,
    },
    modalTime: {
        fontSize: 14,
        color: theme.colors.textMuted,
        marginBottom: 24,
    },
    readButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        gap: 8,
    },
    readButtonText: {
        color: theme.colors.primaryForeground,
        fontSize: 16,
        fontWeight: "700",
    },
});

export default function AnimeNewsScreen() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [selectedArticle, setSelectedArticle] = useState(null);

    const fetchNews = useCallback(async () => {
        try {
            setError(null);
            const response = await fetch("https://www.reddit.com/r/AnimeNews/hot.json?limit=25");

            if (!response.ok) {
                throw new Error("Failed to fetch news");
            }

            const json = await response.json();
            const children = json.data?.children || [];

            const articles = children
                .map((child) => child.data)
                .filter((post) => !post.stickied); // Filter out pinned posts

            setNews(articles);
        } catch (err) {
            console.error(err);
            setError("Failed to load anime news. Please check your connection.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchNews();
    };

    const openLink = (url) => {
        if (url) {
            Linking.openURL(url);
        }
    };

    const getTimeAgo = (timestamp) => {
        const seconds = Math.floor(Date.now() / 1000 - timestamp);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    };

    const getImageUrl = (item) => {
        if (item.preview?.images?.[0]?.source?.url) {
            return item.preview.images[0].source.url.replace(/&amp;/g, "&");
        }
        if (item.thumbnail && item.thumbnail.startsWith("http")) {
            return item.thumbnail;
        }
        return null;
    };

    const renderItem = ({ item }) => {
        const imageUrl = getImageUrl(item);

        return (
            <Pressable style={styles.card} onPress={() => setSelectedArticle(item)}>
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.placeholderThumbnail}>
                        <Ionicons name="newspaper-outline" size={32} color={theme.colors.textMuted} />
                    </View>
                )}

                <View style={styles.cardContent}>
                    <Text style={styles.title} numberOfLines={3}>
                        {item.title}
                    </Text>

                    <View style={styles.metaContainer}>
                        <Text style={styles.domain} numberOfLines={1}>
                            {item.domain}
                        </Text>
                        <Text style={styles.time}>
                            {getTimeAgo(item.created_utc)}
                        </Text>
                    </View>
                </View>
            </Pressable>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={[styles.screen, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.screen}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>Anime News</Text>
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <Pressable style={styles.retryButton} onPress={fetchNews}>
                        <Text style={styles.retryText}>Try Again</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <Stack.Screen options={{ headerShown: false }} />

            <FlatList
                data={news}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListHeaderComponent={
                    <View style={styles.headerContainer}>
                        <Text style={styles.headerTitle}>Anime News</Text>
                        <Text style={styles.headerSubtitle}>Latest updates from r/AnimeNews</Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
                }
            />

            <Modal
                visible={!!selectedArticle}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setSelectedArticle(null)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalDomain}>{selectedArticle?.domain}</Text>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setSelectedArticle(null)}
                            >
                                <Ionicons name="close" size={24} color={theme.colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        {getImageUrl(selectedArticle || {}) && (
                            <Image
                                source={{ uri: getImageUrl(selectedArticle) }}
                                style={styles.modalImage}
                                resizeMode="cover"
                            />
                        )}

                        <Text style={styles.modalTitle}>{selectedArticle?.title}</Text>
                        <Text style={styles.modalTime}>
                            Posted {selectedArticle ? getTimeAgo(selectedArticle.created_utc) : ""}
                        </Text>

                        <TouchableOpacity
                            style={styles.readButton}
                            onPress={() => {
                                openLink(selectedArticle?.url);
                                setSelectedArticle(null);
                            }}
                        >
                            <Text style={styles.readButtonText}>Read Full Article</Text>
                            <Ionicons name="open-outline" size={20} color={theme.colors.primaryForeground} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

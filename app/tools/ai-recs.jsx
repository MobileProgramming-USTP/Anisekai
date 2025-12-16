import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Keyboard,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import fetchAiAnimeMangaRecommendations, { isGeminiConfigured } from "../../src/data/geminiRecommendations";
import { theme } from "../../styles/theme";

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: theme.colors.backgroundAlt,
    },
    headerContainer: {
        marginBottom: 20,
        marginTop: 40,
        alignItems: "center",
        paddingHorizontal: 20,
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
        lineHeight: 22,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    inputWrapper: {
        position: "relative",
        marginBottom: 24,
    },
    textInput: {
        backgroundColor: theme.colors.surfaceMuted,
        borderRadius: 16,
        padding: 16,
        paddingRight: 40, // Space for clear button
        color: theme.colors.text,
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: "top",
        borderWidth: 1,
        borderColor: theme.colors.borderMuted,
    },
    clearButton: {
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 10,
        padding: 4,
    },
    chipsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 12,
    },
    chip: {
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    chipText: {
        color: theme.colors.textMuted,
        fontSize: 12,
        fontWeight: "600",
    },
    generateButton: {
        marginTop: 20,
        borderRadius: 16,
        overflow: "hidden",
        elevation: 4,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    gradient: {
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    generateButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    resultCard: {
        backgroundColor: theme.colors.surfaceMuted,
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 20,
        borderWidth: 1,
        borderColor: theme.colors.borderMuted,
    },
    coverImage: {
        width: "100%",
        height: 180,
        backgroundColor: "#000",
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    animeTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: theme.colors.text,
        flex: 1,
        marginRight: 8,
    },
    typeBadge: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    typeText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "700",
        textTransform: "uppercase",
    },
    genres: {
        fontSize: 12,
        color: theme.colors.primary,
        fontWeight: "600",
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: theme.colors.text,
        marginTop: 12,
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: theme.colors.textMuted,
        lineHeight: 20,
    },
    reason: {
        fontSize: 14,
        color: theme.colors.text,
        fontStyle: "italic",
        lineHeight: 20,
        marginBottom: 8,
    },
    loadingContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
    },
    loadingText: {
        color: theme.colors.textMuted,
        marginTop: 16,
        fontSize: 16,
        textAlign: "center",
        fontStyle: "italic",
    },
    errorText: {
        color: theme.colors.danger,
        textAlign: "center",
        marginTop: 10,
    },
});

const QUICK_CHIPS = [
    "Dark Fantasy",
    "Wholesome Slice of Life",
    "Cyberpunk",
    "Psychological Thriller",
    "Isekai with OP MC",
    "Romance Drama",
    "Sports Hype",
    "Iyashikei (Healing)",
];

const LOADING_JOKES = [
    "Consulting the anime database...",
    "Summoning the waifus...",
    "Calculating power levels...",
    "Asking the Council of Weebs...",
    "Searching for the One Piece...",
    "Training in the Hyperbolic Time Chamber...",
    "Checking the Hunter Association archives...",
    "Decoding the Poneglyphs...",
    "Syncing with Unit-01...",
    "Running like Naruto to find your anime...",
];

export default function AnisekAIScreen() {
    const [prompt, setPrompt] = useState("");
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loadingMessage, setLoadingMessage] = useState(LOADING_JOKES[0]);
    const loadingInterval = useRef(null);

    useEffect(() => {
        if (loading) {
            let index = 0;
            loadingInterval.current = setInterval(() => {
                index = (index + 1) % LOADING_JOKES.length;
                setLoadingMessage(LOADING_JOKES[index]);
            }, 2000);
        } else {
            if (loadingInterval.current) {
                clearInterval(loadingInterval.current);
            }
        }
        return () => {
            if (loadingInterval.current) {
                clearInterval(loadingInterval.current);
            }
        };
    }, [loading]);

    const fetchCoverImage = async (title) => {
        try {
            // Add a small delay to avoid rate limiting if calling in parallel
            await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

            const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1`);
            const json = await response.json();
            return json.data?.[0]?.images?.jpg?.large_image_url || null;
        } catch (e) {
            console.warn(`Failed to fetch cover for ${title}`, e);
            return null;
        }
    };

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) return;

        Keyboard.dismiss();
        setLoading(true);
        setError(null);
        setRecommendations([]);

        try {
            if (!isGeminiConfigured) {
                throw new Error("Gemini API key is missing. Please configure it in .env");
            }

            const recs = await fetchAiAnimeMangaRecommendations({
                preference: prompt,
                count: 5,
            });

            // Fetch covers in parallel
            const recsWithImages = await Promise.all(
                recs.map(async (rec) => {
                    const cover = await fetchCoverImage(rec.title);
                    return { ...rec, cover };
                })
            );

            setRecommendations(recsWithImages);
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to generate recommendations. Try again.");
        } finally {
            setLoading(false);
        }
    }, [prompt]);

    const addChip = (chip) => {
        setPrompt((prev) => (prev ? `${prev}, ${chip}` : chip));
    };

    const clearPrompt = () => {
        setPrompt("");
        setRecommendations([]);
        setError(null);
    };

    const renderItem = ({ item }) => (
        <View style={styles.resultCard}>
            {item.cover && (
                <Image
                    source={{ uri: item.cover }}
                    style={styles.coverImage}
                    resizeMode="cover"
                />
            )}
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={styles.animeTitle}>{item.title}</Text>
                    <View style={styles.typeBadge}>
                        <Text style={styles.typeText}>{item.type}</Text>
                    </View>
                </View>

                <Text style={styles.genres}>{item.genres.join(" • ")}</Text>

                <Text style={styles.sectionTitle}>Why you'll like it:</Text>
                <Text style={styles.reason}>"{item.reason}"</Text>

                <Text style={styles.sectionTitle}>Synopsis:</Text>
                <Text style={styles.description}>{item.synopsis}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.screen}>
            <Stack.Screen options={{ headerShown: false }} />

            <FlatList
                data={recommendations}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.contentContainer}
                ListHeaderComponent={
                    <View>
                        <View style={styles.headerContainer}>
                            <MaterialCommunityIcons name="robot-happy-outline" size={48} color={theme.colors.primary} style={{ marginBottom: 10 }} />
                            <Text style={styles.headerTitle}>AnisekAI</Text>
                            <Text style={styles.headerSubtitle}>
                                Describe your mood, favorite genres, or similar anime, and I'll find your next obsession.
                            </Text>
                        </View>

                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="e.g. I want a dark fantasy anime like Attack on Titan but with more political intrigue..."
                                placeholderTextColor={theme.colors.textMuted}
                                multiline
                                value={prompt}
                                onChangeText={setPrompt}
                            />
                            {prompt.length > 0 && (
                                <Pressable style={styles.clearButton} onPress={clearPrompt}>
                                    <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
                                </Pressable>
                            )}

                            <View style={styles.chipsContainer}>
                                {QUICK_CHIPS.map((chip) => (
                                    <Pressable key={chip} style={styles.chip} onPress={() => addChip(chip)}>
                                        <Text style={styles.chipText}>+ {chip}</Text>
                                    </Pressable>
                                ))}
                            </View>

                            <Pressable
                                style={styles.generateButton}
                                onPress={handleGenerate}
                                disabled={loading}
                            >
                                <LinearGradient
                                    colors={[theme.colors.primary, "#a445b2"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.gradient}
                                >
                                    {loading ? (
                                        <Text style={[styles.generateButtonText, { opacity: 0.8 }]}>
                                            Thinking...
                                        </Text>
                                    ) : (
                                        <Text style={styles.generateButtonText}>Generate Recommendations</Text>
                                    )}
                                </LinearGradient>
                            </Pressable>

                            {error && <Text style={styles.errorText}>{error}</Text>}
                        </View>

                        {loading && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={theme.colors.primary} />
                                <Text style={styles.loadingText}>{loadingMessage}</Text>
                            </View>
                        )}
                    </View>
                }
            />
        </View>
    );
}

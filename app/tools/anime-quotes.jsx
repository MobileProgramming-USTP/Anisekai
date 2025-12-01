import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import { Stack } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { theme } from "../../styles/theme";

const QUOTES = [
    {
        content: "Power comes in response to a need, not a desire. You have to create that need.",
        character: "Goku",
        anime: "Dragon Ball Z"
    },
    {
        content: "If you don't take risks, you can't create a future.",
        character: "Monkey D. Luffy",
        anime: "One Piece"
    },
    {
        content: "Whatever you lose, you'll find it again. But what you throw away you'll never get back.",
        character: "Kenshin Himura",
        anime: "Rurouni Kenshin"
    },
    {
        content: "The difference between the novice and the master is that the master has failed more times than the novice has tried.",
        character: "Koro-sensei",
        anime: "Assassination Classroom"
    },
    {
        content: "Hard work betrays none, but dreams betray many.",
        character: "Hachiman Hikigaya",
        anime: "My Teen Romantic Comedy SNAFU"
    },
    {
        content: "Knowing you're different is only the beginning. If you accept these differences you'll be able to evolve.",
        character: "Miss Kobayashi",
        anime: "Miss Kobayashi's Dragon Maid"
    },
    {
        content: "Giving up is what kills people.",
        character: "Alucard",
        anime: "Hellsing"
    },
    {
        content: "People, who can't throw something important away, can never hope to change anything.",
        character: "Armin Arlert",
        anime: "Attack on Titan"
    },
    {
        content: "If you don't like your destiny, don't accept it. Instead have the courage to change it the way you want it to be.",
        character: "Naruto Uzumaki",
        anime: "Naruto"
    },
    {
        content: "Simplicity is the easiest path to true beauty.",
        character: "Seishuu Handa",
        anime: "Barakamon"
    }
];

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#1a1b26", // Lighter than original black
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    titleContainer: {
        marginBottom: 40,
        alignItems: "center",
    },
    title: {
        fontSize: 32,
        fontWeight: "800",
        color: theme.colors.text,
        marginBottom: 8,
        textAlign: "center",
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textMuted,
        textAlign: "center",
        opacity: 0.8,
    },
    card: {
        width: "100%",
        maxWidth: 360,
        backgroundColor: theme.colors.surfaceMuted,
        borderRadius: 24,
        padding: 32,
        marginBottom: 40,
        alignItems: "center",
        borderWidth: 1,
        borderColor: theme.colors.borderMuted,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    quoteIconTop: {
        position: 'absolute',
        top: 15,
        left: 15,
        opacity: 0.2,
    },
    quoteIconBottom: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        opacity: 0.2,
    },
    quoteText: {
        fontSize: 22,
        fontWeight: "500",
        fontStyle: "italic",
        color: theme.colors.text,
        marginBottom: 24,
        lineHeight: 34,
        textAlign: "center",
        zIndex: 1,
    },
    divider: {
        width: 40,
        height: 4,
        backgroundColor: theme.colors.primary,
        borderRadius: 2,
        marginBottom: 24,
    },
    characterInfo: {
        alignItems: "center",
        gap: 4,
    },
    characterName: {
        fontSize: 18,
        fontWeight: "700",
        color: theme.colors.primary,
        letterSpacing: 0.5,
    },
    animeTitle: {
        fontSize: 14,
        fontWeight: "500",
        color: theme.colors.textMuted,
    },
    actions: {
        flexDirection: "row",
        gap: 16,
        width: "100%",
        maxWidth: 360,
    },
    mainButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.primary,
        paddingVertical: 18,
        borderRadius: 16,
        gap: 10,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    secondaryButton: {
        width: 60,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.surfaceMuted,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    buttonPressed: {
        transform: [{ scale: 0.96 }],
        opacity: 0.9,
    },
    buttonText: {
        color: theme.colors.primaryForeground,
        fontSize: 16,
        fontWeight: "700",
    },
});

export default function AnimeQuotesScreen() {
    const [currentQuote, setCurrentQuote] = useState(QUOTES[0]);

    const getRandomQuote = useCallback(() => {
        let newQuote;
        do {
            const randomIndex = Math.floor(Math.random() * QUOTES.length);
            newQuote = QUOTES[randomIndex];
        } while (newQuote === currentQuote && QUOTES.length > 1);

        setCurrentQuote(newQuote);
    }, [currentQuote]);

    // Initial random quote on mount (optional, or stick to first one)
    useEffect(() => {
        getRandomQuote();
    }, []);

    const copyToClipboard = async () => {
        const text = `"${currentQuote.content}" - ${currentQuote.character} (${currentQuote.anime})`;
        await Clipboard.setStringAsync(text);
        Alert.alert("Copied", "Quote copied to clipboard");
    };

    return (
        <View style={styles.screen}>
            <Stack.Screen options={{
                title: "Anime Quotes",
                headerStyle: { backgroundColor: theme.colors.background },
                headerTintColor: theme.colors.text,
                headerShadowVisible: false,
            }} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Anime Quotes</Text>
                    <Text style={styles.subtitle}>Iconic lines from legendary characters</Text>
                </View>

                <View style={styles.card}>
                    <MaterialCommunityIcons name="format-quote-open" size={48} color={theme.colors.primary} style={styles.quoteIconTop} />

                    <Text style={styles.quoteText}>
                        "{currentQuote.content}"
                    </Text>

                    <View style={styles.divider} />

                    <View style={styles.characterInfo}>
                        <Text style={styles.characterName}>{currentQuote.character}</Text>
                        <Text style={styles.animeTitle}>{currentQuote.anime}</Text>
                    </View>

                    <MaterialCommunityIcons name="format-quote-close" size={48} color={theme.colors.primary} style={styles.quoteIconBottom} />
                </View>

                <View style={styles.actions}>
                    <Pressable
                        style={({ pressed }) => [styles.mainButton, pressed && styles.buttonPressed]}
                        onPress={getRandomQuote}
                    >
                        <Ionicons name="shuffle" size={24} color={theme.colors.primaryForeground} />
                        <Text style={styles.buttonText}>New Quote</Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
                        onPress={copyToClipboard}
                    >
                        <Ionicons name="copy-outline" size={24} color={theme.colors.primary} />
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}

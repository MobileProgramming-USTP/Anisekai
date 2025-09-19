import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Index = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/images/anime-collage.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.85)", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.9)"]}
          style={styles.overlay}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Welcome to</Text>

            <MaskedView
              maskElement={<Text style={styles.brand}>Anisekai</Text>}
            >
              <LinearGradient
                colors={["#36d1dc", "#5b5ff7", "#a445b2", "#ff0080"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={[styles.brand, { opacity: 0 }]}>Anisekai</Text>
              </LinearGradient>
            </MaskedView>

            <Text style={styles.subtitle}>
              Discover, Stream, and Dive into the World of Anime
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push("/login/login")}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#ff0080", "#a445b2", "#5b5ff7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, width: "100%", height: "100%" },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  content: { alignItems: "center" },
  title: {
    fontSize: 20,
    fontWeight: "300",
    color: "#fff",
    marginBottom: 5,
    textAlign: "center",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  brand: {
    fontSize: 70,
    fontWeight: "900",
    textAlign: "center",
    textShadowColor: "rgba(255,255,255,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#ddd",
    textAlign: "center",
    marginBottom: 35,
    marginTop: 15,
    lineHeight: 22,
    maxWidth: 300,
  },
  button: {
    borderRadius: 30,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#ff0080",
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
  },
  buttonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 30,
  },
  buttonText: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
});

export default Index;

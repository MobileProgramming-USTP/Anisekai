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
          colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]}
          style={styles.overlay}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Welcome to</Text>

            {/* ✅ Proper Gradient Text */}
            <MaskedView
              maskElement={
                <Text style={styles.brand}>Anisekai</Text>
              }
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
              Discover, Explore, and Dive into the World of Anime
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.buttonText}>Get Started</Text>
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
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 5,
    textAlign: "center",
  },
  brand: {
    fontSize: 65,
    fontWeight: "bold",
    textAlign: "center",
    borderColor: "#000000ff",
  },
  subtitle: {
    fontSize: 16,
    color: "#eee",
    textAlign: "center",
    marginBottom: 25,
    paddingHorizontal: 10,
    marginTop: 15,
  },
  button: {
    backgroundColor: "#fcbf49",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: "#fcbf49",
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontWeight: "bold",
    color: "#000",
    fontSize: 18,
  },
});

export default Index;

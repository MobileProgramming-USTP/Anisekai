import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "../styles/indexStyles";

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
              Your anime watchlist tracker to track shows, organize your list, and discover new anime.
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

export default Index;

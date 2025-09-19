import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Home = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Hero Banner */}
      <ImageBackground
        source={require("../../assets/images/anime-collage.png")}
        style={styles.hero}
        imageStyle={{ opacity: 0.85 }}
      >
        <View style={styles.overlay}>
          <Text style={styles.heroText}>Welcome to Anisekai</Text>
          <Text style={styles.heroSub}>Dive into your anime world ✨</Text>
        </View>
      </ImageBackground>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.featureButton}>
            <Text style={styles.featureText}>Waifu Gen</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.featureButton}>
            <Text style={styles.featureText}>Anime Quotes</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.featureButton}>
            <Text style={styles.featureText}>Anime Trace</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.featureButton}>
            <Text style={styles.featureText}>Library</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  hero: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 20,
    borderRadius: 10,
  },
  heroText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fcbf49",
    textAlign: "center",
  },
  heroSub: {
    fontSize: 14,
    color: "#fff",
    marginTop: 5,
    textAlign: "center",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fcbf49",
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  featureButton: {
    flex: 1,
    backgroundColor: "#222",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  featureText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});

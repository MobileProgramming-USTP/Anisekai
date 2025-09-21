import { ImageBackground, ScrollView, Text, TouchableOpacity, View } from "react-native";
import styles from "../styles/homeStyles";

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


import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Dashboard = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome back 👋</Text>
      <Text style={styles.subtitle}>Here’s your dashboard overview</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sample Text</Text>
        <Text style={styles.cardText}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident voluptatibus praesentium veritatis, quasi assumenda, reprehenderit totam mollitia dignissimos aut dolorem eaque placeat iusto, explicabo natus obcaecati error fuga ex vel.</Text>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>+ Add Task</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { //safe area view container style
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fcbf49",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardText: {
    fontSize: 14,
    marginTop: 8,
  },
  button: {
    backgroundColor: "#fcbf49",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    fontWeight: "bold",
    color: "#000",
  },
});

export default Dashboard;

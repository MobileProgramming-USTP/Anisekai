import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Link } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

const Index = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/mirage-logo.png")}
        style={styles.logo}
      />

      <Text style={styles.title}>Login</Text>

      <View style={styles.inputContainer}>
        <FontAwesome name="user" style={styles.icon} />
        <TextInput style={styles.input} placeholder="Username" />
      </View>

      <View style={styles.inputContainer}>
        <FontAwesome name="lock" style={styles.icon} />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry />
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>LOGIN</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Don’t have an account?{" "}
        <Link href="/register" style={styles.link}>
          Sign Up
        </Link>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 50, 
    backgroundColor: "#fff" 
  },
  logo: { 
    width: 150, 
    height: 150, 
    marginBottom: 20 
  },
  title: {
    fontSize: 40, 
    fontWeight: "bold", 
    marginBottom: 20 
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fcbf49",
    borderRadius: 30,
    marginVertical: 12,
    width: "100%",
    paddingHorizontal: 15,
  },
  icon: {
    fontSize: 20,
    color: "#fcbf49",
    marginRight: 5,
    marginLeft: 5,
  },
  input: {
    flex: 1,
    padding: 12,
  },
  button: { 
    backgroundColor: "#fcbf49", 
    padding: 14, 
    borderRadius: 8, 
    alignItems: "center", 
    width: "100%", 
    marginVertical: 20 
  },
  buttonText: { 
    fontWeight: "bold", 
    color: "#000" 
  },
  footer: { 
    fontSize: 14 
  },
  link: { 
    color: "#fcbf49", 
    fontWeight: "bold" 
  },
});

export default Index;

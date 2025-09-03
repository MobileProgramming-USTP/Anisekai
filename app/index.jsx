import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/app-logo.png")}
        style={styles.logo}
      />

      <Text style={styles.title}>Login</Text>

      <TextInput style={styles.input} placeholder="Username" />

      <TextInput style={styles.input} placeholder="Password" secureTextEntry />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Don’t have an account?{" "}
        <Link href="/register" style={styles.link}>
          Sign Up
        </Link>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 40, 
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

  input: {
    borderWidth: 1,
    borderColor: "#fcbf49",
    borderRadius: 10,
    padding: 10,
    marginVertical: 18,
    width: "100%",
    paddingLeft: 20
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

import { FontAwesome } from "@expo/vector-icons";
import { Link } from "expo-router";
import { ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const Register = () => {
  return (
    <ImageBackground
      source={require("../login/assets/anime-collage.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Register</Text>

        {/* Username */}
        <View style={styles.inputContainer}>
          <FontAwesome name="user" style={styles.icon} />
          <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#ddd" />
        </View>

        {/* Password */}
        <View style={styles.inputContainer}>
          <FontAwesome name="lock" style={styles.icon} />
          <TextInput style={styles.input} placeholder="Password" secureTextEntry placeholderTextColor="#ddd" />
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <FontAwesome name="envelope" style={styles.icon} />
          <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" placeholderTextColor="#ddd" />
        </View>

        {/* Mobile */}
        <View style={styles.inputContainer}>
          <FontAwesome name="phone" style={styles.icon} />
          <TextInput style={styles.input} placeholder="Mobile" keyboardType="numeric" placeholderTextColor="#ddd" />
        </View>

        {/* Button */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>
          Already have an account?{" "}
          <Link href="/login/login" style={styles.link}>
            Login
          </Link>
        </Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)", // dark overlay for readability
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: { 
    fontSize: 40, 
    fontWeight: "bold", 
    color: "#fff", 
    marginBottom: 20, 
    textAlign: "center"
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fcbf49",
    borderRadius: 30,
    marginVertical: 8,
    width: "100%",
    paddingHorizontal: 15,
    backgroundColor: "rgba(255,255,255,0.1)", // translucent input bg
  },
  icon: {
    fontSize: 20,
    color: "#fcbf49",
    marginRight: 5,
  },
  input: {
    flex: 1,
    padding: 12,
    color: "#fff", // white text inside inputs
  },
  button: { 
    backgroundColor: "#fcbf49", 
    padding: 14, 
    borderRadius: 8, 
    alignItems: "center", 
    width: "100%", 
    marginVertical: 12
  },
  buttonText: { 
    fontWeight: "bold", 
    color: "#000" 
  },
  footer: { 
    fontSize: 14,
    color: "#fff",
    marginTop: 10
  },
  link: { 
    color: "#fcbf49", 
    fontWeight: "bold" 
  },
});

export default Register;

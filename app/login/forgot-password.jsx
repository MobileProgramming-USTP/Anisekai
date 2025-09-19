import { FontAwesome } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useState } from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleReset = () => {
    alert(`Password reset link sent to: ${email}`);
  };

  return (
    <ImageBackground
      source={require("../../assets/images/anime-collage.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we’ll send you a link to reset your
          password.
        </Text>

        <View style={styles.inputContainer}>
          <FontAwesome name="envelope" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#ccc"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <Pressable style={styles.button} onPress={handleReset}>
          <Text style={styles.buttonText}>SEND RESET LINK</Text>
        </Pressable>

        <Text style={styles.footer}>
          Remember your password?{" "}
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
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#ddd",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fcbf49",
    borderRadius: 30,
    width: "100%",
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  icon: {
    fontSize: 20,
    color: "#fcbf49",
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: "#fff",
  },
  button: {
    backgroundColor: "#fcbf49",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    width: "100%",
    marginVertical: 20,
  },
  buttonText: {
    fontWeight: "bold",
    color: "#000",
    fontSize: 16,
  },
  footer: {
    fontSize: 14,
    color: "#fff",
  },
  link: {
    color: "#fcbf49",
    fontWeight: "bold",
  },
});

export default ForgotPassword;

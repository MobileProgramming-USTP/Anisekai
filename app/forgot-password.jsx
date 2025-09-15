import { FontAwesome } from "@expo/vector-icons"; // 👈 import icons
import { Link } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleReset = () => {
    // ⚡ Here you’ll integrate with your backend / Firebase / API
    alert(`Password reset link sent to: ${email}`);
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/mirage-logo.png")}
        style={styles.logo}
      />

      <Text style={styles.title}>Forgot Password</Text>

      <Text style={styles.subtitle}>
        Enter your email address and we’ll send you a link to reset your password.
      </Text>

      <View style={styles.inputContainer}>
        <FontAwesome name="envelope" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email Address"
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
        <Link href="/" style={styles.link}>
          Login
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
    fontSize: 32, 
    fontWeight: "bold", 
    marginBottom: 10 
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
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
  },
  icon: {
    fontSize: 20,
    color: "#fcbf49",
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
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

export default ForgotPassword;

import { FontAwesome } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const Index = () => {
  // ✅ Hooks should be at the top of the component
  const [isRemembered, setIsRemembered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toggleRememberMe = () => {
    setIsRemembered(!isRemembered);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={!showPassword} 
        />
        <FontAwesome
          name={showPassword ? "eye-slash" : "eye"}
          style={styles.icon}
          onPress={togglePasswordVisibility}
        />
      </View>

      <View style={styles.reminderContainer}>
        <Pressable style={styles.rememberContainer} onPress={toggleRememberMe}>
          <FontAwesome
            name={isRemembered ? "check-square" : "square-o"}
            style={styles.icon}
          />
          <Text style={styles.reminderText}>Remember Me</Text>
        </Pressable>

        <Pressable>
          <Text style={styles.reminderText}>
            <Link href="/forgot-password">Forgot Password?</Link>
          </Text>
        </Pressable>
      </View>

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>LOGIN</Text>
      </Pressable>

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
    marginBottom: 20,
  },
  icon: {
    fontSize: 20,
    color: "#fcbf49",
    marginHorizontal: 5,
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
  reminderText: {
    fontSize: 12,
    color: "#555",
    fontWeight: "bold"
  },
  reminderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
  }
});

export default Index;

import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { useState } from "react";
import {
  ImageBackground,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import styles from "../../styles/forgotPasswordStyles";

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
      <LinearGradient
        colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.8)"]}
        style={styles.overlay}
      >
        <View style={styles.container}>
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
      </LinearGradient>
    </ImageBackground>
  );
};

export default ForgotPassword;

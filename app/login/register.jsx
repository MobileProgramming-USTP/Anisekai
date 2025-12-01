import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { authApi } from "../../backend/src/services/dataApi";
import styles from "../../styles/registerStyles";

const Register = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.password) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      await authApi.register(form);
      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => router.push("/login/login") },
      ]);
    } catch (err) {
      const message =
        err?.response?.data?.message ??
        err?.data?.details ??
        err?.message ??
        "Network error. Please check your connection and API base URL.";
      Alert.alert("Registration Failed", message);
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.title}>Register</Text>

          <View style={styles.inputContainer}>
            <FontAwesome name="user" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#ccc"
              value={form.username}
              onChangeText={(t) => setForm({ ...form, username: t })}
            />
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome name="envelope" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              placeholderTextColor="#ccc"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(t) => setForm({ ...form, email: t })}
            />
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome name="lock" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#ccc"
              secureTextEntry={!showPassword}
              value={form.password}
              onChangeText={(t) => setForm({ ...form, password: t })}
            />
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setShowPassword((prev) => !prev)}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={`${showPassword ? "Hide" : "Show"} password`}
            >
              <FontAwesome
                name={showPassword ? "eye-slash" : "eye"}
                style={styles.toggleIcon}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footer}>
            Already have an account?{" "}
            <Link href="/login/login" style={styles.link}>
              Login
            </Link>
          </Text>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

export default Register;


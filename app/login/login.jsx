import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import WelcomeBanner from "../../components/WelcomeBanner";
import { authApi } from "../../backend/src/services/dataApi";
import styles from "../../styles/loginStyles";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const router = useRouter();
  const { signIn } = useAuth();

  const [form, setForm] = useState({ identifier: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🔹 Banner state
  const [showWelcome, setShowWelcome] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);

  const handleLogin = async () => {
    if (!form.identifier || !form.password) {
      alert("Please enter a username/email and password.");
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.login({
        identifier: form.identifier.trim(),
        password: form.password,
      });
      const signedInUser = signIn(response);

      setLoggedUser(signedInUser?.username ?? form.identifier.trim());
      setShowWelcome(true);

      // redirect after banner fades out
      setTimeout(() => router.replace("/(tabs)/home"), 1800);
    } catch (err) {
      const message =
        err?.response?.data?.message ??
        err?.data?.details ??
        err?.message ??
        "Network error. Please check your connection and API base URL.";
      alert("Login Failed: " + message);
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
          <Text style={styles.title}>Login</Text>

          <View style={styles.inputContainer}>
            <FontAwesome name="envelope" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email or Username"
              placeholderTextColor="#ccc"
              autoCapitalize="none"
              value={form.identifier}
              onChangeText={(t) => setForm({ ...form, identifier: t })}
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

          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe((prev) => !prev)}
              activeOpacity={0.7}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: rememberMe }}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <FontAwesome name="check" style={styles.checkboxIcon} />}
              </View>
              <Text style={styles.rememberMeText}>Remember me</Text>
            </TouchableOpacity>
            <Link href="/login/forgot-password" style={styles.link}>
              Forgot Password?
            </Link>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>LOGIN</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footer}>
            Don&apos;t have an account?{" "}
            <Link href="/login/register" style={styles.link}>
              Sign Up
            </Link>
          </Text>
        </View>

        {/* 🔹 Show Welcome Banner sa taas after login */}
        {showWelcome && (
          <WelcomeBanner username={loggedUser} onFinish={() => setShowWelcome(false)} />
        )}
      </LinearGradient>
    </ImageBackground>
  );
};

export default Login;

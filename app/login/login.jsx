import { FontAwesome } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import WelcomeBanner from "../../components/WelcomeBanner";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const router = useRouter();
  const { signIn } = useAuth();
  const loginUser = useMutation(api["functions/auth"].login);

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
      const user = await loginUser({
        identifier: form.identifier.trim(),
        password: form.password,
      });
      signIn(user);

      setLoggedUser(user.username);
      setShowWelcome(true);

      // redirect after banner fades out
      setTimeout(() => router.replace("/(tabs)/home"), 2800);
    } catch (err) {
      const message = err?.data?.details ?? err?.message ?? "Invalid credentials.";
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
            Don't have an account?{" "}
            <Link href="/login/register" style={styles.link}>
              Sign Up
            </Link>
          </Text>
        </View>

        {/* 🔹 Show Welcome Banner */}
        {showWelcome && (
          <WelcomeBanner username={loggedUser} onFinish={() => setShowWelcome(false)} />
        )}
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  container: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 25,
    borderRadius: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fcbf49",
    textAlign: "center",
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fcbf49",
    borderRadius: 30,
    marginVertical: 10,
    width: "100%",
    paddingHorizontal: 15,
  },
  icon: {
    fontSize: 18,
    color: "#fcbf49",
    marginHorizontal: 5,
  },
  input: {
    flex: 1,
    padding: 12,
    color: "#fff",
  },
  toggleButton: {
    padding: 6,
  },
  toggleIcon: {
    fontSize: 18,
    color: "#fcbf49",
    marginLeft: 4,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 5,
    marginBottom: 10,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#fcbf49",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  checkboxChecked: {
    backgroundColor: "#fcbf49",
  },
  checkboxIcon: {
    color: "#000",
    fontSize: 14,
  },
  rememberMeText: {
    color: "#fff",
    marginLeft: 8,
  },
  button: {
    backgroundColor: "#fcbf49",
    padding: 14,
    borderRadius: 25,
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
    textAlign: "center",
  },
  link: {
    color: "#fcbf49",
    fontWeight: "bold",
  },
  // 🔹 Banner styles
  banner: {
    position: "absolute",
    top: 60,
    left: "10%",
    right: "10%",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "rgba(252,191,73,0.9)",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  bannerText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Login;

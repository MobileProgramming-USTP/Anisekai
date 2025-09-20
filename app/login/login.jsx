import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const router = useRouter();
  const { signIn } = useAuth();
  const loginUser = useMutation(api["functions/auth"].login);

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      Alert.alert("Missing Fields", "Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      const user = await loginUser(form);
      signIn(user);
      Alert.alert("Welcome", `Hello, ${user.username}!`, [
        { text: "OK", onPress: () => router.replace("/(tabs)/home") },
      ]);
    } catch (err) {
      Alert.alert("Login Failed", err.message || "Invalid credentials.");
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
              placeholder="Email"
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
            <FontAwesome
              name={showPassword ? "eye-slash" : "eye"}
              style={styles.icon}
              onPress={() => setShowPassword(!showPassword)}
            />
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
            Don’t have an account?{" "}
            <Link href="/login/register" style={styles.link}>
              Sign Up
            </Link>
          </Text>
        </View>
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
});

export default Login;




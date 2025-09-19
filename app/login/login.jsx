import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
    ImageBackground,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const Login = () => {
  const [isRemembered, setIsRemembered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const toggleRememberMe = () => setIsRemembered(!isRemembered);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleLogin = () => {
    router.push("/(tabs)/home");
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
            <FontAwesome name="user" style={styles.icon} />
            <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#ccc" />
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome name="lock" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#ccc"
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

            <Link href="/login/forgot-password" style={styles.reminderText}>
              Forgot Password?
            </Link>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>LOGIN</Text>
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
  reminderText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
  },
  reminderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default Login;

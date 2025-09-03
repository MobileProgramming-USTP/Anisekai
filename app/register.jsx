import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Link } from "expo-router";

export default function Register() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/app-logo.png")} // change to your logo
        style={styles.logo}
      />

      <Text style={styles.title}>Register</Text>

      <TextInput style={styles.input} placeholder="Username" />

      <TextInput style={styles.input} placeholder="Password" secureTextEntry />

      <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" />

      <TextInput style={styles.input} placeholder="Mobile" keyboardType="phone-pad" />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Already have an account?{" "}
        <Link href="/" style={styles.link}>
          Login
        </Link>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 40, 
    backgroundColor: "#fff", 
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

  input: {
    borderWidth: 1,
    borderColor: "#fcbf49",
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    width: "100%",
    paddingLeft: 20
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
    fontSize: 14 
},

  link: { 
    color: "#fcbf49", 
    fontWeight: "bold" 
},
});

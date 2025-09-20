import { useRouter } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    signOut();
    router.replace("/login/login");
  };

  const isSignedIn = Boolean(user);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png" }}
          style={styles.avatar}
        />
        <Text style={styles.username}>{user?.username ?? "Guest"}</Text>
        <Text style={styles.email}>
          {user?.email ?? "Sign in to see your profile details"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity style={styles.item} disabled={!isSignedIn}>
          <Text style={[styles.itemText, !isSignedIn && styles.disabledText]}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} disabled={!isSignedIn}>
          <Text style={[styles.itemText, !isSignedIn && styles.disabledText]}>Favorites</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} disabled={!isSignedIn}>
          <Text style={[styles.itemText, !isSignedIn && styles.disabledText]}>My Library</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemText}>Settings</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, !isSignedIn && { opacity: 0.4 }]}
        onPress={handleLogout}
        disabled={!isSignedIn}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  header: {
    alignItems: "center",
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fcbf49",
  },
  email: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 5,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fcbf49",
    marginBottom: 15,
  },
  item: {
    backgroundColor: "#222",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  itemText: {
    fontSize: 16,
    color: "#fff",
  },
  disabledText: {
    color: "#555",
  },
  logoutButton: {
    backgroundColor: "#e63946",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 40,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});

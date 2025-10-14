import { useRouter } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

import styles from "../../../styles/profileStyles";
import { useAuth } from "../../context/AuthContext";

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


import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import styles from "../../../styles/profileEditStyles";
import { useAuth } from "../../context/AuthContext";

const sanitizeText = (value) => value?.trim() ?? "";

const ProfileEdit = () => {
  const router = useRouter();
  const { user, updateProfile } = useAuth();

  const isSignedIn = Boolean(user);

  const [form, setForm] = useState({
    username: user?.username ?? "",
    email: user?.email ?? "",
    avatar: user?.avatar ?? "",
  });
  const [saving, setSaving] = useState(false);

  const resetForm = useCallback(() => {
    setForm({
      username: user?.username ?? "",
      email: user?.email ?? "",
      avatar: user?.avatar ?? "",
    });
  }, [user?.username, user?.email, user?.avatar]);

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  const placeholderInitial = useMemo(() => {
    const basis = sanitizeText(form.username) || sanitizeText(user?.username) || "U";
    return basis.charAt(0).toUpperCase();
  }, [form.username, user?.username]);

  const previewAvatar = useMemo(() => {
    const candidate = sanitizeText(form.avatar);
    if (candidate) {
      return candidate;
    }
    const existing = sanitizeText(user?.avatar);
    return existing || null;
  }, [form.avatar, user?.avatar]);

  const isDirty = useMemo(() => {
    return (
      sanitizeText(form.username) !== sanitizeText(user?.username) ||
      sanitizeText(form.email) !== sanitizeText(user?.email) ||
      sanitizeText(form.avatar) !== sanitizeText(user?.avatar)
    );
  }, [form.username, form.email, form.avatar, user?.username, user?.email, user?.avatar]);

  const handleChange = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    resetForm();
    router.back();
  };

  const handleBack = () => {
    resetForm();
    router.back();
  };

  const handleSave = async () => {
    if (!isSignedIn) {
      router.replace("/login/login");
      return;
    }

    const username = sanitizeText(form.username);
    const email = sanitizeText(form.email);
    const avatar = sanitizeText(form.avatar);

    setSaving(true);
    try {
      await updateProfile({
        username: username || user?.username || "User",
        email: email || user?.email || "",
        avatar: avatar || null,
      });
      router.back();
    } catch (error) {
      const message =
        error?.data?.details ?? error?.message ?? "Something went wrong while saving your profile.";
      Alert.alert("Update Failed", message);
    } finally {
      setSaving(false);
    }
  };

  const handleGoToLogin = () => {
    router.replace("/login/login");
  };

  if (!isSignedIn) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Sign in required</Text>
          <Text style={styles.emptyBody}>
            You need to sign in before you can update your profile details and avatar.
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleGoToLogin}>
            <Text style={styles.emptyButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back to profile"
          >
            <Ionicons name="arrow-back" size={22} color="#A5B2C2" />
          </TouchableOpacity>
          <Text style={styles.header}>Edit Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.avatarPreview}>
          {previewAvatar ? (
            <Image source={{ uri: previewAvatar }} style={styles.avatarImage} resizeMode="cover" />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>{placeholderInitial}</Text>
            </View>
          )}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Username</Text>
            <TextInput
              value={form.username}
              onChangeText={handleChange("username")}
              placeholder="Your display name"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              style={styles.input}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              value={form.email}
              onChangeText={handleChange("email")}
              placeholder="you@example.com"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />
          </View>

          <View style={[styles.fieldGroup, { marginBottom: 0 }]}>
            <Text style={styles.fieldLabel}>Avatar URL</Text>
            <TextInput
              value={form.avatar}
              onChangeText={handleChange("avatar")}
              placeholder="https://example.com/avatar.png"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
            />
            <Text style={styles.helperText}>
              Paste a direct image link to use it as your avatar. Leave blank to use the default
              avatar.
            </Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                (!isDirty || saving) && styles.disabledButton,
              ]}
              onPress={handleSave}
              disabled={!isDirty || saving}
            >
              {saving ? (
                <ActivityIndicator color="#0b141f" />
              ) : (
                <Text style={styles.buttonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileEdit;

import React, {
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import EditProfileForm from "../../components/profile/EditProfileForm";

import { supabase } from "../../lib/supabase";

export default function EditProfileScreen() {
  const [userId, setUserId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const {
          data,
        } = await supabase.auth.getSession();

        const sessionUser =
          data.session?.user;

        if (!sessionUser) {
          router.replace("/(auth)/signin");
          return;
        }

        setUserId(sessionUser.id);
      } catch (error) {
        console.log(
          "[EDIT PROFILE] Session error:",
          error
        );

        router.replace("/(auth)/signin");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={styles.loadingContainer}
        >
          <ActivityIndicator
            size="small"
            color="#6A00F4"
          />

          <Text style={styles.loadingText}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            ‹
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          Edit Profile
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
      >
        <EditProfileForm
          userId={userId}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0712",
  },
  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#24152F",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    color: "#EDEDED",
    fontSize: 36,
    fontWeight: "300",
    lineHeight: 40,
  },
  title: {
    color: "#EDEDED",
    fontSize: 18,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#999",
    fontSize: 14,
    marginTop: 10,
  },
});
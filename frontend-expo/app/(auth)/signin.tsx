import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Stack, router } from "expo-router";

import { styles } from "../../styles/auth/signin.styles"
import AuthHeader from "../../components/auth/AuthHeader";
import AuthFooter from "../../components/auth/AuthFooter";
import AuthInput from "../../components/auth/AuthInput";
import PasswordInput from "../../components/auth/PasswordInput";
import GoogleButton from "../../components/auth/GoogleButton";

import { authService } from "../../services/auth.service";
import { useAuthStore } from "../../stores/authStore";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<
    "email" | "google" | ""
  >("");

  const [error, setError] = useState("");

  const handleEmailLogin = async () => {
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);
    setLoadingType("email");

    try {
      console.log("[SIGNIN] Email login");

      await authService.signIn({
        email: email.trim(),
        password,
      });

      console.log("[SIGNIN] Login successful");

      await useAuthStore.getState().hydrateAuth();

      router.replace("/(tabs)");

      return;
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
      setLoadingType("");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");

    setLoading(true);
    setLoadingType("google");

    try {
      console.log("[GOOGLE] Starting Google sign in");

      await authService.signInWithGoogle();

      console.log("[GOOGLE] OAuth launched");
    } catch (err: any) {
      setError(err?.message ?? "Google sign in failed.");
    } finally {
      setLoading(false);
      setLoadingType("");
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
          >
            <AuthHeader
              title="Sign In"
              subtitle="Welcome back. Sign in to continue."
            />

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <AuthInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <PasswordInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
            />

            <View style={styles.buttonContainer}>
              <Text
                onPress={loading ? undefined : handleEmailLogin}
                style={[
                  styles.button,
                  loading ? styles.buttonDisabled : undefined,
                ]}
              >
                {loading && loadingType === "email"
                  ? "Signing In..."
                  : "Sign In"}
              </Text>

              {loading && loadingType === "email" && (
                <ActivityIndicator
                  style={styles.loader}
                  size="small"
                  color="#FFFFFF"
                />
              )}
            </View>

            <View style={styles.dividerContainer}>
              <View style={styles.line} />
              <Text style={styles.or}>OR</Text>
              <View style={styles.line} />
            </View>

            <GoogleButton
              loading={loading && loadingType === "google"}
              onPress={handleGoogleLogin}
            />

            <AuthFooter
              text="Don't have an account?"
              actionText="Register here"
              onPress={() => router.push("/(auth)/signup")}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
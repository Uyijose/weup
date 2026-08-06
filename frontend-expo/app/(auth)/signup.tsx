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
import { authService } from "../../services/auth.service";

import AuthHeader from "../../components/auth/AuthHeader";
import AuthFooter from "../../components/auth/AuthFooter";
import AuthInput from "../../components/auth/AuthInput";
import PasswordInput from "../../components/auth/PasswordInput";

import { styles } from "../../styles/auth/signup.styles";

export default function SignupScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const validate = () => {
    if (!firstName.trim()) {
      setError("Please enter your first name.");
      return false;
    }

    if (!lastName.trim()) {
      setError("Please enter your last name.");
      return false;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return false;
    }

    if (!password) {
      setError("Please enter a password.");
      return false;
    }

    if (!confirmPassword) {
      setError("Please confirm your password.");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    if (/\s/.test(password)) {
      setError("Password cannot contain spaces.");
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    setError("");

    if (!validate()) return;

    setLoading(true);

    try {

      const response = await authService.signUp({
        firstName,
        lastName,
        email: email.trim(),
        password,
      });

      if (!response.success) {
        throw new Error(response.message ?? "Signup failed.");
      }

      router.replace("/(auth)/signin");
    } catch (err: any) {
      console.log("[SIGNUP SCREEN] Signup failed");

      console.log(err);

      console.log(err?.response?.data);

      console.log(err?.message);

      setError(err?.message ?? "Signup failed.");
    } finally {
      setLoading(false);
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
              title="Create Account"
              subtitle="Create your account to get started."
            />

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <AuthInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First Name"
              autoCapitalize="words"
            />

            <AuthInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last Name"
              autoCapitalize="words"
            />

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

            <PasswordInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm Password"
            />

            <View style={styles.buttonContainer}>
              <Text
                onPress={loading ? undefined : handleSignup}
                style={[
                  styles.button,
                  loading ? styles.buttonDisabled : undefined,
                ]}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Text>

              {loading && (
                <ActivityIndicator
                  style={styles.loader}
                  size="small"
                  color="#FFFFFF"
                />
              )}
            </View>

            <AuthFooter
              text="Already have an account?"
              actionText="Sign In"
              onPress={() => router.push("/(auth)/signin")}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
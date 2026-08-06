import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import {
  SignInPayload,
  SignUpPayload,
  SignUpData,
} from "../types/auth";
import { ApiResponse } from "../types/api";

import { api } from "../lib/api";

class AuthService {
  async signIn({ email, password }: SignInPayload) {
    if (!email || !password) {
      throw new Error("Please enter email and password");
    }

    console.log("[AUTH] Checking if user exists:", email);

    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (fetchError || !existingUser) {
      throw new Error("USER_NOT_FOUND");
    }

    console.log("[AUTH] User exists. Signing in...");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    await useAuthStore.getState().hydrateAuth();

    return useAuthStore.getState().user;
  }

  generateUsername(fullName: string) {
    const parts = fullName.trim().split(" ").filter(Boolean);

    const first =
      parts[0]?.slice(0, 2).toLowerCase() || "xx";

    const last =
      parts[1]?.slice(-2).toLowerCase() || "xx";

    const randomDigits = Math.floor(
      Math.random() * 900 + 100
    );

    return `${first}${last}${randomDigits}`;
  }

  async signUp({
    firstName,
    lastName,
    email,
    password,
    avatarUrl,
  }: SignUpPayload): Promise<ApiResponse<SignUpData>> {
    if (!firstName.trim()) {
      throw new Error("Please enter your first name.");
    }

    if (!lastName.trim()) {
      throw new Error("Please enter your last name.");
    }

    if (!email.trim()) {
      throw new Error("Please enter your email.");
    }

    if (!password) {
      throw new Error("Please enter a password.");
    }

    if (/\s/.test(password)) {
      throw new Error("Password cannot contain spaces.");
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    const username = this.generateUsername(fullName);

    console.log("[SIGNUP] Backend URL:", process.env.EXPO_PUBLIC_BACKEND_URL);

    console.log("[SIGNUP] Request Body:", {
      email: email.trim(),
      password,
      fullName,
      username,
      avatarUrl,
    });

    try {
      const response = await api.post(
        "/api/auth/signup",
        {
          email: email.trim(),
          password,
          fullName,
          username,
          avatarUrl,
        }
      );

      console.log("[SIGNUP] Status:", response.status);

      console.log("[SIGNUP] Raw Response:", response.data);

      const result = {
        success: true,
        data: response.data,
      };

      console.log("[SIGNUP] Returning:", result);

      return result;
    } catch (error: any) {
      console.log("[SIGNUP] Axios Error");

      console.log("[SIGNUP] Message:", error.message);

      console.log("[SIGNUP] Code:", error.code);

      console.log("[SIGNUP] Response:", error.response?.data);

      console.log("[SIGNUP] Status:", error.response?.status);

      console.log("[SIGNUP] Config:", error.config);

      throw error;
    }
  }

  async signOut() {
    await useAuthStore.getState().logout();
  }

  async getSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    return data.session;
  }

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) {
      throw error;
    }

    return data;
  }

  async forgotPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      throw error;
    }

    return true;
  }
}

export const authService = new AuthService();
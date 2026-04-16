import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Link from "next/link";
import { supabase } from "../../utils/supabaseClient";

const Signin = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState("");
  const [error, setError] = useState("");

  // ✅ Email + Password Sign In
  const signInWithEmail = async () => {
    setLoading(true);
    setLoadingType("email");
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      setLoading(false);
      return;
    }

    try {
      console.log("Checking if user exists in DB:", email);

      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (fetchError || !existingUser) {
        console.log("User not found in DB");

        setError("User not found. Redirecting to signup...");
        
        setTimeout(() => {
          router.push("/auth/signup");
        }, 2000);

        setLoading(false);
        return;
      }

      console.log("User exists → attempting login");

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log("Password incorrect or auth failed");

        setError("Invalid credentials");
        setLoading(false);
        return;
      }

      console.log("Login successful → redirecting");
      router.push("/explore");

    } catch (err) {
      console.log("Signin error:", err.message);
      setError(err.message);
    }

    setLoading(false);
  };

  // ✅ Google OAuth Sign In
  const signInWithGoogle = async () => {
    setLoading(true);
    setLoadingType("google");
    setError("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/google-callback`,
        },
      });

      if (error) throw error;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Head>
        <title>Sign In - weup</title>
      </Head>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="auth-card"
      >
        <h1>Sign In</h1>

        {error && <p className="auth-error">{error}</p>}

        <input
          className="auth-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div style={{ position: "relative" }}>
          <input
            className="auth-input"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => {
              console.log("Signin password typing:", e.target.value);
              setPassword(e.target.value);
            }}
          />
          <span
            className="password-eye"
            onClick={() => {
              console.log("Toggle signin password visibility");
              setShowPassword(!showPassword);
            }}
          >
            {showPassword ? (
              <svg viewBox="0 0 24 24">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zm10 4a4 4 0 100-8 4 4 0 000 8z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24">
                <path d="M1 1l22 22M2 12s3.5-7 10-7c2.1 0 4 .7 5.6 1.8M22 12s-3.5 7-10 7c-2.1 0-4-.7-5.6-1.8"/>
              </svg>
            )}
          </span>
        </div>

        <button
          className="auth-button"
          onClick={signInWithEmail}
          disabled={loading}
        >
          {loading && loadingType === "email" ? "Signing in..." : "Sign In"}
        </button>

        {/* <div className="divider">or</div>

        <button
          className="google-btn"
          onClick={signInWithGoogle}
          disabled={loading}
        >
          {loading && loadingType === "google"
            ? "Connecting to Google..."
            : "Continue with Google"}
        </button> */}
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup">Register here</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signin;
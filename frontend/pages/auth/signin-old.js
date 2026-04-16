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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If user doesn't exist OR wrong password
        if (error.message.toLowerCase().includes("invalid login")) {
          router.push("/auth/signup?message=not-registered");
        } else {
          throw error;
        }
        return;
      }
      router.push("/explore");
    } catch (err) {
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

        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="auth-button"
          onClick={signInWithEmail}
          disabled={loading}
        >
          {loading && loadingType === "email" ? "Signing in..." : "Sign In"}
        </button>

        <div className="divider">or</div>

        <button
          className="google-btn"
          onClick={signInWithGoogle}
          disabled={loading}
        >
          {loading && loadingType === "google"
            ? "Connecting to Google..."
            : "Continue with Google"}
        </button>
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup">Register here</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signin;
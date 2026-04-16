import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";

const Signup = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateUsername = (fullName) => {
    const parts = fullName.trim().split(" ").filter(Boolean);
    const first = parts[0]?.slice(0, 2).toLowerCase() || "xx";
    const last = parts[1]?.slice(-2).toLowerCase() || "xx";
    const randomDigits = Math.floor(Math.random() * 900 + 100);
    return `${first}${last}${randomDigits}`;
  };

  const [isAdult, setIsAdult] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    setError("");
    try {
      if (!isAdult) {
        alert("You must confirm that you are 18+ to register");
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        console.log("Passwords do not match", password, confirmPassword);
        setError("Passwords do not match");
        setLoading(false);
        return;
      }
      if (/\s/.test(password)) {
        alert("Password cannot contain spaces");
        setLoading(false);
        return;
      }

      const fullName = `${firstName} ${lastName}`;
      const username = generateUsername(fullName);

      if (/\s/.test(username)) {
        alert("Generated username cannot contain spaces");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, username, is_adult: isAdult }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Signup failed");
      router.push("/auth/signin");
    } catch (err) {
      console.log("Signup error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Head>
        <title>Sign Up - weup</title>
      </Head>

      <div className="auth-card">
        <h1>Create Account</h1>

        {error && <p className="auth-error">{error}</p>}

        <input
          className="auth-input"
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          className="auth-input"
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
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
              console.log("Password typing:", e.target.value);
              setPassword(e.target.value);
            }}
          />
          <span
            className="password-eye"
            onClick={() => {
              console.log("Toggle password visibility");
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
        <div style={{ position: "relative" }}>
          <input
            className="auth-input"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => {
              console.log("Confirm Password typing:", e.target.value);
              setConfirmPassword(e.target.value);
            }}
          />
          <span
            className="password-eye"
            onClick={() => {
              console.log("Toggle confirm password visibility");
              setShowConfirmPassword(!showConfirmPassword);
            }}
          >
            {showConfirmPassword ? (
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

        <div style={{ marginBottom: "15px", textAlign: "left", color: "#fff" }}>
          <input
            type="checkbox"
            id="isAdult"
            checked={isAdult}
            onChange={(e) => {
              console.log("is_adult checkbox:", e.target.checked);
              setIsAdult(e.target.checked);
            }}
            style={{ marginRight: "10px" }}
          />
          <label htmlFor="isAdult">I confirm that I am 18+ years old</label>
        </div>

        <button className="auth-button" onClick={handleSignup} disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        <p>
          Already have an account?{" "}
          <Link href="/auth/signin">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
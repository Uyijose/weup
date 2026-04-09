import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";

export default function GoogleCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleGoogleSignIn = async () => {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const token = hashParams.get("access_token");

      if (!token) {
        router.push("/auth/signin");
        return;
      }
      localStorage.setItem("access_token", token);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google-sync`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (!res.ok) {
          router.push("/auth/signin");
          return;
        }
        router.push("/explore");
      } catch (err) {
        router.push("/auth/signin");
      }
    };

    handleGoogleSignIn();
  }, [router]);

  return <p>Processing Google login...</p>;
}
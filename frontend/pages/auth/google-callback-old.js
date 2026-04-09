import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";

export default function GoogleCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleGoogleSignIn = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        router.push("/auth/signin");
        return;
      }

      if (!session) {
        router.push("/auth/signin");
        return;
      }

      const user = session.user;
      const email = user.email;
      const fullName =
        user.user_metadata?.name ||
        `${user.user_metadata?.given_name || ""} ${user.user_metadata?.family_name || ""}`.trim() ||
        "Anonymous User";
      const generateUsername = (name) => {
        const parts = name.trim().split(" ").filter(Boolean);
        const first = parts[0]?.slice(0, 2).toLowerCase() || "xx";
        const last = parts[1]?.slice(-2).toLowerCase() || "xx";
        const randomDigits = Math.floor(Math.random() * 900 + 100);
        return `${first}${last}${randomDigits}`;
      };

      let username = generateUsername(fullName);
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("id, username")
        .eq("email", email)
        .single();
      if (!existingUser) {
        const { error: insertError } = await supabase.from("users").insert({
          email,
          full_name: fullName,
          username,
        });
      } else if (!existingUser.username) {
        const { error: updateError } = await supabase
          .from("users")
          .update({
            full_name: fullName,
            username,
          })
          .eq("email", email);
      } else {
        username = existingUser.username;
      }

      router.push("/explore");
    };

    handleGoogleSignIn();
  }, [router]);

  return <p>Processing Google login...</p>;
}
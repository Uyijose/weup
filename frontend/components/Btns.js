import React, { useState, useEffect } from "react";
import avatarFallback from "./assets/avatar-fallback.jpg";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

const Btns = () => {
  const [user, setUser] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const router = useRouter();
  
  // Track user session
  useEffect(() => {
    const getSessionAndCreators = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);

      const { data: creators, error } = await supabase
        .from("users")
        .select("id, creator_username, creator_avatar_url")
        .eq("is_creator", true);

      if (!error && creators) {
        const shuffled = creators.sort(() => 0.5 - Math.random());
        setSuggestions(shuffled.slice(0, 8));
      }
    };

    getSessionAndCreators();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);
  return (
    <>
      <div className="btns">
        <a onClick={() => router.push("/posts")} className="flex gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-pink-500">
            <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
            <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
          </svg>
          <span>For You</span>
        </a>
        <a onClick={() => router.push("/subscriptions")} className="flex gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499l2.154 4.363 4.814.7-3.484 3.396.822 4.793-4.306-2.264-4.306 2.264.822-4.793-3.484-3.396 4.814-.7 2.154-4.363z" />
          </svg>
          <span>Your Subscriptions</span>
        </a>

        <a onClick={() => router.push("/explore")} className="flex gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Explore</span>
        </a>
        <a
          onClick={() => router.push("/creator")}
          className="flex gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.118-2.998a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5zm-7.5 8.998a7.5 7.5 0 0115 0"
            />
          </svg>
          <span>Creators</span>
        </a>
        <a href="#" className="flex gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <span>Live</span>
        </a>
      </div>
      {!user && (
        <div className="login">
          <p>Log in to follow creators, like videos, and view comments</p>
          <button onClick={() => router.push("/auth/signin")}>Log in</button>
        </div>
      )}
      <div className="accounts">
        <p style={{ fontSize: "1.1rem", fontWeight: "700", color: "#FF4FA3", marginBottom: "0.75rem", marginTop: "1rem", letterSpacing: "0.5px" }}
        >
          Suggested Creators
        </p>
        {suggestions.map((creator) => (
          <div
            className="user cursor-pointer"
            key={creator.id}
            onClick={() => router.push(`/creator/${creator.creator_username}`)}
          >
            <img
              src={creator.creator_avatar_url || avatarFallback.src}
              alt={creator.creator_username}
            />
            <h6 className="username">@{creator.creator_username}</h6>
          </div>
        ))}
      </div>
    </>
  );
};

export default Btns;
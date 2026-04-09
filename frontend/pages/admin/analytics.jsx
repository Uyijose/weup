import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useRouter } from "next/router";
import AdminHeader from "../../components/AdminHeader";

const AnalyticsAdmin = () => {
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData.session?.user;

      if (!currentUser) {
        router.push("/");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", currentUser.id)
        .single();

      if (!profile || !profile.is_admin) {
        router.push("/");
      } else {
        setLoading(false);
        const { count: usersCount } = await supabase.from("users").select("*", { count: "exact" });
        const { count: postsCount } = await supabase.from("posts").select("*", { count: "exact" });
        const { count: commentsCount } = await supabase.from("comments").select("*", { count: "exact" });

        setAnalytics({ usersCount, postsCount, commentsCount });
      }
    };

    checkAdminAndFetch();
  }, []);

  if (loading) return <p style={{ color: "white" }}>Checking admin...</p>;

  return (
    <div className="admin-container">
      <AdminHeader title="Analytics Dashboard" />
      <div className="analytics-cards">
        <div className="card">Total Users: {analytics.usersCount}</div>
        <div className="card">Total Posts: {analytics.postsCount}</div>
        <div className="card">Total Comments: {analytics.commentsCount}</div>
      </div>
    </div>
  );
};

export default AnalyticsAdmin;
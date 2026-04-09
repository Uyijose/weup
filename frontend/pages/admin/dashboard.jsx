import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useRouter } from "next/router";
import AdminHeader from "../../components/AdminHeader";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
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
        setUser(currentUser);
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) return <p style={{ color: "white" }}>Checking admin...</p>;

  return (
    <div className="admin-container">
      <AdminHeader title="Admin Dashboard" />
    </div>
  );
};

export default Dashboard;
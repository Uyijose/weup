import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

const AdminHeader = ({ title = "Admin Dashboard" }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData.session?.user;
      if (!currentUser) {
        console.log("AdminHeader: no user session, redirecting");
        if (typeof window !== "undefined") router.push("/");
        return;
      }

      const { data: profile, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (error || !profile) {
        console.log("AdminHeader: failed fetching profile, redirecting", error);
        if (typeof window !== "undefined") router.push("/");
        return;
      }

      if (!profile.is_admin) {
        console.log("AdminHeader: user is not admin, redirecting", profile.id);
        if (typeof window !== "undefined") router.push("/");
        return;
      }

      setUser(profile);
      console.log("AdminHeader: admin access granted", profile.id);
    };
    fetchUser();
  }, []);

  if (!user) {
    console.log("AdminHeader: waiting for admin verification");
    return null;
  }

  return (
    <div className="admin-header">
      <div>
        <h1>{title}</h1>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button onClick={() => router.push("/")}>Home</button>
          {user?.avatar_url && (
            <img
              src={user.avatar_url}
              alt="Profile"
              onClick={() => router.push("/profile")}
            />
          )}
        </div>
      </div>

      <div className="admin-buttons">
        <button onClick={() => router.push("/admin/users")}>Manage Users</button>
        <button onClick={() => router.push("/admin/reports")}>View Reports</button>
        <button onClick={() => router.push("/admin/payments")}>Payments</button>
        <button onClick={() => router.push("/admin/ads")}>Ads</button>
        <button onClick={() => router.push("/admin/analytics")}>Analytics</button>
        <button onClick={() => router.push("/admin/creator-requests")}>Creator Requests</button>
      </div>
    </div>
  );
};

export default AdminHeader;

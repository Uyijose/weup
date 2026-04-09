import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import AdminHeader from "../../components/AdminHeader";
import { useRouter } from "next/router";

const ReportsAdmin = () => {
  const [reports, setReports] = useState([]);
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
        // fetch reports
        const { data } = await supabase.from("reports").select("*");
        setReports(data || []);
      }
    };

    checkAdminAndFetch();
  }, []);

  if (loading) return <p style={{ color: "white" }}>Checking admin...</p>;

  return (
    <div className="admin-container">
      <AdminHeader title="Reports Dashboard" />
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Reported By</th>
            <th>Target ID</th>
            <th>Type</th>
            <th>Status</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.user_id}</td>
              <td>{r.target_id}</td>
              <td>{r.type}</td>
              <td>{r.status}</td>
              <td>{new Date(r.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportsAdmin;
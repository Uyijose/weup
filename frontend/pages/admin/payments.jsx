import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import AdminHeader from "../../components/AdminHeader";
import { useRouter } from "next/router";

const PaymentsAdmin = () => {
  const [payments, setPayments] = useState([]);
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
        const { data } = await supabase.from("payouts").select("*");
        setPayments(data || []);
      }
    };

    checkAdminAndFetch();
  }, []);

  if (loading) return <p style={{ color: "white" }}>Checking admin...</p>;

  return (
    <div className="admin-container">
      <AdminHeader title="Payments Dashboard" />
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>User ID</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Requested At</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.user_id}</td>
              <td>${p.amount}</td>
              <td>{p.status}</td>
              <td>{new Date(p.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentsAdmin;
import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import AdminHeader from "../../components/AdminHeader";

const CreatorRequestsAdmin = () => {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from("creator_requests")
      .select("*, users(username, email)")
      .eq("status", "pending");
    setRequests(data || []);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const approveRequest = async (id, userId) => {
    await supabase.from("users").update({ is_creator: true }).eq("id", userId);
    await supabase.from("creator_requests").update({ status: "approved" }).eq("id", id);
    fetchRequests();
  };

  const rejectRequest = async (id) => {
    await supabase.from("creator_requests").update({ status: "rejected" }).eq("id", id);
    fetchRequests();
  };

  return (
    <div className="admin-container">
      <AdminHeader title="Creator Requests" />
      <table className="creator-requests-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Email</th>
            <th>Creator Username</th>
            <th>Platform Title</th>
            <th>Platform Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.users.username}</td>
              <td>{r.users.email}</td>
              <td>{r.creator_username}</td>
              <td>{r.platform_title}</td>
              <td>{r.platform_description}</td>
              <td>
                <button onClick={() => approveRequest(r.id, r.user_id)}>Approve</button>
                <button onClick={() => rejectRequest(r.id)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CreatorRequestsAdmin;

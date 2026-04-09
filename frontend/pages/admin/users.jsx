import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import AdminHeader from "../../components/AdminHeader";

const UsersAdmin = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data, error } = await supabase
      .from("users")
      .select("*");

    if (error) {
      console.log("Error fetching users:", error);
      return;
    }

    console.log("All users from DB:", data);

    const recentUsers = [];
    const admins = [];
    const creators = [];
    const others = [];

    data.forEach((u) => {
      const createdAt = new Date(u.created_at);

      if (createdAt >= threeDaysAgo) {
        recentUsers.push(u);
      } else if (u.is_admin) {
        admins.push(u);
      } else if (u.is_creator) {
        creators.push(u);
      } else {
        others.push(u);
      }
    });

    recentUsers.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    admins.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    creators.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    others.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    console.log("Recent users (last 3 days):", recentUsers);
    console.log("Admins:", admins);
    console.log("Creators:", creators);
    console.log("Other users:", others);

    const finalOrderedUsers = [
      ...recentUsers,
      ...admins,
      ...creators,
      ...others,
    ];

    console.log("Final ordered users list:", finalOrderedUsers);

    setUsers(finalOrderedUsers);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleAdmin = async (userId, isAdmin) => {
    await supabase.from("users").update({ is_admin: !isAdmin }).eq("id", userId);
    fetchUsers();
  };

  const toggleCreator = async (userId, isCreator) => {
    await supabase.from("users").update({ is_creator: !isCreator }).eq("id", userId);
    fetchUsers();
  };

  const deleteUser = async (user) => {
    if (user.is_admin) {
      alert("Cannot delete an admin!");
      return;
    }
    if (!confirm(`Are you sure you want to delete user "${user.username}"?`)) return;

    const { error } = await supabase.from("users").delete().eq("id", user.id);

    if (error) {
      alert("Error deleting user: " + error.message);
    } else {
      fetchUsers();
    }
  };

  const resetPassword = async (userEmail) => {
    alert("Reset password feature not implemented yet.");
  };

  const blockUser = async (userId) => {
    alert("Block user feature not implemented yet.");
  };

  return (
    <div className="admin-container">
      <AdminHeader title="Manage Users" />
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Admin</th>
            <th>Creator</th>
            <th>Block</th>
            <th>Reset Password</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>
                {u.username} {u.is_admin && "⭐"} {u.is_creator && "🎨"}
              </td>
              <td>{u.full_name || "-"}</td>
              <td>{u.email}</td>
              <td>
                <button onClick={() => toggleAdmin(u.id, u.is_admin)}>
                  {u.is_admin ? "Yes" : "No"}
                </button>
              </td>
              <td>
                <button onClick={() => toggleCreator(u.id, u.is_creator)}>
                  {u.is_creator ? "Yes" : "No"}
                </button>
              </td>
              <td>
                <button onClick={() => blockUser(u.id)}>Block</button>
              </td>
              <td>
                <button onClick={() => resetPassword(u.email)}>Reset Password</button>
              </td>
              <td>
                <button onClick={() => deleteUser(u)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersAdmin;
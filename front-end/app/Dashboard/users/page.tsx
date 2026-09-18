"use client";
import { Card } from "@/components/ui/card";
// pages/admin.tsx

import React, { useEffect, useState } from "react";

interface User {
  user_id: number;
  email: string;
  status: string;
  user_role: string;
  created_at: string;
  username: string;
}

const AdminPage: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchPendingUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_backend_url}/auth/getpendingUsers`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setPendingUsers(data.users);
    } catch (err) {
      console.log(err);
      setError("Failed to fetch pending users");
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (
    email: string,
    status: "approved" | "rejected",
  ) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_backend_url}/auth/updateAccount`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ email, account_status: status }),
        },
      );
      const data = await response.json();
      if (data.status === "success") {
        fetchPendingUsers();
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.log(err);
      setError("Failed to update user status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="page-heading mb-4">Pending approvals</h1>
      <p className="muted text-sm mb-8">Review new account requests.</p>
      <button
        onClick={fetchPendingUsers}
        disabled={loading}
        className="rounded-lg border px-4 py-2 mb-5 text-sm"
      >
        Refresh requests
      </button>
      {loading && <p role="status">Loading…</p>}
      {error && (
        <p role="alert" className="notice text-red-600 dark:text-red-400 mb-4">
          {error}
        </p>
      )}
      {pendingUsers.length > 0 ? (
        <ul>
          {pendingUsers.map((user) => (
            <li
              key={user.user_id}
              className="surface mb-4 p-6 rounded-xl space-y-2 break-words"
            >
              <p>Email: {user.email}</p>
              <p>Name: {user.username}</p>
              <p>
                Registration Time: {new Date(user.created_at).toLocaleString()}
              </p>
              <div className="mt-2">
                <button
                  className="mr-2 px-4 py-2 bg-emerald-700 text-white rounded"
                  disabled={loading}
                  onClick={() => updateUserStatus(user.email, "approved")}
                >
                  Approve
                </button>
                <button
                  className="px-4 py-2 bg-red-700 text-white rounded"
                  disabled={loading}
                  onClick={() => updateUserStatus(user.email, "rejected")}
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        !loading &&
        !error && (
          <Card className="py-8 px-4 text-center text-gray-500">
            <p className="text-xs sm:text-sm mt-2 text-gray-400">
              No pending users found.
            </p>
          </Card>
        )
      )}
    </div>
  );
};

export default AdminPage;

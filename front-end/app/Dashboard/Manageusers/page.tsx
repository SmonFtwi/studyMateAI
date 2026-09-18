/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useCallback, useEffect, useState } from "react";

import { FiSearch, FiUser, FiRefreshCw, FiMoreVertical } from "react-icons/fi";
import UpdateRoleDialog from "@/components/dashboardComponent/manageUser/updateUserrole";
import DeleteUserDialog from "@/components/dashboardComponent/manageUser/deleteuser";
import { Edit2, Trash } from "lucide-react";

interface User {
  user_id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

const AdminPage: React.FC = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showUpdateRoleDialog, setShowUpdateRoleDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");
  const [dropdownStates, setDropdownStates] = useState<{
    [key: number]: boolean;
  }>({});

  const setErrorWithTimeout = (message: string) => {
    setError(message);
  };

  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_backend_url}/auth/fetchAllUsers`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setAllUsers(data.users);
      setFilteredUsers(data.users);
    } catch (err) {
      setErrorWithTimeout("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserRole = async (userId: number, newRole: string) => {
    console.log("cheking");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_backend_url}/auth/updateUserRole`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ user_id: userId, user_role: newRole }),
        },
      );
      if (!response.ok) {
        console.log("error", response);
      }
      const data = await response.json();
      if (data.status === "success") {
        fetchAllUsers();
      } else {
        setErrorWithTimeout("Failed to update user role");
      }
    } catch (err) {
      setErrorWithTimeout("Error updating role");
    }
  };

  const handleDeleteUser = async () => {
    setError(
      "Deleting accounts is not available with the current account service.",
    );
  };

  const toggleDropdown = (userId: number) => {
    setDropdownStates((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const closeDropdown = () => {
    setDropdownStates({});
  };

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  useEffect(() => {
    setFilteredUsers(
      allUsers.filter((user) =>
        `${user.username} ${user.email}`.toLowerCase().includes(searchTerm),
      ),
    );
  }, [allUsers, searchTerm]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <FiUser className="w-8 h-8" />
            <h1 className="page-heading">Manage users</h1>
          </div>
          <button
            onClick={fetchAllUsers}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
          >
            <FiRefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>

        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            aria-label="Search users by name or email"
            placeholder="Search by name or email…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            className="bg-transparent w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="notice mb-6 text-red-600 dark:text-red-400"
        >
          {error}
        </div>
      )}

      <div className="surface overflow-x-auto rounded-xl">
        <table className="w-full text-left table-auto border-collapse">
          <thead className="text-sm muted">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.user_id}
                className="border-t dark:border-zinc-700 border-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all"
              >
                <td className="px-6 py-4">{user.username}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.role}</td>
                <td className="relative px-6 py-4">
                  <button
                    aria-label={`Actions for ${user.username}`}
                    aria-expanded={!!dropdownStates[user.user_id]}
                    onClick={() => toggleDropdown(user.user_id)}
                    className="flex items-center justify-center w-8 h-8 rounded-full  transition-all"
                  >
                    <FiMoreVertical />
                  </button>

                  {dropdownStates[user.user_id] && (
                    <div
                      className=" top-full mt-2 w-40 bg-zinc-100 dark:bg-zinc-950 shadow-lg rounded-lg border-t dark:border-zinc-700 border-zinc-400  z-10"
                      onMouseLeave={closeDropdown}
                    >
                      <button
                        onClick={() => {
                          setCurrentUserId(user.user_id);
                          setShowUpdateRoleDialog(true);
                          closeDropdown();
                        }}
                        className=" w-full flex items-center justify-between space-x-2  text-left px-4 py-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm"
                      >
                        Update Role
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentUserId(user.user_id);
                          setCurrentUsername(user.username);
                          setShowDeleteDialog(true);
                          closeDropdown();
                        }}
                        className=" text-red-500 w-full flex items-center justify-between space-x-2  text-left px-4 py-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm"
                        disabled
                        title="Account deletion is unavailable with the current service"
                      >
                        Delete user
                        <Trash className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && !error && filteredUsers.length === 0 && (
        <p className="notice mt-4 muted">No users found.</p>
      )}
      {loading && (
        <p role="status" className="muted py-4">
          Loading users…
        </p>
      )}
      <UpdateRoleDialog
        open={showUpdateRoleDialog}
        onClose={() => setShowUpdateRoleDialog(false)}
        currentRole={
          filteredUsers.find((user) => user.user_id === currentUserId)?.role ||
          ""
        }
        onUpdate={(newRole) => {
          if (currentUserId) updateUserRole(currentUserId, newRole);
          setShowUpdateRoleDialog(false);
        }}
      />
      <DeleteUserDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onDelete={handleDeleteUser}
        username={currentUsername}
      />
    </div>
  );
};

export default AdminPage;

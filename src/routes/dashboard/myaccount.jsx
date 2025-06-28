import React, { useEffect, useState } from "react";
import axios from "axios";

const MyAccount = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiBase = import.meta.env.VITE_API;
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!storedUser || !token) {
          console.error("User not logged in or token missing");
          setLoading(false);
          return;
        }
        // Remove trailing /api if present
        const baseUrl = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
        const res = await axios.get(`${baseUrl}/users/${storedUser.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setLoading(false);
      }
    };

    fetchUser();
  }, [apiBase, storedUser, token]);

  if (loading) return <div className="p-4 text-lg">Loading user details...</div>;

  if (!user) return <div className="p-4 text-lg text-red-600">User not found!</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
        My Account
      </h1>

      <div className="max-w-xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 space-y-4">
        <div>
          <label className="block text-slate-600 dark:text-slate-300 font-semibold">User ID</label>
          <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md text-slate-800 dark:text-white">
            {user.id}
          </div>
        </div>

        <div>
          <label className="block text-slate-600 dark:text-slate-300 font-semibold">Name</label>
          <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md text-slate-800 dark:text-white">
            {user.name}
          </div>
        </div>

        <div>
          <label className="block text-slate-600 dark:text-slate-300 font-semibold">Email</label>
          <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md text-slate-800 dark:text-white">
            {user.email}
          </div>
        </div>

        <div>
          <label className="block text-slate-600 dark:text-slate-300 font-semibold">Role</label>
          <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md text-slate-800 dark:text-white">
            {user.role}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;

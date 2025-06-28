import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');

  const usersPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(`http://localhost:3001/users/all-users`);
        setUsers(res.data);
      } catch (error) {
        console.error("❌ Error fetching users:", error);
      }
    }
    fetchData();
  }, []);

  // Filtered and sorted users
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleShowDashboard = (userId) => {
    navigate(`/dashboard/user/${userId}`);
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900"> {/* Main background: Light gray / Dark dark gray */}
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white"> {/* Heading text: Dark gray / White */}
        Registered Users
      </h2>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="w-full md:w-1/3 p-2 border rounded-md dark:bg-gray-800 dark:text-white" // Input: default bg-white / dark dark gray bg, default text-gray / white text
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to page 1 on search
          }}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg">
          {/* Table container: default bg-white / dark dark gray bg, default border-gray-300 / dark-gray-700 border */}
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white">
              {/* Table header row: Light gray bg / Dark gray bg, Dark gray text / White text */}
              <th onClick={() => toggleSort('id')} className="cursor-pointer px-4 py-2">ID {sortField === 'id' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => toggleSort('name')} className="cursor-pointer px-4 py-2">Name {sortField === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => toggleSort('email')} className="cursor-pointer px-4 py-2">Email {sortField === 'email' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user.id} className="border-t dark:border-gray-700"> {/* Table row border: default border-t-gray-300 / dark-gray-700 border */}
                <td className="px-4 py-2 text-gray-800 dark:text-white">{user.id}</td>
                <td className="px-4 py-2 text-gray-800 dark:text-white">{user.name}</td>
                <td className="px-4 py-2 text-gray-800 dark:text-white">{user.email}</td>
                <td className="px-4 py-2 text-green-600 dark:text-green-300"> {/* Role text: Green / Lighter Green for visibility */}
                  {user.role}
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleShowDashboard(user.id)}
                    className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-xs" // Button: White text / Blue background, slightly darker blue on hover
                  >
                    Show Dashboard
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {[...Array(totalPages).keys()].map((n) => (
          <button
            key={n + 1}
            onClick={() => setCurrentPage(n + 1)}
            className={`px-3 py-1 rounded-md border ${
              currentPage === n + 1
                ? 'bg-blue-600 text-white' // Active page: Blue background, White text
                : 'bg-white text-gray-700 dark:bg-gray-700 dark:text-white' // Inactive page: White bg/Dark gray bg, Gray text/White text
            } hover:bg-blue-500 hover:text-white transition`} // Hover: slightly lighter blue bg, White text
          >
            {n + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
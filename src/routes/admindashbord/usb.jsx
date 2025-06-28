import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { AlertTriangle, Usb } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const USBLog = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const apiBase = import.meta.env.VITE_API;

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        const response = await axios.get(`${apiBase}/USBLog`, config);
        setLogs(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch USB log data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiBase]);

  const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE);
  const paginatedLogs = logs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const renderPagination = () => (
    <div className="flex justify-center mt-4 gap-2">
      <button
        onClick={() => setPage(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-3 py-1 rounded border bg-white dark:bg-slate-700 dark:text-white"
      >
        Prev
      </button>
      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i}
          onClick={() => setPage(i + 1)}
          className={`px-3 py-1 rounded border ${
            i + 1 === page
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-slate-700 dark:text-white'
          }`}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={() => setPage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-3 py-1 rounded border bg-white dark:bg-slate-700 dark:text-white"
      >
        Next
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col justify-center items-center text-red-500">
        <AlertTriangle className="w-10 h-10 mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200">
      <div className="mb-6 flex items-center gap-3">
        <Usb className="text-blue-600 dark:text-blue-400" />
        <h2 className="text-2xl font-bold">USB Scan Logs</h2>
        <span className="text-sm text-slate-500 dark:text-slate-400">({logs.length} total logs)</span>
      </div>

      {/* Chart */}
      <div className="mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-2">Scan Summary</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={logs.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="macAddress" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Total_FileScanned" fill="#3b82f6" name="Files Scanned" />
            <Bar dataKey="Total_Virus_Found" fill="#ef4444" name="Virus Found" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow bg-white dark:bg-slate-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">MAC Address</th>
              <th className="p-3">Product Key</th>
              <th className="p-3">User</th>
              <th className="p-3">Files Scanned</th>
              <th className="p-3">Virus Found</th>
              <th className="p-3">Detected</th>
              <th className="p-3">Removed</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.map((log, index) => (
              <tr
                key={log.id}
                className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <td className="p-3">{(page - 1) * ITEMS_PER_PAGE + index + 1}</td>
                <td className="p-3 font-mono">{log.macAddress}</td>
                <td className="p-3">{log.product_key}</td>
                <td className="p-3">{log.UserName}</td>
                <td className="p-3">{log.Total_FileScanned}</td>
                <td className="p-3 text-red-500 font-bold">{log.Total_Virus_Found}</td>
                <td className="p-3">{new Date(log.Detection_Time).toLocaleString()}</td>
                <td className="p-3">{new Date(log.Removal_Time).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

export default USBLog;

import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  Cell
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#FBBF24', '#EF4444', '#8B5CF6', '#F472B6'];

const PcPerformance = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('CPU');
  const apiBase = import.meta.env.VITE_API;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`${apiBase}/ProcessLog1`, config);
        setLogs(
          response.data.map((log) => ({
            ...log,
            CPU: Number(log.CPU.toFixed(2)),
            Memory: Number(log.Memory.toFixed(2)),
            DateTimeP: new Date(log.DateTimeP)
          }))
        );
      } catch {
        setError('Failed to load logs.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiBase]);

  const filtered = useMemo(
    () =>
      logs
        .filter((l) => l.ProcessName.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => b[sortKey] - a[sortKey]),
    [logs, search, sortKey]
  );

  const totalCPU = useMemo(() => logs.reduce((sum, l) => sum + l.CPU, 0).toFixed(2), [logs]);
  const totalMemory = useMemo(() => logs.reduce((sum, l) => sum + l.Memory, 0).toFixed(2), [logs]);
  const infectedCount = useMemo(() => logs.filter((l) => l.MalwareFamily).length, [logs]);
  const trendData = useMemo(
    () =>
      logs.map((l) => ({ time: l.DateTimeP.toLocaleTimeString(), CPU: l.CPU, Memory: l.Memory })),
    [logs]
  );

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900 transition-all">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Total Processes</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{logs.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Total CPU (%)</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{totalCPU}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Total Memory (MB)</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{totalMemory}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Infected Processes</h3>
          <p className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-400">{infectedCount}</p>
        </div>
      </div>
      {/* Trend Chart */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow mb-10">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-3">Real-time Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="4 4" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Legend iconType="circle" />
            <Line type="monotone" dataKey="CPU" stroke={COLORS[0]} dot={false} />
            <Line type="monotone" dataKey="Memory" stroke={COLORS[1]} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-3">Top CPU Consumers</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={filtered.slice(0, 5)} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="4 4" />
              <XAxis dataKey="ProcessName" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="CPU" fill={COLORS[2]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-3">Top Memory Consumers</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={filtered.slice(0, 5)} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="4 4" />
              <XAxis dataKey="ProcessName" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Memory" fill={COLORS[3]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-3">CPU Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={filtered.slice(0, 5)}
                dataKey="CPU"
                nameKey="ProcessName"
                outerRadius={80}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {filtered.slice(0, 5).map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" iconType="square" />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">Process Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-800 dark:text-gray-200">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-2">PID</th>
                <th className="px-3 py-2">Process</th>
                <th className="px-3 py-2">CPU</th>
                <th className="px-3 py-2">Memory</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">MAC</th>
                <th className="px-3 py-2">Signed</th>
                <th className="px-3 py-2">Virus Type</th>
                <th className="px-3 py-2">Malware Family</th>
                <th className="px-3 py-2">Size (MB)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-3 py-2">{log.processID}</td>
                  <td className="px-3 py-2">{log.ProcessName}</td>
                  <td className="px-3 py-2">{log.CPU.toFixed(2)}%</td>
                  <td className="px-3 py-2">{log.Memory.toFixed(2)} MB</td>
                  <td className="px-3 py-2">{log.UserName}</td>
                  <td className="px-3 py-2">{log.macAdress}</td>
                  <td className="px-3 py-2">{log.isSigned ? '✔️' : '❌'}</td>
                  <td className="px-3 py-2">
                    {log.VirusType || 'None'}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        log.MalwareFamily ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {log.MalwareFamily || 'Safe'}
                    </span>
                  </td>
                  <td className="px-3 py-2">{(log.fileSize / 1024 / 1024).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PcPerformance;

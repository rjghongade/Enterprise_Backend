import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
} from "chart.js";
import { Doughnut, Line, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
);

export default function ADMINEDR() {
  const [alerts, setAlerts] = useState([]);
  const [endpoints, setEndpoints] = useState([]);
  const [analystLogs, setAnalystLogs] = useState([]);
  const apiBase = import.meta.env.VITE_API;

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const [alertsRes, endpointsRes, analystLogsRes] = await Promise.all([
          axios.get(`${apiBase}/edr_alerts`, config),
          axios.get(`${apiBase}/edr_endpoints`, config),
          axios.get(`${apiBase}/edr_analyst_logs`, config),
        ]);

        setAlerts(alertsRes.data || []);
        setEndpoints(endpointsRes.data || []);
        setAnalystLogs(analystLogsRes.data || []);
      } catch (error) {
        console.error("Error fetching EDR data", error);
      }
    }
    fetchData();
  }, []);

  // Summary Counts
  const alertCount = alerts.length;
  const endpointCount = endpoints.length;
  const analystCount = new Set(analystLogs.map((log) => log.analyst_name)).size;

  // Alert Severity Distribution
  const severityCounts = alerts.reduce((acc, alert) => {
    acc[alert.severity] = (acc[alert.severity] || 0) + 1;
    return acc;
  }, {});
  const severityData = {
    labels: Object.keys(severityCounts),
    datasets: [
      {
        data: Object.values(severityCounts),
        backgroundColor: ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#6366f1"],
        borderColor: "#1f2937",
        borderWidth: 1,
      },
    ],
  };

  // Alerts Over Time
  const alertsByDate = alerts.reduce((acc, alert) => {
    const date = new Date(alert.detected_at).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  const sortedDates = Object.keys(alertsByDate).sort(
    (a, b) => new Date(a) - new Date(b)
  );
  const trendData = {
    labels: sortedDates,
    datasets: [
      {
        label: "Alerts",
        data: sortedDates.map((d) => alertsByDate[d]),
        fill: false,
        borderColor: "#3b82f6",
        backgroundColor: "#60a5fa",
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#2563eb",
        borderWidth: 2,
      },
    ],
  };

  // Endpoint OS Distribution
  const osCounts = endpoints.reduce((acc, ep) => {
    acc[ep.os_type] = (acc[ep.os_type] || 0) + 1;
    return acc;
  }, {});
  const endpointsOSData = {
    labels: Object.keys(osCounts),
    datasets: [
      {
        label: "OS Distribution",
        data: Object.values(osCounts),
        backgroundColor: [
          "#10b981",
          "#3b82f6",
          "#f97316",
          "#8b5cf6",
          "#ef4444",
        ],
        borderColor: "#1e3a8a",
        borderWidth: 1,
      },
    ],
  };

  // Analyst Actions
  const actionCounts = analystLogs.reduce((acc, log) => {
    const type = log.action_type || "Reviewed"; // fallback
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const analystActionsData = {
    labels: Object.keys(actionCounts),
    datasets: [
      {
        data: Object.values(actionCounts),
        backgroundColor: [
          "#6366f1",
          "#22c55e",
          "#facc15",
          "#f43f5e",
          "#0ea5e9",
        ],
        borderColor: "#1f2937",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-12 text-gray-900 dark:text-gray-100">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Total Alerts</h2>
          <p className="text-3xl font-bold text-red-500">{alertCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Endpoints</h2>
          <p className="text-3xl font-bold text-blue-500">{endpointCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Analysts</h2>
          <p className="text-3xl font-bold text-green-500">{analystCount}</p>
        </div>
      </div>

      {/* Charts Section 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">
            📊 Alert Severity Distribution
          </h2>
          <div className="w-full h-64">
            <Doughnut
              data={severityData}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">📈 Alerts Over Time</h2>
          <div className="w-full h-64">
            <Line
              data={trendData}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </section>
      </div>

      {/* Charts Section 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">🖥️ Endpoints by OS Type</h2>
          <div className="w-full h-64">
            <Bar
              data={endpointsOSData}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">🧑‍💻 Analyst Actions</h2>
          <div className="w-full h-64">
            <Bar
              data={analystActionsData}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

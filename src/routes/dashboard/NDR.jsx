import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadarController,
  RadialLinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut, Radar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadarController,
  RadialLinearScale,
  Tooltip,
  Legend
);

export default function ADMINNDR() {
  const [networkLogs, setNetworkLogs] = useState([]);
  const [networkAlerts, setNetworkAlerts] = useState([]);
  const [ipAnalysis, setIpAnalysis] = useState([]);
  const apiBase = import.meta.env.VITE_API;

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const [logsRes, alertsRes, ipRes] = await Promise.all([
          axios.get(`${apiBase}/network_logs`, config),
          axios.get(`${apiBase}/network_alerts_xdr`, config),
          axios.get(`${apiBase}/ip_analysis`, config),
        ]);
        setNetworkLogs(logsRes.data);
        setNetworkAlerts(alertsRes.data);
        setIpAnalysis(ipRes.data);
      } catch (error) {
        console.error("Error fetching NDR data", error);
      }
    }
    fetchData();
  }, []);

  const trafficCounts = networkLogs.reduce((acc, log) => {
    const date = new Date(log.datetime).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  const sortedDates = Object.keys(trafficCounts).sort(
    (a, b) => new Date(a) - new Date(b)
  );
  const trafficData = {
    labels: sortedDates,
    datasets: [
      {
        label: "Traffic Volume",
        data: sortedDates.map((d) => trafficCounts[d]),
        borderColor: "#3b82f6",
        backgroundColor: "#60a5fa",
        tension: 0.4,
        pointRadius: 3,
        borderWidth: 2,
      },
    ],
  };

  const severityCounts = networkAlerts.reduce((acc, alert) => {
    acc[alert.severity] = (acc[alert.severity] || 0) + 1;
    return acc;
  }, {});
  const severityData = {
    labels: Object.keys(severityCounts),
    datasets: [
      {
        data: Object.values(severityCounts),
        backgroundColor: ["#ef4444", "#f97316", "#facc15", "#10b981", "#3b82f6"],
        borderColor: "#1f2937",
        borderWidth: 1,
      },
    ],
  };

  const ipCounts = networkLogs.reduce((acc, log) => {
    acc[log.source_ip] = (acc[log.source_ip] || 0) + 1;
    return acc;
  }, {});
  const topIps = Object.entries(ipCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const ipData = {
    labels: topIps.map(([ip]) => ip),
    datasets: [
      {
        label: "Connection Count",
        data: topIps.map(([, count]) => count),
        backgroundColor: [
          "#6366f1",
          "#8b5cf6",
          "#ec4899",
          "#10b981",
          "#3b82f6",
          "#f59e0b",
          "#ef4444",
          "#14b8a6",
          "#e11d48",
          "#0ea5e9",
        ],
        borderColor: "#1f2937",
        borderWidth: 1,
      },
    ],
  };

  const anomalyCounts = networkLogs.reduce((acc, log) => {
    if (log.anomaly_type && log.anomaly_type !== "NA")
      acc[log.anomaly_type] = (acc[log.anomaly_type] || 0) + 1;
    return acc;
  }, {});
  const anomalyLabels = Object.keys(anomalyCounts);
  const anomalyData = {
    labels: anomalyLabels,
    datasets: [
      {
        label: "Anomaly Types",
        data: anomalyLabels.map((label) => anomalyCounts[label]),
        backgroundColor: "rgba(139, 92, 246, 0.4)",
        borderColor: "#8b5cf6",
        pointBackgroundColor: "#a78bfa",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto text-gray-900 dark:text-gray-100 overflow-hidden">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 mb-6">
        {[
          { label: "Total Logs", value: networkLogs.length },
          { label: "Threat Alerts", value: networkAlerts.length },
          { label: "Unique IPs", value: Object.keys(ipCounts).length },
          {
            label: "Anomalies",
            value: Object.values(anomalyCounts).reduce((a, b) => a + b, 0),
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-xl shadow-sm min-h-[100px] flex flex-col justify-center"
          >
            <h3 className="text-sm text-gray-500">{card.label}</h3>
            <p className="text-xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-3">📈 Traffic Volume</h2>
          <div className="h-[250px] md:h-[300px]">
            <Line data={trafficData} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-3">⚠️ Threat Severity</h2>
          <div className="h-[250px] md:h-[300px]">
            <Doughnut data={severityData} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-3">🌐 Top Source IPs</h2>
          <div className="h-[250px] md:h-[300px]">
            <Bar data={ipData} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-3">🧬 Anomalies by Type</h2>
          <div className="h-[250px] md:h-[300px]">
            <Radar data={anomalyData} />
          </div>
        </div>
      </div>
    </div>
  );
}

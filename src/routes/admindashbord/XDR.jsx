import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
} from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';

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

export default function ADMINXDR() {
  const [cloudAlerts, setCloudAlerts] = useState([]);
  const [networkAlerts, setNetworkAlerts] = useState([]);
  const [threats, setThreats] = useState([]);
  const [endpoints, setEndpoints] = useState([]);
  const [mitreMappings, setMitreMappings] = useState([]);

  const apiBase = import.meta.env.VITE_API;

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      try {
        const [cloudRes, networkRes, threatsRes, endpointsRes, mitreRes] =
          await Promise.all([
            axios.get(`${apiBase}/cloud_alerts_xdr`, config),
            axios.get(`${apiBase}/network_alerts_xdr`, config),
            axios.get(`${apiBase}/threats_xdr`, config),
            axios.get(`${apiBase}/endpoints_xdr`, config),
            axios.get(`${apiBase}/ti_feed_soar`, config), // MITRE techniques
          ]);

        setCloudAlerts(cloudRes.data);
        setNetworkAlerts(networkRes.data);
        setThreats(threatsRes.data);
        setEndpoints(endpointsRes.data);
        setMitreMappings(mitreRes.data);
      } catch (err) {
        console.error("Error fetching XDR data", err);
      }
    }

    fetchData();
  }, []);

  // Cloud Alert Severity
  const cloudSeverityCounts = cloudAlerts.reduce((acc, a) => {
    acc[a.severity] = (acc[a.severity] || 0) + 1;
    return acc;
  }, {});

  const cloudSeverityData = {
    labels: Object.keys(cloudSeverityCounts),
    datasets: [{
      data: Object.values(cloudSeverityCounts),
      backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'],
      borderColor: '#1f2937',
      borderWidth: 1
    }],
  };

  // Cloud Alert Types
  const cloudTypeCounts = cloudAlerts.reduce((acc, a) => {
    acc[a.alert_type] = (acc[a.alert_type] || 0) + 1;
    return acc;
  }, {});

  const cloudTypeData = {
    labels: Object.keys(cloudTypeCounts),
    datasets: [{
      label: 'Cloud Alert Types',
      data: Object.values(cloudTypeCounts),
      backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'],
      borderColor: '#1f2937',
      borderWidth: 1,
    }]
  };

  // Network Alerts Over Time
  const networkAlertsByDate = networkAlerts.reduce((acc, a) => {
    const date = new Date(a.detected_at).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const sortedDates = Object.keys(networkAlertsByDate).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  const networkLineData = {
    labels: sortedDates,
    datasets: [{
      label: 'Alerts',
      data: sortedDates.map(d => networkAlertsByDate[d]),
      fill: false,
      borderColor: '#3b82f6',
      backgroundColor: '#3b82f6',
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#3b82f6'
    }],
  };

  // Threat Types
  const threatTypeCounts = threats.reduce((acc, t) => {
    acc[t.threat_type] = (acc[t.threat_type] || 0) + 1;
    return acc;
  }, {});

  const threatTypeData = {
    labels: Object.keys(threatTypeCounts),
    datasets: [{
      label: 'Threat Count',
      data: Object.values(threatTypeCounts),
      backgroundColor: '#f97316',
      borderColor: '#ea580c',
      borderWidth: 1
    }],
  };

  // Threat Status
  const threatStatusCounts = threats.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  const threatStatusData = {
    labels: Object.keys(threatStatusCounts),
    datasets: [{
      data: Object.values(threatStatusCounts),
      backgroundColor: ['#22c55e', '#facc15', '#ef4444', '#6366f1'],
      borderColor: '#1f2937',
      borderWidth: 1
    }],
  };

  // Endpoints OS
  const osCounts = endpoints.reduce((acc, e) => {
    acc[e.os_type] = (acc[e.os_type] || 0) + 1;
    return acc;
  }, {});

  const osData = {
    labels: Object.keys(osCounts),
    datasets: [{
      label: 'Endpoint Count',
      data: Object.values(osCounts),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'],
      borderColor: '#1e3a8a',
      borderWidth: 1
    }],
  };

  // MITRE Techniques
  const mitreFreq = mitreMappings.reduce((acc, m) => {
    acc[m.technique_name] = (acc[m.technique_name] || 0) + 1;
    return acc;
  }, {});

  const topMitre = Object.entries(mitreFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const mitreData = {
    labels: topMitre.map(([name]) => name),
    datasets: [{
      label: 'Technique Usage',
      data: topMitre.map(([, count]) => count),
      backgroundColor: '#0ea5e9',
      borderColor: '#0284c7',
      borderWidth: 1
    }],
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-12 text-gray-800 dark:text-gray-100">

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow text-center">
          <h3 className="text-lg font-semibold">Total Alerts</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{cloudAlerts.length}</p>
        </div>
        {Object.entries(cloudSeverityCounts).map(([severity, count]) => (
          <div key={severity} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow text-center">
            <h3 className="text-lg font-semibold capitalize">{severity}</h3>
            <p className="text-2xl font-bold text-rose-500 dark:text-rose-400">{count}</p>
          </div>
        ))}
      </div>

      {/* First Grid: Two Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">☁️ Cloud Alert Severity</h2>
          <div className="w-full h-64">
            <Doughnut data={cloudSeverityData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">🌐 Network Alerts Over Time</h2>
          <div className="w-full h-64">
            <Line data={networkLineData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </section>
      </div>

      {/* Second Grid: Three Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">⚠️ Threat Types</h2>
          <div className="w-full h-64">
            <Bar data={threatTypeData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">🔐 Threat Status</h2>
          <div className="w-full h-64">
            <Doughnut data={threatStatusData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">💻 Endpoints by OS</h2>
          <div className="w-full h-64">
            <Bar data={osData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </section>
      </div>

      {/* Cloud Alert Type Chart */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">📊 Cloud Alert Types</h2>
        <div className="w-full h-64">
          <Bar data={cloudTypeData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </section>

      {/* MITRE ATT&CK Techniques */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">🧠 Top MITRE ATT&CK Techniques</h2>
        <div className="w-full h-72">
          <Bar data={mitreData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </section>

      {/* Cloud Alert Table */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 overflow-auto">
        <h2 className="text-2xl font-semibold mb-4">📋 All Cloud Alerts</h2>
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              <th className="p-2">ID</th>
              <th className="p-2">Email</th>
              <th className="p-2">Type</th>
              <th className="p-2">Source</th>
              <th className="p-2">Severity</th>
              <th className="p-2">Detected At</th>
            </tr>
          </thead>
          <tbody>
            {cloudAlerts.map(alert => (
              <tr key={alert.cloud_alert_id} className="border-b border-gray-300 dark:border-gray-600">
                <td className="p-2">{alert.cloud_alert_id}</td>
                <td className="p-2">{alert.user_email}</td>
                <td className="p-2">{alert.alert_type}</td>
                <td className="p-2">{alert.alert_source}</td>
                <td className="p-2 text-red-500">{alert.severity}</td>
                <td className="p-2">{new Date(alert.detected_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

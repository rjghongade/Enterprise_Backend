import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie, Line, Bar, Doughnut } from 'react-chartjs-2';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
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
  Filler
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler
);

function MapBounds({ positions }) {
  const map = useMap();
  React.useEffect(() => {
    if (positions.length) {
      const bounds = positions.map(pos => [pos[0], pos[1]]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, positions]);
  return null;
}

export default function Dashboard() {
  // Detect theme (light/dark) - must be at the top!
  const [isDark, setIsDark] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  useEffect(() => {
    const listener = e => setIsDark(e.matches);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener);
    return () => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener);
  }, []);

  // Main states for all APIs
  const [alerts, setAlerts] = useState([]);
  const [ipAnalysis, setIpAnalysis] = useState([]);
  const [edrAlerts, setEdrAlerts] = useState([]);
  const [edrEndpoints, setEdrEndpoints] = useState([]);
  const [edrAnalystLogs, setEdrAnalystLogs] = useState([]);
  const [fileLogs, setFileLogs] = useState([]);
  const [networkLogs, setNetworkLogs] = useState([]);
  const [networkAlertsXdr, setNetworkAlertsXdr] = useState([]);
  const [incident, setIncident] = useState([]);
  const [analystLogs, setAnalystLogs] = useState([]);
  const [caseTimelineSoar, setCaseTimelineSoar] = useState([]);
  const [collaborationLogSoar, setCollaborationLogSoar] = useState([]);
  const [responseActionLogSoar, setResponseActionLogSoar] = useState([]);
  const [threatsXdr, setThreatsXdr] = useState([]);
  const [tiFeedSoar, setTiFeedSoar] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [cloudAlertsXdr, setCloudAlertsXdr] = useState([]);
  const [endpointsXdr, setEndpointsXdr] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiBase = import.meta.env.VITE_API;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const [
          alertsRes,
          ipRes,
          edrAlertsRes,
          edrEndpointsRes,
          edrAnalystLogsRes,
          fileLogsRes,
          networkLogsRes,
          networkAlertsXdrRes,
          incidentRes,
          analystLogsRes,
          caseTimelineSoarRes,
          collaborationLogSoarRes,
          responseActionLogSoarRes,
          threatsXdrRes,
          tiFeedSoarRes,
          userActivityRes,
          cloudAlertsXdrRes,
          endpointsXdrRes
        ] = await Promise.all([
          axios.get(`${apiBase}/alerts`, config),
          axios.get(`${apiBase}/ip_analysis`, config),
          axios.get(`${apiBase}/edr_alerts`, config),
          axios.get(`${apiBase}/edr_endpoints`, config),
          axios.get(`${apiBase}/edr_analyst_logs`, config),
          axios.get(`${apiBase}/filelog`, config),
          axios.get(`${apiBase}/network_logs`, config),
          axios.get(`${apiBase}/network_alerts_xdr`, config),
          axios.get(`${apiBase}/incident`, config),
          axios.get(`${apiBase}/analyst_logs`, config),
          axios.get(`${apiBase}/case_timeline_soar`, config),
          axios.get(`${apiBase}/collaboration_log_soar`, config),
          axios.get(`${apiBase}/response_action_log_soar`, config),
          axios.get(`${apiBase}/threats_xdr`, config),
          axios.get(`${apiBase}/ti_feed_soar`, config),
          axios.get(`${apiBase}/user_activity`, config),
          axios.get(`${apiBase}/cloud_alerts_xdr`, config),
          axios.get(`${apiBase}/endpoints_xdr`, config)
        ]);
        setAlerts(alertsRes.data);
        setIpAnalysis(ipRes.data);
        setEdrAlerts(edrAlertsRes.data);
        setEdrEndpoints(edrEndpointsRes.data);
        setEdrAnalystLogs(edrAnalystLogsRes.data);
        setFileLogs(fileLogsRes.data);
        setNetworkLogs(networkLogsRes.data);
        setNetworkAlertsXdr(networkAlertsXdrRes.data);
        setIncident(incidentRes.data);
        setAnalystLogs(analystLogsRes.data);
        setCaseTimelineSoar(caseTimelineSoarRes.data);
        setCollaborationLogSoar(collaborationLogSoarRes.data);
        setResponseActionLogSoar(responseActionLogSoarRes.data);
        setThreatsXdr(threatsXdrRes.data);
        setTiFeedSoar(tiFeedSoarRes.data);
        setUserActivity(userActivityRes.data);
        setCloudAlertsXdr(cloudAlertsXdrRes.data);
        setEndpointsXdr(endpointsXdrRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="loader"></div>
    </div>
  );

  if (error) return (
    <div className="text-center text-red-500 mt-10">{error}</div>
  );

  // Data transforms for visualization
  const alertStatus = alerts.reduce((acc, { status }) => {
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const alertsByDate = alerts.reduce((acc, { alert_datetime }) => {
    const date = new Date(alert_datetime).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  const severityCount = alerts.reduce((acc, { severity }) => {
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {});
  const edrStatus = edrEndpoints.reduce((acc, { status }) => {
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const networkAlertTypes = networkAlertsXdr.reduce((acc, { type }) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const threatTypes = threatsXdr.reduce((acc, { threat_type }) => {
    acc[threat_type] = (acc[threat_type] || 0) + 1;
    return acc;
  }, {});
  const userActivityTypes = userActivity.reduce((acc, { activity_type }) => {
    acc[activity_type] = (acc[activity_type] || 0) + 1;
    return acc;
  }, {});
  const positions = ipAnalysis
    .filter(({ latitude, longitude }) => latitude && longitude)
    .map(({ latitude, longitude }) => [latitude, longitude]);

  // --- New: Count summaries for all APIs ---
  const summaryCounts = [
    { label: 'Total Alerts', value: alerts.length, color: 'text-emerald-600 dark:text-cyan-400' },
    { label: 'Incidents', value: incident.length, color: 'text-pink-600 dark:text-pink-400' },
    { label: 'IP Analysis', value: ipAnalysis.length, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'EDR Alerts', value: edrAlerts.length, color: 'text-orange-600 dark:text-orange-400' },
    { label: 'EDR Endpoints', value: edrEndpoints.length, color: 'text-indigo-600 dark:text-indigo-400' },
    { label: 'EDR Analyst Logs', value: edrAnalystLogs.length, color: 'text-fuchsia-600 dark:text-fuchsia-400' },
    { label: 'File Logs', value: fileLogs.length, color: 'text-lime-600 dark:text-lime-400' },
    { label: 'Network Logs', value: networkLogs.length, color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Network Alerts XDR', value: networkAlertsXdr.length, color: 'text-cyan-600 dark:text-cyan-400' },
    { label: 'Analyst Logs', value: analystLogs.length, color: 'text-sky-600 dark:text-sky-400' },
    { label: 'Case Timeline SOAR', value: caseTimelineSoar.length, color: 'text-rose-600 dark:text-rose-400' },
    { label: 'Collab Log SOAR', value: collaborationLogSoar.length, color: 'text-violet-600 dark:text-violet-400' },
    { label: 'Response Action SOAR', value: responseActionLogSoar.length, color: 'text-teal-600 dark:text-teal-400' },
    { label: 'Threats XDR', value: threatsXdr.length, color: 'text-red-600 dark:text-red-400' },
    { label: 'TI Feed SOAR', value: tiFeedSoar.length, color: 'text-yellow-600 dark:text-yellow-400' },
    { label: 'User Activity', value: userActivity.length, color: 'text-blue-800 dark:text-blue-300' },
    { label: 'Cloud Alerts XDR', value: cloudAlertsXdr.length, color: 'text-purple-600 dark:text-purple-400' },
    { label: 'Endpoints XDR', value: endpointsXdr.length, color: 'text-green-600 dark:text-green-400' },
  ];

  // Chart color palettes
  const chartColors = isDark
    ? {
        green: '#22d3ee', // cyan-400
        amber: '#fbbf24', // amber-400
        red: '#f87171',   // red-400
        blue: '#60a5fa',  // blue-400
        purple: '#a78bfa',// purple-400
        bg: '#1e293b',    // slate-800
        border: '#334155' // slate-700
      }
    : {
        green: '#10b981', // emerald-500
        amber: '#f59e0b', // amber-500
        red: '#ef4444',   // red-500
        blue: '#3b82f6',  // blue-500
        purple: '#8b5cf6',// violet-500
        bg: '#fff',
        border: '#e5e7eb' // gray-200
      };

  // Chart configs (use chartColors)
  const pieData = {
    labels: Object.keys(alertStatus),
    datasets: [{
      label: 'Status Count',
      data: Object.values(alertStatus),
      backgroundColor: [chartColors.green, chartColors.amber, chartColors.red],
      borderWidth: 1,
      borderColor: chartColors.border,
    }],
  };
  const lineData = {
    labels: Object.keys(alertsByDate),
    datasets: [{
      label: 'Alerts per Day',
      data: Object.values(alertsByDate),
      borderColor: chartColors.blue,
      backgroundColor: isDark ? 'rgba(96,165,250,0.2)' : 'rgba(59,130,246,0.2)',
      tension: 0.4,
      fill: true,
    }],
  };
  const barData = {
    labels: Object.keys(severityCount),
    datasets: [{
      label: 'Alert Severity',
      data: Object.values(severityCount),
      backgroundColor: chartColors.red,
      borderColor: chartColors.border,
      borderWidth: 1,
    }],
  };
  const edrPieData = {
    labels: Object.keys(edrStatus),
    datasets: [{
      label: 'EDR Endpoint Status',
      data: Object.values(edrStatus),
      backgroundColor: [chartColors.blue, chartColors.amber, chartColors.green],
      borderWidth: 1,
      borderColor: chartColors.border,
    }],
  };
  const networkBarData = {
    labels: Object.keys(networkAlertTypes),
    datasets: [{
      label: 'Network Alert Types',
      data: Object.values(networkAlertTypes),
      backgroundColor: chartColors.amber,
      borderColor: chartColors.border,
      borderWidth: 1,
    }],
  };
  const threatPieData = {
    labels: Object.keys(threatTypes),
    datasets: [{
      label: 'Threat Types',
      data: Object.values(threatTypes),
      backgroundColor: [chartColors.red, chartColors.blue, chartColors.green, chartColors.amber],
      borderWidth: 1,
      borderColor: chartColors.border,
    }],
  };
  const userActivityBarData = {
    labels: Object.keys(userActivityTypes),
    datasets: [{
      label: 'User Activity Types',
      data: Object.values(userActivityTypes),
      backgroundColor: chartColors.purple,
      borderColor: chartColors.border,
      borderWidth: 1,
    }],
  };

  return (
    <div className="min-h-screen p-6 transition-colors bg-gray-50 dark:bg-slate-900">
      {/* --- Summary Cards for All APIs --- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        {summaryCounts.map((item, idx) => (
          <div key={idx} className="card text-center bg-white dark:bg-slate-800 shadow-md dark:shadow-slate-900 border border-gray-200 dark:border-slate-700">
            <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
            <div className="text-gray-500 dark:text-gray-300">{item.label}</div>
          </div>
        ))}
      </div>

      {/* --- Main Security Visualizations --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card bg-white dark:bg-slate-800 shadow-md dark:shadow-slate-900 border border-gray-200 dark:border-slate-700">
          <h2 className="card-title text-gray-700 dark:text-gray-200">Alert Status</h2>
          <Pie data={pieData} />
        </div>
        <div className="card bg-white dark:bg-slate-800 shadow-md dark:shadow-slate-900 border border-gray-200 dark:border-slate-700">
          <h2 className="card-title text-gray-700 dark:text-gray-200">Alerts Over Time</h2>
          <Line data={lineData} />
        </div>
        <div className="card bg-white dark:bg-slate-800 shadow-md dark:shadow-slate-900 border border-gray-200 dark:border-slate-700">
          <h2 className="card-title text-gray-700 dark:text-gray-200">Alert Severity</h2>
          <Bar data={barData} />
        </div>
      </div>

      {/* --- EDR, Network, Threats Visualizations --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div className="card bg-white dark:bg-slate-800 shadow-md dark:shadow-slate-900 border border-gray-200 dark:border-slate-700">
          <h2 className="card-title text-gray-700 dark:text-gray-200">EDR Endpoint Status</h2>
          <Doughnut data={edrPieData} />
        </div>
        <div className="card bg-white dark:bg-slate-800 shadow-md dark:shadow-slate-900 border border-gray-200 dark:border-slate-700">
          <h2 className="card-title text-gray-700 dark:text-gray-200">Network Alert Types</h2>
          <Bar data={networkBarData} />
        </div>
        <div className="card bg-white dark:bg-slate-800 shadow-md dark:shadow-slate-900 border border-gray-200 dark:border-slate-700">
          <h2 className="card-title text-gray-700 dark:text-gray-200">Threat Types</h2>
          <Pie data={threatPieData} />
        </div>
      </div>

      {/* --- User Activity, File Logs, Cloud Alerts --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div className="card bg-white dark:bg-slate-800 shadow-md dark:shadow-slate-900 border border-gray-200 dark:border-slate-700">
          <h2 className="card-title text-gray-700 dark:text-gray-200">User Activity Types</h2>
          <Bar data={userActivityBarData} />
        </div>
        <div className="card bg-white dark:bg-slate-800 shadow-md dark:shadow-slate-900 border border-gray-200 dark:border-slate-700">
          <h2 className="card-title text-gray-700 dark:text-gray-200">Recent File Logs</h2>
          <ul className="text-xs max-h-48 overflow-auto text-gray-700 dark:text-gray-200">
            {fileLogs.slice(0, 10).map((log, i) => (
              <li key={i} className="border-b border-gray-200 dark:border-slate-700 py-1">
                {log.fileName || log.filename} - {log.FileEvent || log.action}
              </li>
            ))}
          </ul>
        </div>
        <div className="card bg-white dark:bg-slate-800 shadow-md dark:shadow-slate-900 border border-gray-200 dark:border-slate-700">
          <h2 className="card-title text-gray-700 dark:text-gray-200">Recent Cloud Alerts</h2>
          <ul className="text-xs max-h-48 overflow-auto text-gray-700 dark:text-gray-200">
            {cloudAlertsXdr.slice(0, 10).map((alert, i) => (
              <li key={i} className="border-b border-gray-200 dark:border-slate-700 py-1">
                {alert.user_email} - {alert.alert_type} ({alert.severity})
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* --- Map Visualization --- */}
      <div className="mt-10 card bg-white dark:bg-slate-800 shadow-md dark:shadow-slate-900 border border-gray-200 dark:border-slate-700">
        <h2 className="card-title mb-4 text-gray-700 dark:text-gray-200">Incident IP Map</h2>
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={2}
          scrollWheelZoom={false}
          className="w-full h-96 rounded-xl"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapBounds positions={positions} />
          {ipAnalysis.map((ip, i) => (
            ip.latitude && ip.longitude && (
              <Marker key={i} position={[parseFloat(ip.latitude), parseFloat(ip.longitude)]}>
                <Popup>
                  <div className="text-sm">
                    <strong>IP:</strong> {ip.ip_address}<br />
                    <strong>Location:</strong> {ip.city}, {ip.country}
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>

      {/* --- Incidents Table --- */}
      <div className="mt-10 card bg-white dark:bg-slate-800 shadow-md dark:shadow-slate-900 border border-gray-200 dark:border-slate-700">
        <h2 className="card-title mb-4 text-gray-700 dark:text-gray-200">Recent Incidents</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr>
                <th className="px-2 py-1 text-gray-700 dark:text-gray-200">ID</th>
                <th className="px-2 py-1 text-gray-700 dark:text-gray-200">Type</th>
                <th className="px-2 py-1 text-gray-700 dark:text-gray-200">Status</th>
                <th className="px-2 py-1 text-gray-700 dark:text-gray-200">Priority</th>
                <th className="px-2 py-1 text-gray-700 dark:text-gray-200">Created</th>
                <th className="px-2 py-1 text-gray-700 dark:text-gray-200">Resolved</th>
              </tr>
            </thead>
            <tbody>
              {incident.slice(0, 10).map((inc, i) => (
                <tr key={i} className="border-b border-gray-200 dark:border-slate-700">
                  <td className="px-2 py-1 text-gray-700 dark:text-gray-200">{inc.incident_id || inc.id}</td>
                  <td className="px-2 py-1 text-gray-700 dark:text-gray-200">{inc.incident_type || inc.type}</td>
                  <td className="px-2 py-1 text-gray-700 dark:text-gray-200">{inc.status}</td>
                  <td className="px-2 py-1 text-gray-700 dark:text-gray-200">{inc.priority || '-'}</td>
                  <td className="px-2 py-1 text-gray-700 dark:text-gray-200">{inc.created_at ? new Date(inc.created_at).toLocaleString() : '-'}</td>
                  <td className="px-2 py-1 text-gray-700 dark:text-gray-200">{inc.resolved_at ? new Date(inc.resolved_at).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- EDR Alerts Table --- */}
      <div className="mt-10 card bg-white dark:bg-slate-800 shadow-md dark:shadow-slate-900 border border-gray-200 dark:border-slate-700">
        <h2 className="card-title mb-4 text-gray-700 dark:text-gray-200">Recent EDR Alerts</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr>
                <th className="px-2 py-1 text-gray-700 dark:text-gray-200">Alert ID</th>
                <th className="px-2 py-1 text-gray-700 dark:text-gray-200">Type</th>
                <th className="px-2 py-1 text-gray-700 dark:text-gray-200">Severity</th>
                <th className="px-2 py-1 text-gray-700 dark:text-gray-200">Process</th>
                <th className="px-2 py-1 text-gray-700 dark:text-gray-200">Status</th>
                <th className="px-2 py-1 text-gray-700 dark:text-gray-200">Detected At</th>
              </tr>
            </thead>
            <tbody>
              {edrAlerts.slice(0, 10).map((alert, i) => (
                <tr key={i} className="border-b border-gray-200 dark:border-slate-700">
                  <td className="px-2 py-1 text-gray-700 dark:text-gray-200">{alert.alert_id}</td>
                  <td className="px-2 py-1 text-gray-700 dark:text-gray-200">{alert.alert_type}</td>
                  <td className="px-2 py-1 text-gray-700 dark:text-gray-200">{alert.severity}</td>
                  <td className="px-2 py-1 text-gray-700 dark:text-gray-200">{alert.detected_process}</td>
                  <td className="px-2 py-1 text-gray-700 dark:text-gray-200">{alert.status}</td>
                  <td className="px-2 py-1 text-gray-700 dark:text-gray-200">{alert.detected_at ? new Date(alert.detected_at).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
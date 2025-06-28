import React, { useEffect, useState } from 'react';
import axios from 'axios';
import L from 'leaflet';
import { Pie, Line, Bar } from 'react-chartjs-2';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

export default function SIEM() {
  // State
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [ipAnalysis, setIpAnalysis] = useState([]);
  const [networkLogs, setNetworkLogs] = useState([]);
  const apiBase = import.meta.env.VITE_API;
  // Fetch all data on mount
  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const [alertsRes, incidentsRes, ipAnalysisRes, networkLogsRes] = await Promise.all([
          axios.get(`${apiBase}/alerts`, config),
          axios.get(`${apiBase}/incident`, config),
          axios.get(`${apiBase}/ip_analysis`, config),
          axios.get(`${apiBase}/network_logs`, config),
        ]);
        setAlerts(alertsRes.data);
        setIncidents(incidentsRes.data);
        setIpAnalysis(ipAnalysisRes.data);
        setNetworkLogs(networkLogsRes.data);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    }
    fetchData();
  }, []);

  const incidentStatusCounts = incidents.reduce((acc, { status }) => {
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const incidentStatusData = {
    labels: Object.keys(incidentStatusCounts),
    datasets: [{
      data: Object.values(incidentStatusCounts),
      backgroundColor: ['#F87171', '#34D399'],
      label: 'Incident Status'
    }]
  };

  const priorityCounts = incidents.reduce((acc, { priority }) => {
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});
  const priorityData = {
    labels: Object.keys(priorityCounts),
    datasets: [{
      label: 'Incident Priorities',
      data: Object.values(priorityCounts),
      backgroundColor: ['#EF4444', '#F59E0B', '#3B82F6']
    }]
  };

  const incidentTypeCounts = incidents.reduce((acc, { incident_type }) => {
    acc[incident_type] = (acc[incident_type] || 0) + 1;
    return acc;
  }, {});
  const incidentTypeData = {
    labels: Object.keys(incidentTypeCounts),
    datasets: [{
      label: 'Incident Types',
      data: Object.values(incidentTypeCounts),
      backgroundColor: ['#8B5CF6', '#10B981', '#F97316']
    }]
  };

  // 1. Pie Chart: Alert Status Distribution (open, resolved, etc.)
  const alertStatusCounts = alerts.reduce((acc, { status }) => {
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const alertStatusData = {
    labels: Object.keys(alertStatusCounts),
    datasets: [{
      data: Object.values(alertStatusCounts),
      backgroundColor: ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6'],
      label: 'Alert Status'
    }]
  };

  // 2. Line Chart: Alerts Over Time (group by date)
  const alertsOverTime = alerts.reduce((acc, { alert_datetime }) => {
    const date = new Date(alert_datetime).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  const alertsOverTimeData = {
    labels: Object.keys(alertsOverTime),
    datasets: [{
      label: 'Alerts Over Time',
      data: Object.values(alertsOverTime),
      borderColor: '#2563EB',
      backgroundColor: 'rgba(37, 99, 235, 0.3)',
      tension: 0.3,
      fill: true,
    }]
  };

  // 3. Map of IPs involved in incidents (from ip_analysis)
  // We'll map each IP's geolocation if available
  // Fallback center on India (20.5937, 78.9629)
  const ipMarkers = ipAnalysis
    .filter(ip => ip.latitude && ip.longitude)
    .map((ip, idx) => (
      <Marker key={idx} position={[ip.latitude, ip.longitude]}>
        <Popup>
          <div>
            <strong>IP:</strong> {ip.ip_address}<br />
            <strong>Location:</strong> {ip.city || 'N/A'}, {ip.country || 'N/A'}<br />
            <strong>Incident Count:</strong> {ip.incident_count || 0}
          </div>
        </Popup>
      </Marker>
    ));


  // 4. Bar Chart: Alert Types or Severity Levels
  // We'll show severity distribution from alerts
  const severityCounts = alerts.reduce((acc, { severity }) => {
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {});
  const severityData = {
    labels: Object.keys(severityCounts),
    datasets: [{
      label: 'Severity Levels',
      data: Object.values(severityCounts),
      backgroundColor: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6']
    }]
  };

  // 5. Bar Chart: SIEM Alert Types by Detection Source Count
  // Assuming alerts have detection_source field
  const detectionSourceCounts = alerts.reduce((acc, { detection_source }) => {
    acc[detection_source] = (acc[detection_source] || 0) + 1;
    return acc;
  }, {});
  const detectionSourceData = {
    labels: Object.keys(detectionSourceCounts),
    datasets: [{
      label: 'Detection Source Count',
      data: Object.values(detectionSourceCounts),
      backgroundColor: ['#2563EB', '#D946EF', '#F59E0B', '#10B981', '#EF4444']
    }]
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen space-y-12">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Alerts", value: alerts.length, color: "blue" },
          { label: "Unique Alert Types", value: [...new Set(alerts.map(a => a.alert_type))].length, color: "purple" },
          {
            label: "Open / Resolved",
            value: `${alertStatusCounts['open'] || 0} / ${alertStatusCounts['resolved'] || 0}`,
            color: "green"
          },
          // {
          //   label: "Total Detection Sources",
          //   value: alerts.reduce((sum, a) => sum + (a.detection_sources_count || 0), 0),
          //   color: "yellow"
          // }
        ].map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg">
            <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium">{card.label}</h3>
            <p className={`text-2xl font-bold text-${card.color}-600 dark:text-${card.color}-400`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Incident Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg">
          <h3 className="text-gray-600 dark:text-gray-300">Total Incidents</h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{incidents.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg">
          <h3 className="text-gray-600 dark:text-gray-300">Unique Incident Types</h3>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {[...new Set(incidents.map(i => i.incident_type))].length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg">
          <h3 className="text-gray-600 dark:text-gray-300">Open / Resolved</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {incidents.filter(i => i.status === 'open').length} / {incidents.filter(i => i.status === 'resolved').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg">
          <h3 className="text-gray-600 dark:text-gray-300">Critical Priority</h3>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {incidents.filter(i => i.priority === 'critical').length}
          </p>
        </div>
      </div>

      {/* IP Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Total IPs Analyzed",
            value: ipAnalysis.length,
            color: "blue"
          },
          {
            label: "Blacklisted IPs",
            value: ipAnalysis.filter(ip => ip.is_blacklisted === 1).length,
            color: "red"
          },
          {
            label: "Whitelisted IPs",
            value: ipAnalysis.filter(ip => ip.is_whitelisted === 1).length,
            color: "green"
          }
        ].map((ip, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg">
            <h3 className="text-gray-600 dark:text-gray-300">{ip.label}</h3>
            <p className={`text-2xl font-bold text-${ip.color}-600 dark:text-${ip.color}-400`}>{ip.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">📊 Alert Status Distribution</h2>
          <div className="w-64 h-64 mx-auto">
            <Pie data={alertStatusData} />
          </div>
        </section>

        {/* Line Chart */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">📈 Alerts Over Time</h2>
          <div className="h-64">
            <Line data={alertsOverTimeData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </section>

        {/* Map */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">🗺️ Incident IP Locations</h2>
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={3}
            scrollWheelZoom={false}
            style={{ height: '400px', borderRadius: '1rem' }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {ipMarkers}
          </MapContainer>
        </section>

        {/* More Charts */}
        {[
          { title: "🔥 Alert Severity Levels", chart: <Bar data={severityData} /> },
          { title: "📊 Alert Types by Detection Source", chart: <Bar data={detectionSourceData} /> },
          {
            title: "🚨 Alert Types", chart: (
              <Bar data={{
                labels: Object.keys(alerts.reduce((acc, a) => {
                  acc[a.alert_type] = (acc[a.alert_type] || 0) + 1;
                  return acc;
                }, {})),
                datasets: [{
                  label: 'Alert Type Count',
                  data: Object.values(alerts.reduce((acc, a) => {
                    acc[a.alert_type] = (acc[a.alert_type] || 0) + 1;
                    return acc;
                  }, {})),
                  backgroundColor: ['#EC4899', '#6366F1', '#3B82F6', '#10B981', '#F59E0B'],
                }]
              }} />
            )
          },
          { title: "🧩 Incident Status", chart: <Pie data={incidentStatusData} /> },
          { title: "🚨 Incident Priorities", chart: <Bar data={priorityData} /> },
          { title: "📁 Incident Types", chart: <Bar data={incidentTypeData} /> },
        ].map((item, idx) => (
          <section key={idx} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">{item.title}</h2>
            <div className="h-64">{item.chart}</div>
          </section>
        ))}
      </div>
    </div>

  );
}

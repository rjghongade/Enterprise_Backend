import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

// Fix default icon for leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

export default function ADMINThreatIntelligence() {
  const [threats, setThreats] = useState([]);
  const [networkLogs, setNetworkLogs] = useState([]);
  const [tiFeed, setTiFeed] = useState([]);
  const apiBase = import.meta.env.VITE_API;

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const [threatsRes, networkRes, tiFeedRes] = await Promise.all([
          axios.get(`${apiBase}/threats_xdr`, config),
          axios.get(`${apiBase}/network_logs`, config),
          axios.get(`${apiBase}/ti_feed_soar`, config)
        ]);
        setThreats(threatsRes.data);
        setNetworkLogs(networkRes.data);
        setTiFeed(tiFeedRes.data);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    }
    fetchData();
  }, []);

  if (!threats.length || !networkLogs.length || !tiFeed.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading Threat Intelligence data...</p>
      </div>
    );
  }

  // Summary Counts
  const totalThreats = threats.length;
  const criticalThreats = threats.filter(t => t.severity === "Critical").length;
  const openThreats = threats.filter(t => t.status === "Open").length;
  const highTiFeeds = tiFeed.filter(f => f.threat_level === "High").length;

  // Chart 1 - Threat Type Distribution
  const threatTypeCounts = threats.reduce((acc, t) => {
    acc[t.threat_type] = (acc[t.threat_type] || 0) + 1;
    return acc;
  }, {});
  const threatTypes = Object.keys(threatTypeCounts);
  const threatTypeData = {
    labels: threatTypes,
    datasets: [{
      label: "Threat Types",
      data: threatTypes.map(type => threatTypeCounts[type]),
      backgroundColor: ["#ef4444", "#3b82f6", "#10b981", "#f59e0b"]
    }]
  };

  // Chart 2 - Anomaly vs Indicator
  const anomalyCounts = networkLogs.reduce((acc, log) => {
    if (log.anomaly_type && log.anomaly_type !== "NA") {
      acc[log.anomaly_type] = (acc[log.anomaly_type] || 0) + 1;
    }
    return acc;
  }, {});
  const indicatorCounts = tiFeed.reduce((acc, feed) => {
    acc[feed.indicator_type] = (acc[feed.indicator_type] || 0) + 1;
    return acc;
  }, {});
  const combinedLabels = Array.from(
    new Set([...Object.keys(anomalyCounts), ...Object.keys(indicatorCounts)])
  );
  const anomalyVsIndicatorData = {
    labels: combinedLabels,
    datasets: [
      {
        label: "Anomalies",
        data: combinedLabels.map(l => anomalyCounts[l] || 0),
        backgroundColor: "#3b82f6"
      },
      {
        label: "Indicators",
        data: combinedLabels.map(l => indicatorCounts[l] || 0),
        backgroundColor: "#f59e0b"
      }
    ]
  };

  // Chart 3 - Threats by Country
  const countryCounts = networkLogs.reduce((acc, log) => {
    if (log.country) acc[log.country] = (acc[log.country] || 0) + 1;
    return acc;
  }, {});
  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const threatByCountryData = {
    labels: topCountries.map(([c]) => c),
    datasets: [{
      label: "Threats",
      data: topCountries.map(([, count]) => count),
      backgroundColor: "#ef4444"
    }]
  };

  // Extract coordinates for Map
  const validCoords = networkLogs
    .filter(log => log.latitude && log.longitude)
    .map(log => ({
      lat: parseFloat(log.latitude),
      lng: parseFloat(log.longitude),
      ip: log.source_ip,
      city: log.city,
      region: log.region,
      country: log.country
    }));

return (
  <div className="h-screen overflow-hidden p-4 bg-gray-50 dark:bg-gray-900">

    {/* Summary Cards */}
    <div className="grid grid-cols-4 gap-4 mb-4">
      <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg shadow text-center">
        <h3 className="text-xl font-semibold text-red-700 dark:text-red-200">Total Threats</h3>
        <p className="text-3xl font-bold text-red-800 dark:text-red-100">{totalThreats}</p>
      </div>
      <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg shadow text-center">
        <h3 className="text-xl font-semibold text-yellow-700 dark:text-yellow-200">Open Threats</h3>
        <p className="text-3xl font-bold text-yellow-800 dark:text-yellow-100">{openThreats}</p>
      </div>
      <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg shadow text-center">
        <h3 className="text-xl font-semibold text-purple-700 dark:text-purple-200">Critical</h3>
        <p className="text-3xl font-bold text-purple-800 dark:text-purple-100">{criticalThreats}</p>
      </div>
      <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg shadow text-center">
        <h3 className="text-xl font-semibold text-green-700 dark:text-green-200">High TI Feeds</h3>
        <p className="text-3xl font-bold text-green-800 dark:text-green-100">{highTiFeeds}</p>
      </div>
    </div>

    {/* Visualization Row */}
    <div className="grid grid-cols-3 gap-4 h-3/5">
      {/* Threat Types Pie */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
        <h2 className="text-xl font-semibold mb-2 text-center text-gray-900 dark:text-gray-100">Threat Types</h2>
        <div className="flex-grow">
          <Pie data={threatTypeData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>

      {/* Anomalies vs Indicators */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
        <h2 className="text-xl font-semibold mb-2 text-center text-gray-900 dark:text-gray-100">Anomalies vs Indicators</h2>
        <div className="flex-grow">
          <Bar data={anomalyVsIndicatorData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>

      {/* Threats by Country */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
        <h2 className="text-xl font-semibold mb-2 text-center text-gray-900 dark:text-gray-100">Threats by Country</h2>
        <div className="flex-grow">
          <Bar data={threatByCountryData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
    </div>

    {/* Map - Bottom Fixed */}
    <div className="mt-4 h-2/5">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 h-full">
        <h2 className="text-xl font-semibold mb-2 text-center text-gray-900 dark:text-gray-100">Source IP Locations</h2>
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={2}
          scrollWheelZoom={false}
          className="h-full w-full rounded"
        >
          <TileLayer
            attribution='© <a href="https://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {validCoords.map((coord, index) => (
            <Marker key={index} position={[coord.lat, coord.lng]}>
              <Popup>
                <strong>{coord.ip}</strong><br />
                {coord.city}, {coord.region}, {coord.country}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  </div>
);

}

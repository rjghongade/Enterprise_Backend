import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

// Fix default marker icon issue with Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function ADMINUEBA() {
  const [userActivity, setUserActivity] = useState([]);
  const apiBase = import.meta.env.VITE_API;

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const res = await axios.get(`${apiBase}/user_activity`, config);
        setUserActivity(res.data);
      } catch (error) {
        console.error("Error fetching UEBA data", error);
      }
    }
    fetchData();
  }, []);

  if (!userActivity.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading UEBA data...</p>
      </div>
    );
  }

  // ✅ Count Stats
  const totalCount = userActivity.length;
  const blacklistedCount = userActivity.filter(ua => ua.is_ip_blacklisted === "1").length;
  const verifiedPublisherCount = userActivity.filter(ua => ua.publisher_verified === "1").length;

  // ✅ Chart Data
  const ipStatusData = {
    labels: ["Blacklisted", "Whitelisted"],
    datasets: [{
      data: [
        blacklistedCount,
        totalCount - blacklistedCount
      ],
      backgroundColor: ["#ef4444", "#10b981"],
      borderColor: "#1f2937",
      borderWidth: 1,
    }]
  };

  const softwarePublisherData = {
    labels: ["Verified Publisher", "Unverified Publisher"],
    datasets: [{
      data: [
        verifiedPublisherCount,
        totalCount - verifiedPublisherCount
      ],
      backgroundColor: ["#3b82f6", "#f59e0b"],
      borderColor: "#1f2937",
      borderWidth: 1,
    }]
  };

  const countryCounts = userActivity.reduce((acc, ua) => {
    acc[ua.country] = (acc[ua.country] || 0) + 1;
    return acc;
  }, {});
  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const countryActivityData = {
    labels: topCountries.map(([country]) => country),
    datasets: [{
      label: "User Activity",
      data: topCountries.map(([, count]) => count),
      backgroundColor: [
        "#6366f1", "#8b5cf6", "#ec4899", "#10b981", "#3b82f6",
        "#f59e0b", "#ef4444", "#14b8a6", "#e11d48", "#0ea5e9"
      ],
      borderColor: "#1f2937",
      borderWidth: 1,
    }]
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-12 text-gray-900 dark:text-gray-100">
      {/* ✅ Count Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
          <h2 className="text-xl font-semibold">Total Entries</h2>
          <p className="text-2xl font-bold">{totalCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
          <h2 className="text-xl font-semibold">Blacklisted IPs</h2>
          <p className="text-2xl font-bold text-red-500">{blacklistedCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
          <h2 className="text-xl font-semibold">Verified Publishers</h2>
          <p className="text-2xl font-bold text-blue-500">{verifiedPublisherCount}</p>
        </div>
      </div>

      {/* ✅ Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">IP Status Distribution</h2>
          <Doughnut data={ipStatusData} />
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Software Publisher Verification</h2>
          <Bar data={softwarePublisherData} />
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Top Countries by Activity</h2>
          <Bar data={countryActivityData} />
        </div>
      </div>

      {/* ✅ Map */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">User Activity Map</h2>
        <MapContainer center={[20.5937, 78.9629]} zoom={2} className="h-[400px] w-full rounded">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {userActivity.map((ua, idx) => {
            const lat = parseFloat(ua.latitude);
            const lng = parseFloat(ua.longitude);
            if (isNaN(lat) || isNaN(lng)) return null;
            return (
              <Marker position={[lat, lng]} key={idx}>
                <Popup>
                  <div>
                    <p><strong>IP:</strong> {ua.ip_address}</p>
                    <p><strong>Location:</strong> {ua.city}, {ua.region}, {ua.country}</p>
                    <p><strong>Software:</strong> {ua.new_software_name}</p>
                    <p><strong>Blacklisted:</strong> {ua.is_ip_blacklisted === "1" ? "Yes" : "No"}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* ✅ Table */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">User Activity Table</h2>
        <table className="min-w-full table-auto text-sm border border-gray-300 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-2 py-2 border">User ID</th>
              <th className="px-2 py-2 border">IP Address</th>
              <th className="px-2 py-2 border">Location</th>
              <th className="px-2 py-2 border">Lat / Long</th>
              <th className="px-2 py-2 border">Blacklisted</th>
              <th className="px-2 py-2 border">Software</th>
              <th className="px-2 py-2 border">Publisher</th>
            </tr>
          </thead>
          <tbody>
            {userActivity.map((ua, idx) => (
              <tr
                key={idx}
                className="even:bg-gray-50 dark:even:bg-gray-900"
              >
                <td className="px-2 py-2 border text-center">{ua.user_id}</td>
                <td className="px-2 py-2 border text-center">{ua.ip_address}</td>
                <td className="px-2 py-2 border text-center">
                  {ua.city}, {ua.region}, {ua.country}
                </td>
                <td className="px-2 py-2 border text-center">
                  {ua.latitude}, {ua.longitude}
                </td>
                <td className="px-2 py-2 border text-center">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      ua.is_ip_blacklisted === "1"
                        ? "bg-red-200 text-red-800"
                        : "bg-green-200 text-green-800"
                    }`}
                  >
                    {ua.is_ip_blacklisted === "1" ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-2 py-2 border text-center">{ua.new_software_name}</td>
                <td className="px-2 py-2 border text-center">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      ua.publisher_verified === "1"
                        ? "bg-blue-200 text-blue-800"
                        : "bg-yellow-200 text-yellow-800"
                    }`}
                  >
                    {ua.publisher_verified === "1" ? "Verified" : "Unverified"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

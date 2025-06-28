import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function ADMINMachineLearningSecurity() {
  const [mlFiles, setMlFiles] = useState([]);
  const apiBase = import.meta.env.VITE_API;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchMLFiles = async () => {
      try {
        const res = await axios.get(`${apiBase}/filelog`, config);
        const filtered = res.data.filter((file) => Number(file.MLScan) === 1);
        setMlFiles(filtered);
      } catch (error) {
        console.error("❌ Error fetching ML file data:", error);
      }
    };

    fetchMLFiles();
  }, []);

  // Normalize values
  const sanitizedFiles = mlFiles.map((file) => ({
    ...file,
    isMalicious: Number(file.isMalicious),
    fileSize: Number(file.fileSize),
  }));

  const maliciousCount = sanitizedFiles.filter((f) => f.isMalicious === 1).length;
  const nonMaliciousCount = sanitizedFiles.filter((f) => f.isMalicious === 0).length;
  const totalMLFiles = sanitizedFiles.length;
  const maliciousRatio = `${maliciousCount} / ${totalMLFiles}`;
  const totalSizeMB = (sanitizedFiles.reduce((sum, f) => sum + f.fileSize, 0) / (1024 * 1024)).toFixed(2);

  const barChartData = {
    labels: ["Total Scanned", "Malicious", "Non-Malicious"],
    datasets: [
      {
        label: "File Count",
        data: [totalMLFiles, maliciousCount, nonMaliciousCount],
        backgroundColor: ["#3b82f6", "#ef4444", "#10b981"],
      },
    ],
  };

  const doughnutData = {
    labels: ["Malicious", "Non-Malicious"],
    datasets: [
      {
        data: [maliciousCount, nonMaliciousCount],
        backgroundColor: ["#dc2626", "#16a34a"],
        borderWidth: 2,
      },
    ],
  };

  ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
  
  const features = [
    "Machine", "SizeOfOptionalHeader", "Characteristics", "MajorLinkerVersion",
    "MinorLinkerVersion", "SizeOfCode", "SizeOfInitializedData", "SizeOfUninitializedData",
    "AddressOfEntryPoint", "BaseOfCode", "BaseOfData", "ImageBase", "SectionAlignment",
    "FileAlignment", "MajorOperatingSystemVersion", "MinorOperatingSystemVersion",
    "MajorImageVersion", "MinorImageVersion", "MajorSubsystemVersion", "MinorSubsystemVersion",
    "SizeOfImage", "SizeOfHeaders", "CheckSum", "Subsystem", "DllCharacteristics",
    "SizeOfStackReserve", "SizeOfStackCommit", "SizeOfHeapReserve", "SizeOfHeapCommit",
    "LoaderFlags", "NumberOfRvaAndSizes", "SectionsNb", "SectionsMeanEntropy",
    "SectionsMinEntropy", "SectionsMaxEntropy", "SectionsMeanRawsize", "SectionsMinRawsize",
    "SectionMaxRawsize", "SectionsMeanVirtualsize", "SectionsMinVirtualsize",
    "SectionMaxVirtualsize", "ImportsNbDLL", "ImportsNb", "ImportsNbOrdinal", "ExportNb",
    "ResourcesNb", "ResourcesMeanEntropy", "ResourcesMinEntropy", "ResourcesMaxEntropy",
    "ResourcesMeanSize", "ResourcesMinSize", "ResourcesMaxSize", "LoadConfigurationSize",
    "VersionInformationSize", "legitimate"
  ];
  // Use dummy values for illustration
const dummyValues = features.map(() => Math.floor(Math.random() * 100) + 1);

const data = {
  labels: features,
  datasets: [
    {
      label: "Feature Presence (Illustrative)",
      data: dummyValues,
      backgroundColor: "#38bdf8", // Tailwind Sky-400
    },
  ],
};

  const options = {
  indexAxis: "y", // Horizontal bar chart
  responsive: true,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: "ML Features Used in Classification",
      color: "#ffffff",
      font: { size: 20 },
    },
  },
  scales: {
    y: {
      ticks: { color: "#ffffff" },
    },
    x: {
      ticks: { color: "#ffffff" },
    },
  },
};

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <h2 className="text-sm font-medium">Total ML Scanned</h2>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{totalMLFiles}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <h2 className="text-sm font-medium">Malicious Files</h2>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">{maliciousCount}</p>
          <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">Ratio: {maliciousRatio}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <h2 className="text-sm font-medium">Non-Malicious</h2>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">{nonMaliciousCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <h2 className="text-sm font-medium">Total Size</h2>
          <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{totalSizeMB} MB</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <h2 className="text-sm font-medium mb-2">📊 File Count Summary</h2>
          <div className="h-[260px]">
            <Bar data={barChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <h2 className="text-sm font-medium mb-2">🍩 Malicious vs Safe</h2>
          <div className="h-[260px] flex items-center justify-center">
            <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-auto">
        <h2 className="text-lg font-semibold p-4 border-b border-gray-200 dark:border-gray-700">
          📂 Detailed File Logs
        </h2>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">File</th>
              <th className="px-4 py-2">Event</th>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Signed</th>
              <th className="px-4 py-2">Size (KB)</th>
              <th className="px-4 py-2">Malicious</th>
              <th className="px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 dark:text-gray-100">
            {sanitizedFiles.map((file) => (
              <tr key={file.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="px-4 py-2">{file.fileName}</td>
                <td className="px-4 py-2 text-center">{file.FileEvent}</td>
                <td className="px-4 py-2 text-center">{file.UserName}</td>
                <td className="px-4 py-2 text-center">{file.isSigned === 1 ? "✔️" : "❌"}</td>
                <td className="px-4 py-2 text-center">{(file.fileSize / 1024).toFixed(2)}</td>
                <td className={`px-4 py-2 text-center font-bold ${file.isMalicious ? "text-red-600" : "text-green-600"}`}>
                  {file.isMalicious ? "Yes" : "No"}
                </td>
                <td className="px-4 py-2 text-center">{new Date(file.DateTimeFile).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-6 bg-gray-900 text-white min-h-screen">
        <div className="overflow-auto max-h-[80vh] bg-gray-800 p-4 rounded-lg shadow-lg">
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>
  );
}

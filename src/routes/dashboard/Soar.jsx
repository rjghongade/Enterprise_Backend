import React, { useEffect, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
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
import axios from "axios";
import {
  FiAlertTriangle,
  FiActivity,
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiSun, // For light mode icon
  FiMoon, // For dark mode icon
} from "react-icons/fi";

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

export default function SOAR() {
  const [alerts, setAlerts] = useState([]);
  const [analystLogs, setAnalystLogs] = useState([]);
  const [caseTimeline, setCaseTimeline] = useState([]);
  const [collaborationLogs, setCollabLogs] = useState([]);
  const [responseActions, setResponseActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    // Initialize theme from localStorage or default to 'dark'
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });
  const apiBase = import.meta.env.VITE_API;

  useEffect(() => {
    // Apply theme to the document body
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const [alertsRes, analystLogsRes, caseTimelineRes, collabLogsRes, responseActionsRes] =
          await Promise.all([
            axios.get(`${apiBase}/alerts`, config),
            axios.get(`${apiBase}/analyst_logs`, config),
            axios.get(`${apiBase}/case_timeline_soar`, config),
            axios.get(`${apiBase}/collaboration_log_soar`, config),
            axios.get(`${apiBase}/response_action_log_soar`, config),
          ]);
        setAlerts(alertsRes.data);
        setAnalystLogs(analystLogsRes.data);
        setCaseTimeline(caseTimelineRes.data);
        setCollabLogs(collabLogsRes.data);
        setResponseActions(responseActionsRes.data);
      } catch (error) {
        console.error("Error fetching SOAR data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [apiBase]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  // Summary metrics
  const resolvedAlerts = alerts.filter(a => a.status === "resolved").length;
  const unresolvedAlerts = alerts.filter(a => a.status === "unresolved").length;
  const totalAlerts = alerts.length;
  const resolvedPercentage = totalAlerts > 0 ? Math.round((resolvedAlerts / totalAlerts) * 100) : 0;
  const uniqueAnalysts = [...new Set(analystLogs.map(log => log.analyst_id))].length;
  const avgResponseTime = responseActions.length > 0
    ? responseActions.reduce((sum, act) => sum + act.response_time, 0) / responseActions.length
    : 0;

  // Define colors based on theme
  const chartTextColor = theme === 'dark' ? '#f1f5f9' : '#334155'; // slate-100 or slate-700
  const chartGridColor = theme === 'dark' ? '#475569' : '#e2e8f0'; // slate-600 or slate-200
  const chartTooltipBg = theme === 'dark' ? '#1e293b' : '#f8fafc'; // slate-900 or white
  const chartTooltipTitleColor = theme === 'dark' ? '#f8fafc' : '#1e293b'; // white or slate-900
  const chartTooltipBodyColor = theme === 'dark' ? '#f1f5f9' : '#334155'; // slate-100 or slate-700
  const chartTooltipBorderColor = theme === 'dark' ? '#64748b' : '#94a3b8'; // slate-500 or slate-400

  // Charts data
  const alertStatusChart = {
    labels: ["Resolved", "Unresolved"],
    datasets: [{
      data: [resolvedAlerts, unresolvedAlerts],
      backgroundColor: theme === 'dark' ? ["#00BFFF", "#DC143C"] : ["#10B981", "#EF4444"], // Dark: Cyan blue, Crimson red | Light: Emerald, Red
      borderColor: theme === 'dark' ? ["#00BFFF", "#DC143C"] : ["#10B981", "#EF4444"],
      hoverOffset: 4,
    }],
  };

  const analystActivityCounts = analystLogs.reduce((acc, log) => {
    const action = log.action_performed || "Unknown Action";
    acc[action] = (acc[action] || 0) + 1;
    return acc;
  }, {});
  const analystActivityChart = {
    labels: Object.keys(analystActivityCounts),
    datasets: [{
      label: 'Number of Actions',
      data: Object.values(analystActivityCounts),
      backgroundColor: theme === 'dark' ? '#007BFF' : '#3B82F6', // Dark: Vivid blue | Light: Blue-500
      borderColor: theme === 'dark' ? '#007BFF' : '#3B82F6',
      borderWidth: 1,
    }],
  };

  const responseActionCounts = responseActions.reduce((acc, act) => {
    const actionType = act.action_type || "Unknown Type";
    acc[actionType] = (acc[actionType] || 0) + 1;
    return acc;
  }, {});
  const responseActionChart = {
    labels: Object.keys(responseActionCounts),
    datasets: [{
      label: 'Count of Actions',
      data: Object.values(responseActionCounts),
      fill: false,
      borderColor: theme === 'dark' ? '#FFB800' : '#F59E0B', // Dark: Vivid amber | Light: Amber-500
      tension: 0.1,
      pointBackgroundColor: theme === 'dark' ? '#FFB800' : '#F59E0B',
      pointBorderColor: theme === 'dark' ? '#ffffff' : '#4b5563', // White or slate-600
      pointHoverBackgroundColor: theme === 'dark' ? '#ffffff' : '#4b5563',
      pointHoverBorderColor: theme === 'dark' ? '#FFB800' : '#F59E0B',
    }],
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white/95 dark:from-gray-900 dark:to-gray-700">
      <div className="flex items-center space-x-2">
        <svg className="animate-spin h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-white/90">Loading SOAR Dashboard...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-800 dark:text-white p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
         
            <div className="bg-gray-100 dark:bg-slate-800/60 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600/50">
              <p className="text-gray-700 dark:text-slate-200/80 text-sm">
                Last updated: {new Date().toLocaleString()}
              </p>
            </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-600/20 dark:to-cyan-600/20 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-cyan-300 dark:border-cyan-500/30 hover:border-cyan-400 dark:hover:border-cyan-400/60 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-slate-200/70 text-sm">Total Alerts</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white/95 mt-1">{totalAlerts}</h3>
              </div>
              <div className="p-3 rounded-full bg-cyan-200 dark:bg-cyan-500/20">
                <FiAlertTriangle className="text-cyan-600 dark:text-cyan-300 text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-300/70">
                <span>Resolved: {resolvedAlerts}</span>
                <span>Unresolved: {unresolvedAlerts}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700/50 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-2 rounded-full"
                  style={{ width: `${resolvedPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-600/20 dark:to-green-600/20 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-emerald-300 dark:border-emerald-500/30 hover:border-emerald-400 dark:hover:border-emerald-400/60 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-slate-200/70 text-sm">Resolution Rate</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white/95 mt-1">{resolvedPercentage}%</h3>
              </div>
              <div className="p-3 rounded-full bg-emerald-200 dark:bg-emerald-500/20">
                <FiCheckCircle className="text-emerald-600 dark:text-emerald-300 text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500 dark:text-slate-300/70">
                {resolvedPercentage > 75 ? (
                  <span className="text-emerald-600 dark:text-emerald-300/90">Excellent performance</span>
                ) : resolvedPercentage > 50 ? (
                  <span className="text-yellow-600 dark:text-yellow-300/90">Good performance</span>
                ) : (
                  <span className="text-red-600 dark:text-red-300/90">Needs improvement</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-600/20 dark:to-violet-600/20 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-purple-300 dark:border-purple-500/30 hover:border-purple-400 dark:hover:border-purple-400/60 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-slate-200/70 text-sm">Active Analysts</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white/95 mt-1">{uniqueAnalysts}</h3>
              </div>
              <div className="p-3 rounded-full bg-purple-200 dark:bg-purple-500/20">
                <FiUsers className="text-purple-600 dark:text-purple-300 text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500 dark:text-slate-300/70">
                <span>Tracking {analystLogs.length} activities</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-600/20 dark:to-orange-600/20 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-amber-300 dark:border-amber-500/30 hover:border-amber-400 dark:hover:border-amber-400/60 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-slate-200/70 text-sm">Avg Response Time</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white/95 mt-1">{avgResponseTime.toFixed(2)}s</h3>
              </div>
              <div className="p-3 rounded-full bg-amber-200 dark:bg-amber-500/20">
                <FiClock className="text-amber-600 dark:text-amber-300 text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500 dark:text-slate-300/70">
                {avgResponseTime < 30 ? (
                  <span className="text-emerald-600 dark:text-emerald-300/90">Excellent response time</span>
                ) : avgResponseTime < 60 ? (
                  <span className="text-yellow-600 dark:text-yellow-300/90">Good response time</span>
                ) : (
                  <span className="text-red-600 dark:text-red-300/90">Needs improvement</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gray-50 dark:bg-slate-800/40 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-600/40 hover:border-gray-300 dark:hover:border-slate-500/60 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white/95 flex items-center">
                <FiCheckCircle className="mr-2 text-emerald-600 dark:text-emerald-400" />
                Alert Resolution Status
              </h2>
              <span className="text-xs bg-gray-200 dark:bg-slate-700/60 px-2 py-1 rounded text-gray-700 dark:text-slate-200/80">
                {totalAlerts} total
              </span>
            </div>
            <div className="h-64">
              <Doughnut
                data={alertStatusChart}
                options={{
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: chartTextColor,
                        font: {
                          size: 12
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: chartTooltipBg,
                      titleColor: chartTooltipTitleColor,
                      bodyColor: chartTooltipBodyColor,
                      borderColor: chartTooltipBorderColor,
                      borderWidth: 1,
                    }
                  },
                  cutout: '70%',
                  borderRadius: 8,
                }}
              />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-slate-800/40 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-600/40 hover:border-gray-300 dark:hover:border-slate-500/60 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white/95 flex items-center">
                <FiActivity className="mr-2 text-blue-600 dark:text-blue-400" />
                Analyst Activities
              </h2>
              <span className="text-xs bg-gray-200 dark:bg-slate-700/60 px-2 py-1 rounded text-gray-700 dark:text-slate-200/80">
                {analystLogs.length} actions
              </span>
            </div>
            <div className="h-64">
              <Bar
                data={analystActivityChart}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: chartTooltipBg,
                      titleColor: chartTooltipTitleColor,
                      bodyColor: chartTooltipBodyColor,
                      borderColor: chartTooltipBorderColor,
                      borderWidth: 1,
                    }
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                        drawBorder: false,
                      },
                      ticks: {
                        color: chartTextColor,
                      }
                    },
                    y: {
                      grid: {
                        color: chartGridColor,
                        drawBorder: false,
                      },
                      ticks: {
                        color: chartTextColor,
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-slate-800/40 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-600/40 hover:border-gray-300 dark:hover:border-slate-500/60 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white/95 flex items-center">
                <FiClock className="mr-2 text-amber-600 dark:text-amber-400" />
                Response Actions
              </h2>
              <span className="text-xs bg-gray-200 dark:bg-slate-700/60 px-2 py-1 rounded text-gray-700 dark:text-slate-200/80">
                {responseActions.length} actions
              </span>
            </div>
            <div className="h-64">
              <Line
                data={responseActionChart}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      labels: {
                        color: chartTextColor,
                        font: {
                          size: 12
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: chartTooltipBg,
                      titleColor: chartTooltipTitleColor,
                      bodyColor: chartTooltipBodyColor,
                      borderColor: chartTooltipBorderColor,
                      borderWidth: 1,
                    }
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                        drawBorder: false,
                      },
                      ticks: {
                        color: chartTextColor,
                      }
                    },
                    y: {
                      grid: {
                        color: chartGridColor,
                        drawBorder: false,
                      },
                      ticks: {
                        color: chartTextColor,
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Collaboration Logs */}
        <div className="bg-gray-50 dark:bg-slate-800/40 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-600/40 hover:border-gray-300 dark:hover:border-slate-500/60 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white/95 flex items-center">
              <FiUsers className="mr-2 text-purple-600 dark:text-purple-400" />
              Collaboration Logs
            </h2>
            <span className="text-xs bg-gray-200 dark:bg-slate-700/60 px-2 py-1 rounded text-gray-700 dark:text-slate-200/80">
              {collaborationLogs.length} entries
            </span>
          </div>

          {collaborationLogs.length === 0 ? (
            <div className="bg-gray-100 dark:bg-slate-700/30 rounded-lg p-8 text-center">
              <FiXCircle className="mx-auto text-gray-400 dark:text-slate-400/70 text-4xl mb-3" />
              <p className="text-gray-500 dark:text-slate-300/70">No collaboration logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-slate-600/50">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-slate-600/50">
                <thead className="bg-gray-100 dark:bg-slate-700/30">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-slate-200/80 uppercase tracking-wider">
                      Analyst
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-slate-200/80 uppercase tracking-wider">
                      Comment
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-slate-200/80 uppercase tracking-wider">
                      Entity Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-slate-200/80 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800/20 divide-y divide-gray-200 dark:divide-slate-600/40">
                  {collaborationLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-200 dark:bg-blue-600/30 flex items-center justify-center">
                            <span className="text-blue-700 dark:text-blue-200/90 font-medium">
                              {log.analyst_id ? String(log.analyst_id).charAt(0).toUpperCase() : 'N/A'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white/90">{log.analyst_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-normal max-w-xs">
                        <div className="text-sm text-gray-700 dark:text-slate-200/80">{log.comment}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-200 text-purple-700 dark:bg-purple-600/20 dark:text-purple-200/90">
                          {log.assigned_entity_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-300/70">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
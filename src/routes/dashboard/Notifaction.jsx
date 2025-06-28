import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  BellIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
} from 'lucide-react';

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef(null);
  const apiBase = import.meta.env.VITE_API;

  const dummyData = [
    {
      title: 'Server Down',
      message: 'Production server is not responding.',
      type: 'incident',
      read: false,
      timestamp: new Date().toISOString(),
    },
    {
      title: 'Backup Complete',
      message: 'Database backup completed successfully.',
      type: 'success',
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      title: 'High CPU Usage',
      message: 'Server CPU usage exceeded 90%.',
      type: 'alert',
      read: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      title: 'Weekly Report',
      message: 'Your weekly analytics report is ready.',
      type: 'info',
      read: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
  ];

  // Fetch notifications (with polling)
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await axios.get(`${apiBase}/notifications`);
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.read).length);
      } catch (err) {
        console.error('Failed to fetch notifications, using dummy data:', err);
        setNotifications(dummyData);
        setUnreadCount(dummyData.filter(n => !n.read).length);
      }
    }

    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, 30000); // 30s polling
    return () => clearInterval(intervalRef.current);
  }, [apiBase]);

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.post(`${apiBase}/notifications/mark_all_read`);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark notifications as read, updating locally:', err);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'incident':
        return <AlertTriangleIcon className="text-pink-500 w-5 h-5" />;
      case 'alert':
        return <AlertTriangleIcon className="text-red-500 w-5 h-5" />;
      case 'info':
        return <BellIcon className="text-blue-500 w-5 h-5" />;
      case 'success':
        return <CheckCircleIcon className="text-green-500 w-5 h-5" />;
      default:
        return <BellIcon className="text-gray-400 w-5 h-5" />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white text-center flex items-center gap-2">
          <BellIcon className="w-7 h-7" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500 text-white">
              {unreadCount}
            </span>
          )}
        </h1>
        {notifications.length > 0 && unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700 transition"
          >
            Mark all as read
          </button>
        )}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
        {notifications.length === 0 ? (
          <p className="p-4 text-center text-gray-500 dark:text-gray-400">
            No notifications found.
          </p>
        ) : (
          notifications.map((note, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 p-4 transition duration-200 ${
                !note.read
                  ? 'bg-blue-50 dark:bg-slate-700/50'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="mt-1">{getIcon(note.type)}</div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-2">
                  {note.title}
                  {note.type === 'incident' && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200 text-xs">
                      Incident
                    </span>
                  )}
                  {note.type === 'alert' && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 text-xs">
                      Alert
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{note.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(note.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

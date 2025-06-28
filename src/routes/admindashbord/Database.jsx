import React, { useEffect, useState } from 'react';
import {
  Search,
  Shield,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

const ITEMS_PER_PAGE = 12;

const isValidIP = (ip) =>
  /^((25[0-5]|2[0-4][0-9]|1?[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1?[0-9]{1,2})$/.test(
    ip
  );

const Pagination = ({ currentPage, totalPages, setCurrentPage }) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-1 mt-4">
      <button
        onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        Previous
      </button>

      {getVisiblePages().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && setCurrentPage(page)}
          disabled={page === '...'}
          className={`px-3 py-2 rounded border transition-colors ${
            page === currentPage
              ? 'bg-blue-600 text-white border-blue-600 shadow'
              : page === '...'
              ? 'border-transparent cursor-default'
              : 'border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        Next
      </button>
    </div>
  );
};

const Dashboard = () => {
  const [blackIPs, setBlackIPs] = useState([]);
  const [whiteIPs, setWhiteIPs] = useState([]);
  const [phishingSites, setPhishingSites] = useState([]);

  const [activeTab, setActiveTab] = useState('black');
  const [blackPage, setBlackPage] = useState(1);
  const [whitePage, setWhitePage] = useState(1);
  const [phishingPage, setPhishingPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [blackRes, whiteRes, phishingRes] = await Promise.all([
          fetch('/data/BlacklistedIp.txt'),
          fetch('/data/WhitelistedIp.txt'),
          fetch('/data/PhishingWebsites.txt'),
        ]);

        if (!blackRes.ok || !whiteRes.ok || !phishingRes.ok) {
          throw new Error('Failed to fetch files');
        }

        const [blackText, whiteText, phishingText] = await Promise.all([
          blackRes.text(),
          whiteRes.text(),
          phishingRes.text(),
        ]);

        setBlackIPs(
          blackText
            .split('\n')
            .map((ip) => ip.trim())
            .filter((ip) => ip && isValidIP(ip))
        );
        setWhiteIPs(
          whiteText
            .split('\n')
            .map((ip) => ip.trim())
            .filter((ip) => ip && isValidIP(ip))
        );
        setPhishingSites(
          phishingText
            .split('\n')
            .map((url) => url.trim())
            .filter((url) => url && url.startsWith('http'))
        );
      } catch (err) {
        console.error(err);
        setError('Unable to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getCurrentData = () => {
    switch (activeTab) {
      case 'black':
        return blackIPs;
      case 'white':
        return whiteIPs;
      case 'phishing':
        return phishingSites;
      default:
        return [];
    }
  };

  const getCurrentPage = () => {
    switch (activeTab) {
      case 'black':
        return blackPage;
      case 'white':
        return whitePage;
      case 'phishing':
        return phishingPage;
      default:
        return 1;
    }
  };

  const setCurrentPage = (page) => {
    switch (activeTab) {
      case 'black':
        setBlackPage(page);
        break;
      case 'white':
        setWhitePage(page);
        break;
      case 'phishing':
        setPhishingPage(page);
        break;
    }
  };

  const currentData = getCurrentData();
  const currentPage = getCurrentPage();
  const totalPages = Math.ceil(currentData.length / ITEMS_PER_PAGE);
  const paginatedData = currentData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const tabConfig = {
    black: {
      title: 'Blacklisted IPs',
      icon: Shield,
      color: 'from-red-500 to-red-600',
      textColor: 'text-red-700 dark:text-red-400',
      count: blackIPs.length,
      status: 'Blocked',
    },
    white: {
      title: 'Whitelisted IPs',
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-700 dark:text-green-400',
      count: whiteIPs.length,
      status: 'Allowed',
    },
    phishing: {
      title: 'Phishing Sites',
      icon: AlertTriangle,
      color: 'from-amber-500 to-amber-600',
      textColor: 'text-amber-700 dark:text-amber-400',
      count: phishingSites.length,
      status: 'Detected',
    },
  };

  const currentConfig = tabConfig[activeTab];
  const IconComponent = currentConfig.icon;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Loading security data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700 dark:text-white mb-2">
            Error loading data
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Tabs */}
      <header className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <div className="flex gap-3">
          {Object.entries(tabConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                activeTab === key
                  ? `bg-gradient-to-r ${config.color} text-white shadow`
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <config.icon className="w-4 h-4" />
              {config.title}
              <span className="ml-1 text-xs font-bold">{config.count}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Table */}
      <div className="flex-1 flex flex-col justify-between p-4 overflow-hidden">
        <div className="overflow-hidden border rounded-lg border-slate-200 dark:border-slate-700">
          <table className="w-full table-fixed text-sm">
            <thead className="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th className="p-3 text-left w-12 text-slate-700 dark:text-slate-300">#</th>
                <th className="p-3 text-left text-slate-700 dark:text-slate-300">
                  {activeTab === 'phishing' ? 'URL' : 'IP Address'}
                </th>
                <th className="p-3 text-left w-32 text-slate-700 dark:text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody className="max-h-full overflow-y-auto">
              {paginatedData.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-t border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-300">
                    {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                  </td>
                  <td className="p-3 font-mono break-all text-blue-600 dark:text-blue-400">
                    {activeTab === 'phishing' ? (
                      <a href={item} target="_blank" rel="noreferrer">
                        {item}
                      </a>
                    ) : (
                      item
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        activeTab === 'black'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : activeTab === 'white'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}
                    >
                      {currentConfig.status}
                    </span>
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-6 text-center text-slate-500 dark:text-slate-400">
                    <Search className="mx-auto mb-2 h-8 w-8 opacity-30" />
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default Dashboard;

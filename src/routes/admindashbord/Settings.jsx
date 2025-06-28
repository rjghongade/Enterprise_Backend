import React, { useState, useEffect } from 'react';

export default function ADMINSettings() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkTheme, setDarkTheme] = useState(
    window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [selectedLang, setSelectedLang] = useState('English');
  const [loading, setLoading] = useState(true);

  // Properly fetch user data on mount
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        // Replace with your actual API endpoint and authentication as needed
        const res = await fetch('/api/admin/profile', {
          credentials: 'include', // or add headers if needed
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setUsername(data.username || '');
        setEmail(data.email || '');
        setNotifications(data.notifications ?? true);
        setEmailNotifications(data.emailNotifications ?? true);
      } catch (err) {
        setSuccessMsg('❌ Failed to load user data');
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  // Theme toggle handler (for demonstration, toggles class on body)
  useEffect(() => {
    if (darkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkTheme]);

  // Google Translate widget loader and language display
  useEffect(() => {
    // Hide Google icon via CSS
    const style = document.createElement('style');
    style.innerHTML = `
      #google_translate_element .goog-logo-link,
      #google_translate_element img {
        display: none !important;
      }
      #google_translate_element .goog-te-gadget {
        color: inherit !important;
        font-size: 1rem !important;
      }
    `;
    document.head.appendChild(style);

    // Google Translate widget loader
    const addGoogleTranslateScript = () => {
      if (document.getElementById('google-translate-script')) return;
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.async = true;
      script.src =
        '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(script);
    };

    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          { pageLanguage: 'en', includedLanguages: 'en,hi,fr,es,de,zh-CN,ar,ru,ja,ko', layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE },
          'google_translate_element'
        );
      }
    };

    addGoogleTranslateScript();

    // Cleanup
    return () => {
      delete window.googleTranslateElementInit;
      document.head.removeChild(style);
    };
  }, []);

  // Listen for language change and update selectedLang
  useEffect(() => {
    const interval = setInterval(() => {
      const select = document.querySelector('#google_translate_element select');
      if (select) {
        const langText = select.options[select.selectedIndex]?.text || 'English';
        setSelectedLang(langText);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, notifications, emailNotifications }),
        credentials: 'include', // or add headers if needed
      });
      if (!res.ok) throw new Error('Failed to update');
      setSuccessMsg('✅ Profile updated successfully!');
    } catch {
      setSuccessMsg('❌ Failed to update profile!');
    }
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setSuccessMsg('❌ Passwords do not match!');
      return;
    }
    setSuccessMsg('✅ Password updated successfully!');
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-2 mt-2">
          <div id="google_translate_element"></div>
          <span className="ml-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
            {selectedLang}
          </span>
        </div>
      </div>



      {loading ? (
        <div className="flex justify-center items-center py-10">
          <span className="text-lg text-blue-700 dark:text-blue-300">Loading user data...</span>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto">
          {/* Profile Settings */}


          {/* Preferences */}
          <section className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 flex flex-col justify-center border border-blue-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300 text-center">
              Preferences
            </h2>
            <div className="flex flex-col gap-8">
              {/* Notification Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">Notifications</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enable or disable all notifications
                  </p>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={() => setNotifications((v) => !v)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 dark:bg-gray-700 rounded-full peer peer-checked:bg-blue-600 transition"></div>
                  <span className="ml-3 text-sm font-medium">
                    {notifications ? 'On' : 'Off'}
                  </span>
                </label>
              </div>
              {/* Email Notification Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">Email Notifications</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Receive updates via email
                  </p>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={() => setEmailNotifications((v) => !v)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 dark:bg-gray-700 rounded-full peer peer-checked:bg-blue-600 transition"></div>
                  <span className="ml-3 text-sm font-medium">
                    {emailNotifications ? 'On' : 'Off'}
                  </span>
                </label>
              </div>
              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">Theme</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Switch between light and dark mode
                  </p>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={darkTheme}
                    onChange={() => setDarkTheme((v) => !v)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-400 dark:bg-gray-700 rounded-full peer peer-checked:bg-purple-600 transition"></div>
                  <span className="ml-3 text-sm font-medium">
                    {darkTheme ? 'Dark' : 'Light'}
                  </span>
                </label>
              </div>
            </div>
          </section>
        </div>
      )}


    </div>
  );
}


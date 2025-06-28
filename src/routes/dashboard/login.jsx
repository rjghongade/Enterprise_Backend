import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Simple Toast component
function Toast({ message, type, onClose }) {
  return (
    <div
      className={`fixed top-5 right-5 px-4 py-2 rounded shadow-lg z-50 ${
        type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}
    >
      {message}
      <button className="ml-4 font-bold" onClick={onClose}>×</button>
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API;

  useEffect(() => {
    // Prefill if remembered
    const remembered = JSON.parse(localStorage.getItem('rememberMe'));
    if (remembered) {
      setEmail(remembered.email || '');
      setPassword(remembered.password || '');
      setRemember(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setToast({ show: false, message: '', type: '' });

    try {
      const res = await fetch(`${apiBase}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (remember) {
        localStorage.setItem('rememberMe', JSON.stringify({ email, password }));
      } else {
        localStorage.removeItem('rememberMe');
      }

      setToast({ show: true, message: 'Login successful!', type: 'success' });
      setTimeout(() => {
        navigate(data.user.role === 'admin' ? '/admindashboard' : '/dashboard');
      }, 1200);
    } catch (err) {
      setToast({ show: true, message: err.message, type: 'error' });
      setError(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: '' })}
        />
      )}
      <form className="p-8 bg-gray-800 rounded-xl shadow-md w-96" onSubmit={handleSubmit}>
        <h2 className="text-2xl mb-4 font-bold">Login</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 rounded bg-gray-700"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="relative mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className="w-full p-2 rounded bg-gray-700 pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
            onClick={() => setShowPassword((v) => !v)}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              // Eye open SVG
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              // Eye closed SVG
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95M6.873 6.873A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.293 5.95M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
              </svg>
            )}
          </span>
        </div>
        <div className="flex items-center mb-4">
          <input
            id="remember"
            type="checkbox"
            checked={remember}
            onChange={() => setRemember((v) => !v)}
            className="mr-2"
          />
          <label htmlFor="remember" className="text-sm">Remember me</label>
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}
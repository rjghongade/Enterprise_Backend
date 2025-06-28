import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear JWT or any auth tokens
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Optional: clear sessionStorage or cookies if used
    sessionStorage.clear();

    // Redirect to login page after logout
    navigate("/login");
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
        Logging out...
      </h1>
    </div>
  );
}

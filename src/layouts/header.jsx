import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useLocation, useNavigate } from "react-router-dom";
import { navbarLinks } from "@/constants";
import { Bell, ChevronsLeft, Moon, Search, Sun } from "lucide-react";
import profileImg from "@/assets/Ram.jpg";
import PropTypes from "prop-types";

const getPageLabel = (path) => {
  for (const group of navbarLinks) {
    const match = group.links.find((link) => link.path === path);
    if (match) return match.fullLabel || match.label;
  }
  return "Welcome";
};

export const Header = ({ collapsed, setCollapsed }) => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPageLabel = getPageLabel(location.pathname);

  const [profileOptions, setProfileOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const [notificationCount, setNotificationCount] = useState(0);
  
  useEffect(() => {
    fetch("/data/profileOptions.json")
      .then((res) => res.json())
      .then((data) => setProfileOptions(data))
      .catch((err) => console.error("Failed to load profile options", err));
  }, []);

  // Close popup when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOptionClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <header className="relative z-10 flex h-[60px] items-center justify-between bg-white px-4 shadow-md transition-colors dark:bg-slate-900">
      <div className="flex items-center gap-x-3">
        <button className="btn-ghost size-10" onClick={() => setCollapsed(!collapsed)}>
          <ChevronsLeft className={collapsed ? "rotate-180" : ""} />
        </button>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {currentPageLabel}
        </h1>
      </div>

      <div className="flex items-center gap-x-3 relative">
        {/* <div className="input">
          <Search size={20} className="text-slate-300" />
          <input
            type="text"
            name="search"
            id="search"
            placeholder="Search..."
            className="w-full bg-transparent text-slate-900 outline-0 placeholder:text-slate-300 dark:text-slate-50"
          />
        </div> */}

        <button
          className="btn-ghost size-10"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          <Sun size={20} className="dark:hidden" />
          <Moon size={20} className="hidden dark:block" />
        </button>

        {/* Notification Button */}
        <button
          className="btn-ghost size-10 relative"
          onClick={() => navigate("/notification")}
        >
          <Bell size={20} />
          {/* Notification Count Badge */}
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>


        {/* Profile Image */}
        <div className="relative" ref={menuRef}>
          <button
            className="size-10 overflow-hidden rounded-full border-2 border-slate-300 dark:border-slate-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            <img
              src={profileImg}
              alt="profile image"
              className="size-full object-cover"
            />
          </button>

          {/* Popup Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-800 shadow-lg border dark:border-slate-700 animate-slide-in overflow-hidden">
              {profileOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionClick(option.path)}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  collapsed: PropTypes.bool,
  setCollapsed: PropTypes.func,
};



// import { useLocation } from "react-router-dom";
// import { navbarLinks } from "@/constants";
// import { Bell, ChevronsLeft, Moon, Search, Sun } from "lucide-react";
// import profileImg from "@/assets/Ram.jpg";
// import PropTypes from "prop-types";

// const getPageLabel = (path) => {
//   for (const group of navbarLinks) {
//     const match = group.links.find((link) => link.path === path);
//     if (match) return match.fullLabel || match.label;
//   }
//   return "Welcome";
// };

// export const Header = ({ collapsed, setCollapsed }) => {
//   const { theme, setTheme } = useTheme();
//   const location = useLocation();
//   const currentPageLabel = getPageLabel(location.pathname);

//   return (
//     <header className="relative z-10 flex h-[60px] items-center justify-between bg-white px-4 shadow-md transition-colors dark:bg-slate-900">
//       <div className="flex items-center gap-x-3">
//         <button className="btn-ghost size-10" onClick={() => setCollapsed(!collapsed)}>
//           <ChevronsLeft className={collapsed ? "rotate-180" : ""} />
//         </button>
//         <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
//           {currentPageLabel}
//         </h1>
//       </div>
//       <div className="flex items-center gap-x-3">
//         <div className="relative flex items-center bg-slate-100 dark:bg-slate-700 rounded px-2 py-1">
//           <Search size={20} className="text-slate-500 dark:text-slate-300 mr-2" />
//           <input
//             type="text"
//             placeholder="Search..."
//             className="bg-transparent text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 outline-none"
//           />
//         </div>
//         <button
//           className="btn-ghost size-10"
//           onClick={() => setTheme(theme === "light" ? "dark" : "light")}
//         >
//           <Sun size={20} className="dark:hidden" />
//           <Moon size={20} className="hidden dark:block" />
//         </button>
//         <button className="btn-ghost size-10">
//           <Bell size={20} />
//         </button>
//         <button className="size-10 overflow-hidden rounded-full">
//           <img
//             src={profileImg}
//             alt="profile image"
//             className="size-full object-cover"
//           />
//         </button>
//       </div>
//     </header>
//   );
// };

// Header.propTypes = {
//   collapsed: PropTypes.bool,
//   setCollapsed: PropTypes.func,
// };

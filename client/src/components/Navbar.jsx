import { useState } from "react";
import { Search, X, LogOut } from "lucide-react";
import api from "../services/api";

import logo from "../assets/logo.png";
import profile from "../assets/profile.png";

import { useNavigate } from "react-router";
import { useMessageStore } from "../store/useMessageStore";
import { useAuthStore } from "../store/useAuthStore";

export default function Navbar() {
  const setSelectedUser = useMessageStore((state) => state.setSelectedUser);
  const isSidebarOpen = useMessageStore((state) => state.isSidebarOpen);
  const toggleSidebar = useMessageStore((state) => state.toggleSidebar);

  const currentUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.get("/user-api/logout");
      logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleSearch = async (e) => {
    const text = e.target.value;
    setQuery(text);

    if (text.trim() === "") {
      setUsers([]);
      return;
    }

    setIsLoading(true);

    try {
      let res = await api.get(`/user-api/user?search=${text}`, {
        withCredentials: true,
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Search failed:", err);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setUsers([]);
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-[#090d1f]/65 backdrop-blur-md border-b border-white/5 relative shrink-0 z-30">
      
      {/* Brand Logo & Sidebar Toggle */}
      <div className="flex items-center gap-4">
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer mr-1"
            title="Expand Sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        )}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/chat/dashboard")}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 p-0.5 shadow-md shadow-blue-500/10 group-hover:shadow-blue-500/20 transition-all duration-300">
            <img
              src={logo}
              alt="Chat Application Logo"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <span className="text-white font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Chat Application
          </span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="relative max-w-md w-full mx-6 hidden md:block">
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Search users..."
            className="w-full px-4 py-2.5 pl-11 pr-10 rounded-xl text-sm font-medium glass-input"
          />
          <Search
            size={16}
            className="absolute left-4 text-slate-400"
          />

          {query && (
            <X
              size={16}
              onClick={clearSearch}
              className="absolute right-4 text-slate-400 hover:text-white cursor-pointer transition-colors"
            />
          )}
        </div>

        {query.trim() !== "" && (
          <div className="absolute z-50 top-13 left-0 w-full bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl max-h-64 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="px-4 py-4 text-slate-400 text-sm text-center flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
                Searching users...
              </div>
            ) : users.length > 0 ? (
              <div className="p-2 space-y-1">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="px-4 py-3 cursor-pointer rounded-xl hover:bg-white/5 flex items-center justify-between transition-colors group"
                    onClick={() => {
                      setSelectedUser(user);
                      navigate(`/chat/${user._id}`, {
                        state: user,
                      });
                      clearSearch();
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profilePic || profile}
                        alt={user.firstName}
                        className="w-9 h-9 rounded-full object-cover border border-white/10"
                      />
                      <div className="flex flex-col">
                        <span className="text-slate-200 text-sm font-semibold group-hover:text-blue-400 transition-colors">
                          {user.firstName} {user.lastName || ""}
                        </span>
                        <span className="text-slate-500 text-xs">
                          {user.email}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-blue-600/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                      Message
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-4 text-slate-500 text-sm text-center">
                No users found
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Information Profile & LogOut */}
      <div className="flex items-center gap-4">
        
        {/* User Pill Info */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/5 pl-4 pr-2 py-1.5 rounded-full shadow-inner">
          <div className="text-right hidden sm:block">
            <p className="text-slate-200 text-xs font-bold leading-tight">
              {currentUser?.firstName} {currentUser?.lastName || ""}
            </p>
            <p className="text-slate-500 text-[10px] font-medium leading-none mt-0.5">
              {currentUser?.email}
            </p>
          </div>
          <img
            src={currentUser?.profilePic || profile}
            alt="profile"
            className="w-8 h-8 rounded-full object-cover border border-white/10 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 shadow-md"
            onClick={() => navigate("/profile")}
          />
        </div>

        {/* Logout Control */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center p-2 rounded-xl text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/15 hover:border-red-500/30 transition-all duration-300 cursor-pointer shadow-sm"
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}
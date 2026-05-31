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
  const addSidebarUser = useMessageStore((state) => state.addSidebarUser);
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
    <div className="flex items-center justify-between px-6 py-3 bg-[#020617] border-b border-blue-900 relative shrink-0">
      <div className="flex items-center gap-4">
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer mr-1"
            title="Expand Sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 animate-fade-in">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        )}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/chat/dashboard")}
        >
          <img
            src={logo}
            alt="Spark Logo"
            className="w-10 h-10 rounded-full"
          />
          <span className="text-white font-semibold text-lg">
            Spark
          </span>
        </div>
      </div>

      <div className="relative">
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Search users..."
            className="w-[400px] px-4 py-2 pr-10 rounded-lg bg-slate-800 text-white outline-none"
          />

          {query ? (
            <X
              size={18}
              onClick={clearSearch}
              className="absolute right-3 text-gray-400 cursor-pointer"
            />
          ) : (
            <Search
              size={18}
              className="absolute right-3 text-gray-400"
            />
          )}
        </div>

        {query.trim() !== "" && (
          <div className="absolute z-50 top-12 w-full bg-slate-900 rounded-lg border border-slate-700 max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-3 text-gray-400 text-sm text-center">
                Searching...
              </div>
            ) : users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user._id}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-800 flex items-center gap-3"
                  onClick={() => {
                    setSelectedUser(user);
                    
                    navigate(`/chat/${user._id}`, {
                      state: user,
                    });
                    clearSearch();
                  }}
                >
                  <img
                    src={user.profilePic || profile}
                    alt={user.firstName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="text-white text-sm">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {user.email}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-400 text-sm text-center">
                No users found
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-white text-sm font-semibold">
            {currentUser?.firstName} {currentUser?.lastName}
          </p>
          <p className="text-gray-400 text-xs">
            {currentUser?.email}
          </p>
        </div>

        <img
          src={currentUser?.profilePic || profile}
          alt="profile"
          className="w-10 h-10 rounded-full object-cover border cursor-pointer hover:scale-105 transition"
          onClick={() => navigate("/profile")}
        />

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-500 hover:text-red-400"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
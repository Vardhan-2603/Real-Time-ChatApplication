import { useEffect, useState } from "react";
import { useMessageStore } from "../store/useMessageStore";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router";
import CreateChannelModal from "./CreateChannelModal";
import { Hash, Plus, Users, MessageSquare, ChevronLeft } from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sidebarUsers = useMessageStore((state) => state.sidebarUsers);
  const loadSidebarUsers = useMessageStore((state) => state.loadSidebarUsers);

  const channels = useMessageStore((state) => state.channels);
  const loadChannels = useMessageStore((state) => state.loadChannels);

  const selectedUser = useMessageStore((state) => state.selectedUser);
  const unreadCounts = useMessageStore((state) => state.unreadCounts);
  const setSelectedUser = useMessageStore((state) => state.setSelectedUser);
  const currentUser = useAuthStore((state) => state.user);

  const isSidebarOpen = useMessageStore((state) => state.isSidebarOpen);
  const toggleSidebar = useMessageStore((state) => state.toggleSidebar);

  useEffect(() => {
    if (currentUser) {
      loadSidebarUsers();
      loadChannels();
    }
  }, [currentUser, loadSidebarUsers, loadChannels]);

  const handleSidebarUsers = (user) => {
    setSelectedUser(user);
    navigate(`/chat/${user._id}`, { state: user });
  };

  const handleSidebarChannels = (channel) => {
    const channelData = { ...channel, isChannel: true };
    setSelectedUser(channelData);
    navigate(`/chat/${channel._id}`, { state: channelData });
  };

  return (
    <div className={`bg-[#060a1a] text-slate-100 flex flex-col transition-all duration-300 ease-in-out shrink-0 border-r border-white/5 relative z-20 ${
      isSidebarOpen ? "w-[260px] opacity-100" : "w-0 opacity-0 overflow-hidden pointer-events-none"
    }`}>
      
      {/* Sidebar Header */}
      <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center shrink-0 bg-slate-950/20">
        <span className="font-extrabold text-sm tracking-wider uppercase bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">
          Conversations
        </span>
        <button
          onClick={toggleSidebar}
          className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
          title="Collapse Sidebar"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Main Scroller */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-6">
        
        {/* CHANNELS SECTION */}
        <div className="space-y-1.5">
          <div className="px-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              <Users size={12} />
              Channels
            </span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-slate-400 hover:text-white hover:bg-white/5 w-5 h-5 rounded-lg flex justify-center items-center transition-all cursor-pointer border border-white/5"
              title="Create Channel"
            >
              <Plus size={12} />
            </button>
          </div>

          <div className="space-y-0.5">
            {channels?.length === 0 ? (
              <div className="px-3 py-2 text-slate-600 text-xs italic">No channels yet</div>
            ) : (
              channels?.map((channel) => {
                const isSelected = selectedUser?._id === channel._id;
                const unread = unreadCounts[channel._id] || 0;
                return (
                  <div
                    key={channel._id}
                    onClick={() => handleSidebarChannels(channel)}
                    className={`px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-between group ${
                      isSelected
                        ? "bg-gradient-to-r from-blue-600/15 to-indigo-600/10 text-blue-400 border-l-2 border-blue-500 shadow-sm"
                        : "hover:bg-white/5 text-slate-300 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm ${
                        isSelected 
                          ? "bg-blue-600/20 text-blue-400 border border-blue-500/20" 
                          : "bg-slate-800 text-slate-400 border border-slate-700/50"
                      }`}>
                        <Hash size={14} />
                      </div>
                      <span className="font-semibold text-sm truncate">{channel.name}</span>
                    </div>

                    {/* Unread badge */}
                    {unread > 0 ? (
                      <span className="bg-blue-600 text-white text-[10px] font-bold min-w-5 h-5 flex items-center justify-center rounded-full px-1 shadow-md shadow-blue-500/10">
                        {unread}
                      </span>
                    ) : (
                      <span className="text-[10px] opacity-0 group-hover:opacity-50 text-slate-500 transition-opacity font-medium">Join</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* DIRECT MESSAGES SECTION */}
        <div className="space-y-1.5">
          <div className="px-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <MessageSquare size={12} />
            Direct Messages
          </div>

          <div className="space-y-0.5">
            {sidebarUsers.length === 0 ? (
              <div className="px-3 py-2 text-slate-600 text-xs italic">
                No direct chats
              </div>
            ) : (
              sidebarUsers.map((user) => {
                const isSelected = selectedUser?._id === user._id;
                const unread = unreadCounts[user._id] || 0;
                const initials = user.firstName ? user.firstName.charAt(0).toUpperCase() : "?";

                return (
                  <div
                    key={user._id}
                    onClick={() => handleSidebarUsers(user)}
                    className={`px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-between group ${
                      isSelected
                        ? "bg-gradient-to-r from-blue-600/15 to-indigo-600/10 text-blue-400 border-l-2 border-blue-500 shadow-sm"
                        : "hover:bg-white/5 text-slate-300 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-inner relative flex-shrink-0 ${
                        isSelected 
                          ? "bg-blue-600/20 text-blue-400 border border-blue-500/20" 
                          : "bg-slate-700 text-slate-300"
                      }`}>
                        {initials}
                        
                        {/* Fake active indicator (online state placeholder) */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-[#060a1a]"></div>
                      </div>
                      <span className="font-semibold text-sm truncate">
                        {user.username || `${user.firstName} ${user.lastName || ""}`}
                      </span>
                    </div>

                    {/* Unread badge */}
                    {unread > 0 && (
                      <span className="bg-blue-600 text-white text-[10px] font-bold min-w-5 h-5 flex items-center justify-center rounded-full px-1 shadow-md shadow-blue-500/10">
                        {unread}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <CreateChannelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

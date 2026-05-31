import { useEffect, useState } from "react";
import { useMessageStore } from "../store/useMessageStore";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router";
import CreateChannelModal from "./CreateChannelModal";

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
    <div className={`bg-[#020617] text-white flex flex-col transition-all duration-300 ease-in-out shrink-0 ${
      isSidebarOpen ? "w-[260px] opacity-100" : "w-0 opacity-0 overflow-hidden pointer-events-none"
    }`}>
      {/* TITLE */}

      <div className="px-5 py-4 font-semibold text-lg border-b border-blue-900 flex justify-between items-center shrink-0">
        <span>Chats</span>
        <button
          onClick={toggleSidebar}
          className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Collapse Sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
      </div>

      {/* CHAT LIST */}
      <div className="flex-1 overflow-y-auto">
        {/* CHANNELS SECTION */}
        <div className="px-5 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mt-2 flex justify-between items-center">
          <span>Channels</span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="hover:text-white bg-slate-800 hover:bg-slate-700 w-5 h-5 rounded flex justify-center items-center font-bold text-lg leading-none pb-0.5 transition-colors cursor-pointer"
            title="Create Channel"
          >
            +
          </button>
        </div>
        {channels?.length === 0 ? (
          <div className="px-5 py-2 text-gray-600 text-sm">No channels</div>
        ) : (
          channels?.map((channel) => {
            const unread = unreadCounts[channel._id] || 0;
            return (
              <div
                key={channel._id}
                onClick={() => handleSidebarChannels(channel)}
                className={`px-5 py-3 cursor-pointer transition ${
                  selectedUser?._id === channel._id
                    ? "bg-blue-600 text-white"
                    : "hover:text-blue-400 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold">
                    #
                  </div>
                  <span className="font-medium">{channel.name}</span>
                </div>
                {unread > 0 && (
                  <div className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full mt-1">
                    {unread}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* DIRECT MESSAGES SECTION */}
        <div className="px-5 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mt-4">
          Direct Messages
        </div>
        {sidebarUsers.length === 0 ? (
          <div className="px-5 py-3 text-gray-500 text-sm">
            No direct messages
          </div>
        ) : (
          sidebarUsers.map((user) => {
            const unread = unreadCounts[user._id] || 0;
            return (
              <div
                key={user._id} // Use your actual unique ID property (like user.id or user._id)
                onClick={() => handleSidebarUsers(user)}
                className={`px-5 py-3 cursor-pointer transition ${
                  selectedUser?._id === user._id
                    ? "bg-blue-600 text-white" // highlight active chat
                    : "hover:text-blue-400 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    {user.firstName
                      ? user.firstName.charAt(0).toUpperCase()
                      : "?"}
                  </div>
                  <span>
                    {user.username ||
                      `${user.firstName} ${user.lastName || ""}`}
                  </span>
                </div>
                {/* --- UNREAD BADGE --- */}
                {unread > 0 && (
                  <div className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {unread}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <CreateChannelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

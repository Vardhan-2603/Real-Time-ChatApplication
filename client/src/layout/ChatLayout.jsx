import { useEffect } from "react";
import { Outlet } from "react-router";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import socket from "../services/socket";
import { useAuthStore } from "../store/useAuthStore";
import { useMessageStore } from "../store/useMessageStore";

export default function ChatLayout() {
  const currentUser = useAuthStore((state) => state.user);

  const receiveMessage = useMessageStore((state) => state.receiveMessage);
  const markStoreMessagesAsSeen = useMessageStore((state) => state.markStoreMessagesAsSeen);
  const updateMessage = useMessageStore((state) => state.updateMessage);

  // ======================================================
  // MESSAGE SOCKETS
  // ======================================================
  useEffect(() => {
    if (currentUser) {
      socket.emit("setup", currentUser);

      const handleMessageReceived = (newMessage) => {
        receiveMessage(newMessage);
      };

      socket.off("message Received");
      socket.on("message Received", handleMessageReceived);

      const handleMessageEdited = (updatedMessage) => {
        updateMessage(updatedMessage);
      };

      socket.off("message edited");
      socket.on("message edited", handleMessageEdited);

      const handleMessagesSeen = ({ receiverId }) => {
        const { selectedUser: activeChat } = useMessageStore.getState();
        if (activeChat && activeChat._id === receiverId) {
          markStoreMessagesAsSeen();
        }
      };
      
      socket.off("messagesSeen");
      socket.on("messagesSeen", handleMessagesSeen);

      return () => {
        socket.off("message Received", handleMessageReceived);
        socket.off("message edited", handleMessageEdited);
        socket.off("messagesSeen", handleMessagesSeen);
      };
    }
  }, [currentUser, receiveMessage]);

  // ======================================================
  // UI RENDER
  // ======================================================
  return (
    <div className="h-screen flex flex-col bg-[#020617]">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Outlet />
      </div>
    </div>
  );
}
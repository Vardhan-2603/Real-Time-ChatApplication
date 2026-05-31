import { useState, useEffect } from "react";
import socket from "../services/socket";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";

import { getAllUsers, getMessages } from "../services/api.js";

export default function ChatPage({ logout, currentUser }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (currentUser) {
      socket.emit("setup", currentUser); // Use the imported socket
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;
      try {
        const response = await getMessages(selectedUser._id);
        setMessages(response.data.payload);
      } catch (error) {
        console.error("Error fetching messages", error);
      }
    };
    fetchMessages();
  }, [selectedUser]);

  useEffect(() => {
    if (!socket) return;

    socket.on("message Received", (newMessage) => {
      if (
        selectedUser &&
        (newMessage.sender === selectedUser._id ||
          newMessage.receiver === selectedUser._id)
      ) {
        setMessages((prevMessages) => {
          const isDuplicate = prevMessages.some(
            (msg) => msg._id === newMessage._id,
          );

          if (isDuplicate) {
            return prevMessages; // Do nothing if we already have it
          }

          return [...prevMessages, newMessage]; // Otherwise, add it
        });
      }
    });

    return () => socket.off("message Received");
  }, [socket, selectedUser]);

  const handleMessageSent = (newMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar gets the users array and the function to change the active chat */}
      <Sidebar users={users} selectUser={setSelectedUser} logout={logout} />

      <div className="flex-1 bg-slate-100 flex flex-col h-full">
        {selectedUser ? (
          <>
            {/* Header showing who you are talking to */}
            <div className="bg-white p-4 border-b shadow-sm font-bold text-lg">
              Chatting with {selectedUser.name || "User"}
            </div>

            {/* Chat Window gets the messages array */}
            <ChatWindow messages={messages} />

            {/* Input gets the receiver ID and a callback to update UI */}
            <MessageInput
              receiver={selectedUser._id}
              onMessageSent={handleMessageSent}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-xl">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
}

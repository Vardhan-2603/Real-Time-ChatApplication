import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router";
import { useForm } from "react-hook-form";
import { Smile, Paperclip, Send, X, Hash } from "lucide-react";

import {
  sendMessage,
  getMessages,
  getChannelMessages,
  markMessagesAsSeenApi,
} from "../services/api";
import { sendThreadReplyApi } from "../services/messageFeaturesApi";

import { useMessageStore } from "../store/useMessageStore";
import { useAuthStore } from "../store/useAuthStore";
import MessageBubble from "./MessageBubble";
import EmojiPicker from "emoji-picker-react";
import socket from "../services/socket";

export default function ChatArea() {
  const { register, handleSubmit, watch, setValue, reset } = useForm();
  const loc = useLocation();

  const [showPicker, setShowPicker] = useState(false);
  const [file, setFile] = useState(null);

  const pickerRef = useRef(null);
  const chatContainerRef = useRef(null);

  const messageValue = watch("message") || "";
  const selectedUser = loc.state || null;

  const messages = useMessageStore((state) => state.messages);
  const replyingToMessage = useMessageStore((state) => state.replyingToMessage);
  const setReplyingToMessage = useMessageStore((state) => state.setReplyingToMessage);
  const setMessages = useMessageStore((state) => state.setMessages);
  const addMessage = useMessageStore((state) => state.addMessage);
  const addSidebarUser = useMessageStore((state) => state.addSidebarUser);
  const setSelectedUser = useMessageStore((state) => state.setSelectedUser);

  const currentUser = useAuthStore((state) => state.user);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const [isSending, setIsSending] = useState(false);

  // Sync selected user with store and sockets
  useEffect(() => {
    if (!selectedUser) return;
    setSelectedUser(selectedUser);

    if (selectedUser.isChannel) {
      socket.emit("join channel", selectedUser._id);
    }

    return () => {
      setSelectedUser(null);
    };
  }, [selectedUser, setSelectedUser]);

  // =====================================================
  // LOAD CHAT HISTORY
  // =====================================================
  useEffect(() => {
    if (!selectedUser) return;

    const loadChatHistory = async () => {
      try {
        let res;
        if (selectedUser.isChannel) {
          res = await getChannelMessages(selectedUser._id);
        } else {
          res = await getMessages(selectedUser._id);
          if (markMessagesAsSeenApi) {
            await markMessagesAsSeenApi(selectedUser._id).catch((err) =>
              console.log(err)
            );
          }
        }
        setMessages(res.data.payload);
      } catch (err) {
        console.error(err);
      }
    };

    loadChatHistory();
  }, [selectedUser, setMessages]);

  // =====================================================
  // SOCKET LISTENERS (MESSAGES & REACTIONS)
  // =====================================================
  useEffect(() => {
    socket.on("reactionUpdated", (updatedMessage) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === updatedMessage._id ? updatedMessage : msg))
      );
    });

    return () => {
      socket.off("reactionUpdated");
    };
  }, [setMessages]);

  // =====================================================
  // UI LOGIC
  // =====================================================
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target))
        setShowPicker(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =====================================================
  // SEND MESSAGE
  // =====================================================
  const sendMessageHandler = async (data) => {
    if (isSending || (!data.message?.trim() && !file)) return;

    setIsSending(true); 

    try {
      let res;

      if (replyingToMessage) {
        const payload = {
          content: data.message || "",
        };

        if (selectedUser.isChannel) {
          payload.channel = selectedUser._id;
        } else {
          payload.receiver = selectedUser._id;
        }

        res = await sendThreadReplyApi(replyingToMessage._id, payload);
        
      } else {
        const formData = new FormData();
        formData.append("content", data.message || "");
        if (selectedUser.isChannel) formData.append("channel", selectedUser._id);
        else formData.append("receiver", selectedUser._id);
        if (file) formData.append("file", file);

        res = await sendMessage(formData);
      }

      if (res?.data?.payload) {
        const newMessage = res.data.payload;
        if (replyingToMessage) newMessage.parentMessage = replyingToMessage;
        
        addMessage(newMessage);

        if (!selectedUser.isChannel) {
          addSidebarUser(selectedUser);
        }
      }

      reset();
      setFile(null);
      setShowPicker(false);
      setReplyingToMessage(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false); 
    }
  };

  // =====================================================
  // RENDER UI
  // =====================================================
  if (!selectedUser) {
    return (
      <div className="flex-1 bg-[#020617] flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/10 mb-4 animate-bounce">
          💬
        </div>
        <p className="text-slate-400 text-lg font-semibold">Select a chat to start messaging</p>
        <p className="text-slate-600 text-sm mt-1">Choose a channel or user from the sidebar</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#090d1f]/40 w-full relative">
      
      {/* Chat Window Header */}
      <div className="bg-[#090d1f]/65 backdrop-blur-md px-6 py-4 border-b border-white/5 shrink-0 z-20 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          {selectedUser.isChannel ? (
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
              <Hash size={18} />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-sm relative">
              {selectedUser.firstName ? selectedUser.firstName.charAt(0).toUpperCase() : "U"}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#090d1f] online-pulse"></div>
            </div>
          )}
          <div>
            {selectedUser.isChannel ? (
              <>
                <h2 className="text-base font-bold text-white leading-tight">
                  {selectedUser.name}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedUser.members?.length || 0} members
                </p>
              </>
            ) : (
              <>
                <h2 className="text-base font-bold text-white leading-tight">
                  {selectedUser.firstName} {selectedUser.lastName || ""}
                </h2>
                <p className="text-xs text-slate-500 font-medium leading-none mt-0.5">
                  {selectedUser.email}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Messages Pane */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 min-h-0 w-full chat-scroll relative bg-slate-950/20"
      >
        <div className="flex flex-col w-full space-y-4">
          {messages && messages.length > 0 ? (
            messages.map((msg, index) => {
              const msgDate = new Date(msg.createdAt);
              const currentDate = msgDate.toDateString();
              const prevDate =
                index > 0
                  ? new Date(messages[index - 1].createdAt).toDateString()
                  : null;
              const showDate = currentDate !== prevDate;
              const today = new Date();
              const yesterday = new Date();
              yesterday.setDate(today.getDate() - 1);

              let label = currentDate;
              if (currentDate === today.toDateString()) label = "Today";
              else if (currentDate === yesterday.toDateString()) label = "Yesterday";

              return (
                <div key={msg._id} className="w-full">
                  {showDate && (
                    <div className="sticky top-2 z-10 flex justify-center my-6 opacity-90">
                      <div className="bg-[#0f172a]/80 backdrop-blur-md text-slate-400 text-[10px] font-extrabold tracking-wider uppercase px-4 py-1.5 rounded-full shadow-md border border-white/5">
                        {label}
                      </div>
                    </div>
                  )}
                  <MessageBubble message={msg} currentUser={currentUser} />
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500 mt-28">
              <span className="text-4xl mb-2">👋</span>
              <p className="text-sm font-medium">No messages yet. Say hello!</p>
            </div>
          )}
        </div>
      </div>

      {/* Message Input Panel */}
      <div className="p-4 bg-[#090d1f]/65 backdrop-blur-md border-t border-white/5 shrink-0 z-20">
        
        {/* File attachment preview */}
        {file && (
          <div className="text-xs text-blue-400 font-semibold truncate max-w-sm mb-3 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
            <span className="truncate">📎 {file.name}</span>
            <button onClick={() => setFile(null)} className="text-slate-400 hover:text-white ml-2 font-bold">✕</button>
          </div>
        )}

        {/* Replying Thread preview */}
        {replyingToMessage && (
          <div className="mb-3 bg-slate-900/60 rounded-xl p-3 border-l-4 border-blue-500 flex justify-between items-center shadow-lg mx-2 border border-white/5">
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold text-blue-400 mb-0.5">
                Replying to{" "}
                {replyingToMessage.sender?.name ||
                  replyingToMessage.sender?.firstName ||
                  "User"}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {replyingToMessage.content || "Attachment"}
              </p>
            </div>
            <button
              onClick={() => setReplyingToMessage(null)}
              className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors font-bold text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Message input form */}
        <form
          onSubmit={handleSubmit(sendMessageHandler)}
          className="flex items-center gap-3.5"
        >
          {/* Emoji Container */}
          <div className="relative" ref={pickerRef}>
            <button
              type="button"
              onClick={() => setShowPicker(!showPicker)}
              className="w-10 h-10 rounded-xl bg-white/5 text-slate-400 hover:text-white flex items-center justify-center hover:bg-white/10 border border-white/5 transition-all cursor-pointer"
              title="Emoji"
            >
              <Smile size={18} />
            </button>
            {showPicker && (
              <div className="absolute bottom-13 left-0 z-50 shadow-2xl">
                <EmojiPicker
                  theme="dark"
                  onEmojiClick={(emoji) =>
                    setValue("message", messageValue + emoji.emoji)
                  }
                />
              </div>
            )}
          </div>

          {/* File Upload Trigger */}
          <label className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-all">
            <Paperclip size={18} />
            <input type="file" className="hidden" onChange={handleFileChange} />
          </label>

          {/* Input field */}
          <input
            {...register("message")}
            type="text"
            autoComplete="off"
            placeholder={
              replyingToMessage
                ? "Type your thread reply..."
                : "Type a message..."
            }
            className="flex-1 px-4 py-3 rounded-xl text-sm font-medium glass-input"
          />

          {/* Send Button */}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold w-11 h-11 flex items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md shadow-blue-500/10 cursor-pointer"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
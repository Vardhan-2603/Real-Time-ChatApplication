import { useEffect, useState, useRef } from "react";
import { useMessageStore } from "../store/useMessageStore";
import { editMessageApi, getThreadRepliesApi } from "../services/messageFeaturesApi";
import socket from "../services/socket";

export function MessageActions({ isOwnMessage, onEdit, message, onReact }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const setReplyingToMessage = useMessageStore((state) => state.setReplyingToMessage);
  const emojis = ["👍", "❤️", "😂", "😮", "😢"];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div ref={menuRef} className={`relative flex items-center ${showMenu ? "z-[9999]" : "z-10"}`}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="bg-slate-800 text-slate-300 hover:text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md border border-slate-600 focus:outline-none transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M10.5 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clipRule="evenodd" />
        </svg>
      </button>

      {showMenu && (
        <div className="absolute bottom-full right-0 mb-2 z-[9999] bg-slate-900 border border-gray-700 rounded-lg shadow-2xl p-2 min-w-[160px]">
          <div className="flex gap-2 border-b border-gray-700 pb-2 mb-2">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={(e) => {
                  e.stopPropagation();
                  onReact(emoji);
                  setShowMenu(false);
                }}
                className="hover:scale-125 transition text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>

          {isOwnMessage && !message.fileUrl && !message.fileType && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
                setShowMenu(false);
              }}
              className="block w-full text-left text-white text-sm hover:bg-slate-800 px-2 py-1.5 rounded transition-colors"
            >
              ✏️ Edit Message
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setReplyingToMessage(message);
              setShowMenu(false);
            }}
            className="block w-full text-left text-white text-sm hover:bg-slate-800 px-2 py-1.5 rounded transition-colors"
          >
            💬 Thread Reply
          </button>
        </div>
      )}
    </div>
  );
}

export function ThreadReplies({ parentMessage, parentMessageId }) {
  const [replies, setReplies] = useState([]);

  useEffect(() => {
    fetchReplies();

    const handleNewReply = (newMessage) => {
      const incomingParentId = newMessage.parentMessage?._id || newMessage.parentMessage;
      if (incomingParentId === parentMessageId) {
        setReplies((prev) => {
          if (prev.find(reply => reply._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
      }
    };

    socket.on("message Received", handleNewReply);
    return () => {
      socket.off("message Received", handleNewReply);
    };
  }, [parentMessageId]);

  const fetchReplies = async () => {
    try {
      const res = await getThreadRepliesApi(parentMessageId);
      setReplies(res.data.payload || []);
    } catch (err) {
      console.error(err);
    }
  };

  if (replies.length === 0) return null;

  return (
    <div className="mt-2 border-l-2 border-slate-600 pl-3 flex flex-col gap-2">
      {parentMessage && (
        <div className="bg-black/40 rounded-lg p-2 mb-1 opacity-80">
          <p className="text-[10px] text-slate-400 mb-1">
            ↩ Replying to {parentMessage.sender?.firstName || "User"}
          </p>
          {parentMessage.fileType?.startsWith("image") && (
            <img src={parentMessage.fileUrl} alt="original" className="h-12 w-16 object-cover rounded-md" />
          )}
          {parentMessage.content && (
            <p className="text-xs text-slate-300 truncate">{parentMessage.content}</p>
          )}
          {parentMessage.fileUrl && !parentMessage.fileType?.startsWith("image") && (
            <p className="text-xs text-slate-300 truncate">📎 {parentMessage.fileName}</p>
          )}
        </div>
      )}

      {replies.map((reply) => (
        <div key={reply._id} className="bg-black/30 p-2 rounded-lg">
          <p className="text-[10px] text-blue-400 mb-0.5 font-semibold">
            {reply.sender?.firstName} {reply.sender?.lastName || ""}
          </p>
          {reply.fileType?.startsWith("image") && (
            <img src={reply.fileUrl} alt="reply img" className="rounded-lg max-h-32 mb-1 object-cover" />
          )}
          <p className="text-sm text-white">{reply.content}</p>
          <p className="text-[10px] text-slate-500 mt-1">
            {new Date(reply.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            {reply.isEdited && " · edited"}
          </p>
        </div>
      ))}
    </div>
  );
}

export function MessageReactions({ reactions, currentUser, onReact }) {
  if (!reactions || reactions.length === 0) return null;

  return (
    <div className="flex gap-1 flex-wrap mt-1">
      {reactions.map((reaction, index) => {
        const hasReacted = reaction.users?.some(
          (user) => user === currentUser?._id || user?._id === currentUser?._id
        );

        return (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              onReact(reaction.emoji);
            }}
            className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 border transition-colors cursor-pointer ${
              hasReacted
                ? "bg-blue-600/30 border-blue-500 text-blue-200 hover:bg-blue-600/50"
                : "bg-black/40 border-slate-700/50 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <span>{reaction.emoji}</span>
            <span className="font-medium">{reaction.users?.length || 1}</span>
          </button>
        );
      })}
    </div>
  );
}

export function EditMessageModal({ message, onClose, onSuccess }) {
  const [content, setContent] = useState(message.content);

  const handleSave = async () => {
    try {
      const res = await editMessageApi(message._id, { content });
      onSuccess(res.data.payload);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-slate-900 p-5 rounded-xl w-[400px]">
        <h2 className="text-white text-lg mb-4">Edit Message</h2>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3 rounded-lg bg-slate-800 text-white outline-none"
          rows={4}
        />
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="bg-gray-600 px-4 py-2 rounded-lg text-white">Cancel</button>
          <button onClick={handleSave} className="bg-blue-600 px-4 py-2 rounded-lg text-white">Save</button>
        </div>
      </div>
    </div>
  );
}
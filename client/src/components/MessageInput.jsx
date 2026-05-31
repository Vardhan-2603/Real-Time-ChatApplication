import { useState } from "react";
import API from "../services/api";
import { FiSend, FiPaperclip, FiSmile } from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";
import { useMessageStore } from "../store/useMessageStore";

const MessageInput = ({ senderId, receiverId, refreshMessages }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const replyingToMessage = useMessageStore((state) => state.replyingToMessage);
  const setReplyingToMessage = useMessageStore(
    (state) => state.setReplyingToMessage,
  );

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    if (selectedFile.type.startsWith("image")) {
      const imageUrl = URL.createObjectURL(selectedFile);
      setPreview(imageUrl);
    } else {
      setPreview("");
    }
  };

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const detectMessageType = () => {
    if (file) {
      if (file.type.startsWith("image")) return "image";
      if (file.type.startsWith("video")) return "video";
      return "file";
    }
    if (/(https?:\/\/[^\s]+)/g.test(text)) {
      return "link";
    }
    return "text";
  };

  const handleSend = async () => {
    if (!text && !file) return;
    if (loading) return;

    try {
      setLoading(true);
      const clientMessageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const formData = new FormData();

      formData.append("senderId", senderId);
      formData.append("receiverId", receiverId);
      formData.append("content", text);
      formData.append("messageType", detectMessageType());
      formData.append("clientMessageId", clientMessageId);

      if (replyingToMessage) {
        formData.append("parentMessageId", replyingToMessage._id);
      }

      if (file) {
        formData.append("file", file);
        formData.append("fileName", file.name);
        formData.append("fileType", file.type);
        formData.append("fileSize", file.size);
      }

      await API.post("/message-api/send", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setText("");
      setFile(null);
      setPreview("");
      setReplyingToMessage(null); // Close the dock!
      setShowEmojiPicker(false);

      refreshMessages();
    } catch (error) {
      console.log("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative border-t border-slate-700 bg-[#334155] p-3 flex flex-col shrink-0">
      {/* 🚨 THE WHATSAPP DOCK 🚨 */}
      {replyingToMessage && (
        <div className="mb-3 bg-[#1e293b] rounded-lg p-3 border-l-4 border-blue-500 flex justify-between items-center shadow-md mx-1">
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-blue-400 mb-1">
              Replying to{" "}
              {replyingToMessage.sender?.name ||
                replyingToMessage.sender?.firstName ||
                "User"}
            </p>
            <p className="text-sm text-slate-300 truncate">
              {replyingToMessage.content || "Attachment"}
            </p>
          </div>
          <button
            onClick={() => setReplyingToMessage(null)}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700 transition-colors font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* IMAGE PREVIEW */}
      {preview && (
        <div className="mb-3 relative w-fit mx-1">
          <img
            src={preview}
            alt="preview"
            className="w-32 h-32 object-cover rounded-lg border border-slate-600 shadow-lg"
          />
          <button
            onClick={() => {
              setFile(null);
              setPreview("");
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-red-600 shadow-md"
          >
            ✕
          </button>
        </div>
      )}

      {/* FILE PREVIEW (Non-Image) */}
      {file && !preview && (
        <div className="mb-3 mx-1 flex items-center gap-3 bg-[#1e293b] p-3 rounded-lg border border-slate-600 max-w-sm">
          <FiPaperclip className="text-blue-400 text-xl" />
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-slate-200 truncate">
              {file.name}
            </span>
            <span className="text-xs text-slate-400">
              {(file.size / 1024).toFixed(1)} KB
            </span>
          </div>
          <button
            onClick={() => setFile(null)}
            className="ml-auto text-slate-400 hover:text-red-400 p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-3 z-50 shadow-xl rounded-lg">
          <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
        </div>
      )}

      {/* INPUT BAR */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="text-2xl text-slate-300 hover:text-white transition-colors"
        >
          <FiSmile />
        </button>

        <label className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-[#1e293b] hover:bg-slate-700 transition-colors">
          <FiPaperclip className="text-slate-300 text-lg" />
          <input
            type="file"
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.zip"
            onChange={handleFileChange}
          />
        </label>

        <input
          type="text"
          placeholder="Type a message or paste a link..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 bg-[#1e293b] text-white border border-slate-600 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-400"
        />

        <button
          onClick={handleSend}
          disabled={loading}
          className={`px-6 py-3 rounded-xl text-white font-semibold transition-colors flex items-center justify-center shadow-md ${
            loading
              ? "bg-blue-800 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500"
          }`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <FiSend />
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageInput;

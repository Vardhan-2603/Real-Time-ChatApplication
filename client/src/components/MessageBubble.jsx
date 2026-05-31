import { Check, CheckCheck, Download, FileText } from "lucide-react";
import { useState } from "react";
import { useMessageStore } from "../store/useMessageStore";
import { editMessageApi, reactToMessageApi } from "../services/messageFeaturesApi";
import { MessageActions, ThreadReplies, MessageReactions } from "./MessageFeatureComponents";

export default function MessageBubble({ message, currentUser }) {
  const isOwnMessage = message.sender?._id === currentUser?._id;

  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.content || "");

  const updateMessage = useMessageStore((state) => state.updateMessage);

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // 🚨 Replace your handleReact function with this exact code:
  const handleReact = async (emojiString) => {
    try {
      
      const payload = { 
        emoji: emojiString 
      };

      await reactToMessageApi(message._id, payload);
      
    } catch (err) {
      console.error("Failed to react to message:", err);
    }
  };

  const youtubeRegex = /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/\S+/g;
  const youtubeLink = message.content?.match(youtubeRegex)?.[0];
  let youtubeVideoId = null;
  try {
    youtubeVideoId = youtubeLink
      ? youtubeLink.includes("youtu.be")
        ? youtubeLink.split("/").pop().split("?")[0]
        : youtubeLink.includes("/shorts/")
          ? youtubeLink.split("/shorts/")[1].split("?")[0]
          : new URL(youtubeLink).searchParams.get("v")
      : null;
  } catch { youtubeVideoId = null; }

  const isWebsiteLink = message.content?.startsWith("http") && !youtubeVideoId;
  const parentMsg = message.parentMessage || null;

  const StatusIcon = () => {
    if (!isOwnMessage) return null;
    if (message.status === "seen")
      return <CheckCheck size={14} className="text-blue-300 flex-shrink-0" />;
    if (message.status === "delivered")
      return <CheckCheck size={14} className="text-slate-400 flex-shrink-0" />;
    return <Check size={14} className="text-slate-400 flex-shrink-0" />;
  };

  if (message.messageType === "call") {
    return (
      <div className={`flex mb-4 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-[320px] px-4 py-3 rounded-2xl border shadow-md
            ${isOwnMessage
              ? "bg-blue-600 text-white border-blue-500"
              : "bg-slate-800 text-white border-slate-700"
            }`}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="text-lg">
              {message.content?.includes("Video") ? "📹" : "📞"}
            </span>
            <span className="break-words">{message.content}</span>
          </div>
          <div className="mt-2 flex justify-between items-center text-[11px] opacity-70">
            <span>{time}</span>
            {message.callDuration && (
              <span className="font-semibold">Duration: {message.callDuration}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex mb-4 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex items-start gap-2 max-w-[80%]
          ${isOwnMessage ? "flex-row-reverse" : "flex-row"}
        `}
      >
        <div
          className={`px-4 py-3 rounded-2xl shadow-md min-w-[80px]
            ${isOwnMessage ? "bg-blue-600 text-white" : "bg-slate-800 text-white"}
          `}
        >
          {parentMsg && (
            <div className="mb-2 bg-black/30 rounded-lg p-2 border-l-2 border-blue-400">
              <p className="text-[10px] text-blue-300 mb-1 font-semibold">
                ↩ {parentMsg.sender?.firstName || "User"}
              </p>
              {parentMsg.fileType?.startsWith("image") && (
                <img
                  src={parentMsg.fileUrl}
                  alt="quoted"
                  className="h-14 w-20 object-cover rounded-md mb-1"
                />
              )}
              {parentMsg.content && (
                <p className="text-xs text-slate-300 truncate">{parentMsg.content}</p>
              )}
              {parentMsg.fileUrl && !parentMsg.fileType?.startsWith("image") && (
                <p className="text-xs text-slate-300 truncate">
                  📎 {parentMsg.fileName}
                </p>
              )}
            </div>
          )}

          {isEditing ? (
            <div className="flex flex-col gap-2 min-w-[200px]">
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full rounded-lg p-2 text-black outline-none resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => { setEditedText(message.content); setIsEditing(false); }}
                  className="px-3 py-1 bg-gray-500 hover:bg-gray-400 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      const res = await editMessageApi(message._id, { content: editedText });
                      const updated = res.data.payload;
                      updateMessage(updated);
                      setIsEditing(false);
                    } catch (err) { console.log(err); }
                  }}
                  className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded-lg text-sm"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              {message.content && !youtubeVideoId && !isWebsiteLink && !message.fileUrl && (
                <p className="break-words whitespace-pre-wrap">{message.content}</p>
              )}

              {isWebsiteLink && (
                <a href={message.content} target="_blank" rel="noreferrer"
                  className="underline text-blue-300 break-all text-sm">
                  {message.content}
                </a>
              )}

              {youtubeVideoId && (
                <div className="mt-2">
                  <iframe width="100%" height="220"
                    src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                    title="YouTube Video" allowFullScreen
                    className="rounded-xl border-0" />
                  <a href={youtubeLink} target="_blank" rel="noreferrer"
                    className="block mt-2 underline text-blue-300 break-all text-sm">
                    {youtubeLink}
                  </a>
                </div>
              )}

              {message.fileType?.startsWith("image") && (
                <div className="mt-2">
                  <img src={message.fileUrl} alt="img"
                    className="rounded-xl max-h-[300px] w-full object-cover" />
                  <a href={message.fileUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 mt-1 underline text-blue-300 break-all text-xs">
                    <Download size={14} />{message.fileName}
                  </a>
                </div>
              )}

              {message.fileType?.includes("pdf") && (
                <div className="mt-2">
                  <iframe src={message.fileUrl} title="pdf"
                    className="w-full h-[350px] rounded-xl bg-white" />
                  <a href={message.fileUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 mt-1 underline text-blue-300 break-all text-xs">
                    <FileText size={14} />{message.fileName}
                  </a>
                </div>
              )}

              {message.fileUrl &&
                !message.fileType?.startsWith("image") &&
                !message.fileType?.includes("pdf") && (
                <a href={message.fileUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 mt-2 bg-slate-700/50 p-3 rounded-xl hover:bg-slate-700 transition">
                  <FileText size={24} />
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium break-all">{message.fileName}</p>
                    <p className="text-xs opacity-70">
                      {message.fileType?.includes("zip") ? "ZIP Archive"
                        : message.fileType?.includes("word") ? "Word Document"
                        : "File"}
                    </p>
                  </div>
                </a>
              )}

              {message.reactions && message.reactions.length > 0 && (
                <MessageReactions reactions={message.reactions} currentUser={currentUser} onReact={handleReact} />
              )}

              <ThreadReplies
                parentMessageId={message._id}
                parentMessage={message}
              />

              <div className="flex items-center justify-end gap-1 mt-2 text-[11px] opacity-70">
                <span>{time}</span>
                {message.isEdited && (
                  <span className="italic text-[10px]">
                    · edited{" "}
                    {message.editedAt
                      ? new Date(message.editedAt).toLocaleTimeString([], {
                          hour: "2-digit", minute: "2-digit",
                        })
                      : ""}
                  </span>
                )}
                <StatusIcon />
              </div>
            </>
          )}
        </div>

        <div className="mt-2 flex-shrink-0">
          <MessageActions
            isOwnMessage={isOwnMessage}
            message={message}
            onEdit={() => { setEditedText(message.content || ""); setIsEditing(true); }}
            onReact={handleReact}
          />
        </div>
      </div>
    </div>
  );
}
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
      return <CheckCheck size={13} className="text-blue-400 flex-shrink-0" />;
    if (message.status === "delivered")
      return <CheckCheck size={13} className="text-slate-400 flex-shrink-0" />;
    return <Check size={13} className="text-slate-400 flex-shrink-0" />;
  };

  if (message.messageType === "call") {
    return (
      <div className={`flex mb-4 w-full ${isOwnMessage ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-[320px] px-4 py-3 rounded-2xl border shadow-md flex flex-col gap-1.5
            ${isOwnMessage
              ? "bg-[#090d1f]/60 text-slate-100 border-blue-500/20 shadow-blue-500/5"
              : "bg-slate-900/80 text-slate-100 border-white/5"
            }`}
        >
          <div className="flex items-center gap-2.5 text-sm font-semibold">
            <span className="text-base">
              {message.content?.includes("Video") ? "📹" : "📞"}
            </span>
            <span className="break-words">{message.content}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] opacity-60 font-semibold tracking-wide">
            <span>{time}</span>
            {message.callDuration && (
              <span className="bg-white/5 px-2 py-0.5 rounded-full">Duration: {message.callDuration}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex mb-4 w-full ${isOwnMessage ? "justify-end" : "justify-start"} group`}>
      <div
        className={`flex items-start gap-2.5 max-w-[85%] sm:max-w-[70%]
          ${isOwnMessage ? "flex-row-reverse" : "flex-row"}
        `}
      >
        <div
          className={`px-4 py-3 shadow-md min-w-[90px] relative transition-all duration-300
            ${isOwnMessage 
              ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl rounded-tr-none border border-blue-500/10" 
              : "bg-[#0c1226] text-slate-100 rounded-3xl rounded-tl-none border border-white/5"
            }
          `}
        >
          {/* Quoted Message Link */}
          {parentMsg && (
            <div className="mb-2 bg-black/20 rounded-xl p-2.5 border-l-3 border-blue-400 flex flex-col gap-1">
              <p className="text-[10px] text-blue-300 font-bold leading-none">
                ↩ {parentMsg.sender?.firstName || "User"}
              </p>
              {parentMsg.fileType?.startsWith("image") && (
                <img
                  src={parentMsg.fileUrl}
                  alt="quoted img"
                  className="h-14 w-24 object-cover rounded-lg mb-1 shadow-sm"
                />
              )}
              {parentMsg.content && (
                <p className="text-[11px] text-slate-300 truncate leading-relaxed">{parentMsg.content}</p>
              )}
              {parentMsg.fileUrl && !parentMsg.fileType?.startsWith("image") && (
                <p className="text-[11px] text-slate-300 truncate">
                  📎 {parentMsg.fileName}
                </p>
              )}
            </div>
          )}

          {/* Message Text Editing Mode */}
          {isEditing ? (
            <div className="flex flex-col gap-2 min-w-[220px] p-1">
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full rounded-lg p-2.5 text-slate-900 bg-white outline-none resize-none text-sm font-medium border border-slate-300"
                rows={3}
                autoFocus
              />
              <div className="flex justify-end gap-2 text-xs">
                <button
                  onClick={() => { setEditedText(message.content); setIsEditing(false); }}
                  className="px-3 py-1.5 bg-slate-700 text-white hover:bg-slate-600 rounded-lg font-bold cursor-pointer"
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
                  className="px-3 py-1.5 bg-green-600 text-white hover:bg-green-500 rounded-lg font-bold cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Normal text content */}
              {message.content && !youtubeVideoId && !isWebsiteLink && !message.fileUrl && (
                <p className="break-words whitespace-pre-wrap text-[14px] leading-relaxed font-medium">{message.content}</p>
              )}

              {/* Website links */}
              {isWebsiteLink && (
                <a href={message.content} target="_blank" rel="noreferrer"
                  className="underline text-blue-300 hover:text-blue-200 break-all text-sm font-medium transition-colors">
                  {message.content}
                </a>
              )}

              {/* YouTube embeds */}
              {youtubeVideoId && (
                <div className="mt-2 space-y-2">
                  <iframe width="100%" height="200"
                    src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                    title="YouTube Video" allowFullScreen
                    className="rounded-xl border-0 shadow-md" />
                  <a href={youtubeLink} target="_blank" rel="noreferrer"
                    className="block underline text-blue-300 hover:text-blue-200 break-all text-xs font-semibold transition-colors">
                    {youtubeLink}
                  </a>
                </div>
              )}

              {/* Image files */}
              {message.fileType?.startsWith("image") && (
                <div className="mt-2 space-y-1.5">
                  <img src={message.fileUrl} alt="uploaded img"
                    className="rounded-xl max-h-[260px] w-full object-cover shadow-sm hover:scale-[1.01] transition-transform" />
                  <a href={message.fileUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 underline text-blue-300 hover:text-blue-200 break-all text-xs font-semibold transition-colors">
                    <Download size={12} />
                    <span className="truncate">{message.fileName}</span>
                  </a>
                </div>
              )}

              {/* PDF viewer */}
              {message.fileType?.includes("pdf") && (
                <div className="mt-2 space-y-1.5">
                  <iframe src={message.fileUrl} title="pdf file"
                    className="w-full h-[280px] rounded-xl bg-white border border-white/5" />
                  <a href={message.fileUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 underline text-blue-300 hover:text-blue-200 break-all text-xs font-semibold transition-colors">
                    <Download size={12} />
                    <span className="truncate">{message.fileName}</span>
                  </a>
                </div>
              )}

              {/* Generic raw file downloads */}
              {message.fileUrl &&
                !message.fileType?.startsWith("image") &&
                !message.fileType?.includes("pdf") && (
                <a href={message.fileUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 mt-2 bg-slate-900/60 p-3 rounded-xl hover:bg-slate-900/90 transition-all border border-white/5 group-hover:border-white/10">
                  <div className="p-2 bg-blue-600/10 rounded-lg text-blue-400">
                    <FileText size={20} />
                  </div>
                  <div className="overflow-hidden min-w-0">
                    <p className="text-sm font-semibold truncate text-slate-200">{message.fileName}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                      {message.fileType?.includes("zip") ? "ZIP Archive"
                        : message.fileType?.includes("word") ? "Word Doc"
                        : "Download File"}
                    </p>
                  </div>
                </a>
              )}

              {/* Reactions overlay */}
              {message.reactions && message.reactions.length > 0 && (
                <MessageReactions reactions={message.reactions} currentUser={currentUser} onReact={handleReact} />
              )}

              {/* Replies Thread list */}
              <ThreadReplies
                parentMessageId={message._id}
                parentMessage={message}
              />

              {/* Timestamp & Info footer */}
              <div className="flex items-center justify-end gap-1.5 mt-2 text-[10px] opacity-60 font-bold tracking-wide">
                <span>{time}</span>
                {message.isEdited && (
                  <span className="italic text-[9px]">
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

        {/* Floating actions menu */}
        <div className="mt-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
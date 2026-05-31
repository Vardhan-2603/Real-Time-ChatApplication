import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { reactToMessage } from "../services/api";
import { Trash2 } from "lucide-react";

export default function ReactionPopup({ reactions, onClose, messageId }) {
  const [selectedEmoji, setSelectedEmoji] = useState("ALL");
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = currentUser._id;

  const uniqueEmojis = ["ALL", ...new Set(reactions.map((r) => r.emoji))];

  const filteredReactions =
    selectedEmoji === "ALL"
      ? reactions
      : reactions.filter((r) => r.emoji === selectedEmoji);

  const handleRemoveReaction = async (reaction) => {
    try {
      await reactToMessage(messageId, {
        userId: currentUserId,
        emoji: reaction.emoji,
      });
    } catch (err) {
      console.error("Remove reaction failed", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      {/* MODAL */}
      <div className="bg-white w-[350px] rounded-xl shadow-xl p-4">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-lg">Reactions</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            ✖
          </button>
        </div>

        {/* FILTER TABS */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {uniqueEmojis.map((emoji, i) => (
            <button
              key={i}
              onClick={() => setSelectedEmoji(emoji)}
              className={`px-3 py-1 rounded-full text-sm border ${
                selectedEmoji === emoji
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              {emoji === "ALL" ? "All" : emoji}
            </button>
          ))}
        </div>

        {/* LIST */}
        <div className="max-h-[250px] overflow-y-auto flex flex-col gap-2">
          {filteredReactions.map((r, i) => {
            const user = typeof r.userId === "object" ? r.userId : null;
            const id = r.userId?._id;

            return (
              <div
                key={i}
                className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded"
              >
                {/* EMOJI */}
                <span className="text-lg">{r.emoji}</span>

                {/* USER NAME */}
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-medium">
                    {currentUserId === id
                      ? "You"
                      : user?.username ||
                        user?.firstName ||
                        user?.lastName ||
                        "Unknown User"}
                  </span>

                  {/*  ONLY FOR YOU */}
                  {currentUserId === id && (
                    <button
                      onClick={() => handleRemoveReaction(r)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2
                        size={18}
                        className="text-red-500 hover:text-red-700"
                      />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

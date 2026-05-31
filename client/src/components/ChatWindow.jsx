import { useMessageStore } from "../store/useMessageStore";
import { useAuthStore } from "../store/useAuthStore";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

export default function ChatWindow({ selectedUserId, fetchMessages }) {
  const messages = useMessageStore((state) => state.messages);

  const user = useAuthStore((state) => state.user);

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Messages Section */}
      <div className="flex-1 p-4 overflow-y-scroll">
        {messages.map((msg) => (
          <MessageBubble key={msg._id} message={msg} />
        ))}
      </div>

      {/* Message Input Section */}
      <MessageInput
        senderId={user?._id}
        receiverId={selectedUserId}
        refreshMessages={fetchMessages}
      />
    </div>
  );
}

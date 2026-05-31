export function MessageActions({ isOwnMessage, onEdit, message, onReact }) {
  const [showMenu, setShowMenu] = useState(false);

  const setReplyingToMessage = useMessageStore(
    (state) => state.setReplyingToMessage,
  );

  const emojis = ["👍", "❤️", "😂", "😮", "😢"];

  return (
    <div className={`relative flex items-center ${showMenu ? "z-[9999]" : "z-10"}`}>
      
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="bg-black text-white w-7 h-7 rounded-full flex items-center justify-center text-sm hover:bg-gray-800 transition-colors"
      >
        ➜
      </button>

      {showMenu && (
        <div className="absolute bottom-full right-0 mb-2 z-[9999] bg-slate-900 border border-gray-700 rounded-lg shadow-2xl p-2 min-w-[160px]">
          
          <div className="flex gap-2 border-b border-gray-700 pb-2 mb-2">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onReact(emoji);
                  setShowMenu(false);
                }}
                className="hover:scale-125 transition"
              >
                {emoji}
              </button>
            ))}
          </div>

          {isOwnMessage && (
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                onEdit();
                setShowMenu(false);
              }}
              className="block w-full text-left text-white text-sm hover:text-blue-400 mb-2 py-1"
            >
              ✏️ Edit Message
            </button>
          )}

          <button
            onMouseDown={(e) => {
              e.preventDefault();
              setReplyingToMessage(message);
              setShowMenu(false);
            }}
            className="block w-full text-left text-white text-sm hover:text-green-400 py-1"
          >
            💬 Thread Reply
          </button>
        </div>
      )}
    </div>
  );
}
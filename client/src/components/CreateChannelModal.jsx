import { useState, useEffect } from "react";
import { createChannel, getAllUsers } from "../services/api";
import { useMessageStore } from "../store/useMessageStore";
import { X, Hash, UserPlus } from "lucide-react";

export default function CreateChannelModal({ isOpen, onClose }) {
  const [name, setName] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const loadChannels = useMessageStore((state) => state.loadChannels);

  useEffect(() => {
    if (isOpen) {
      getAllUsers()
        .then((res) => {
          setAvailableUsers(res.data.payload || res.data);
        })
        .catch((err) => console.log(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleUser = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) return;

    try {
      await createChannel({
        name,
        members: selectedMembers,
      });

      loadChannels();

      setName("");
      setSelectedMembers([]);
      onClose();
    } catch (error) {
      console.error("Error creating channel:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020617]/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-up">
      <div className="bg-[#090d1f]/95 border border-white/10 rounded-3xl p-6 w-[420px] max-w-[90%] shadow-2xl text-slate-100 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-6">
          <div className="flex items-center gap-2">
            <UserPlus className="text-blue-400 w-5 h-5" />
            <h2 className="text-lg font-bold">Create New Channel</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Input Name */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Channel Name</label>
            <div className="relative flex items-center">
              <Hash className="absolute left-4 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="e.g. general, announcements"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl outline-none glass-input text-sm font-semibold"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Select Members */}
        <div className="flex-1 flex flex-col min-h-0 mb-6">
          <p className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
            Select Members
          </p>
          <div className="flex-1 overflow-y-auto border border-white/5 rounded-2xl p-3 bg-slate-950/20 custom-scrollbar space-y-2">
            {availableUsers.length === 0 ? (
              <p className="text-slate-600 text-xs italic text-center py-6">No users available</p>
            ) : (
              availableUsers.map((user) => (
                <div 
                  key={user._id} 
                  className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
                    selectedMembers.includes(user._id) 
                      ? "bg-blue-600/10 border border-blue-500/20" 
                      : "border border-transparent hover:bg-white/5"
                  }`}
                >
                  <input
                    type="checkbox"
                    id={`user-${user._id}`}
                    checked={selectedMembers.includes(user._id)}
                    onChange={() => toggleUser(user._id)}
                    className="w-4 h-4 rounded border-white/10 text-blue-600 focus:ring-0 focus:ring-offset-0 bg-slate-800 cursor-pointer"
                  />
                  <label
                    htmlFor={`user-${user._id}`}
                    className="cursor-pointer text-xs font-semibold text-slate-200 flex-1 min-w-0"
                  >
                    <p className="truncate">{user.firstName} {user.lastName || ""}</p>
                    <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{user.email}</p>
                  </label>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/5 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer border border-white/5"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-500/10 cursor-pointer"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

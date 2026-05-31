import { useState, useEffect } from "react";
import { createChannel, getAllUsers } from "../services/api";
import { useMessageStore } from "../store/useMessageStore";

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-[90%] text-gray-800">
        <h2 className="text-xl font-bold mb-4">Create New Channel</h2>

        <input
          type="text"
          placeholder="Channel Name (e.g. Updates)"
          className="w-full border p-2 rounded mb-4 focus:outline-none focus:border-blue-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <p className="font-semibold mb-2 text-sm text-gray-600">
          Select Members:
        </p>
        <div className="max-h-48 overflow-y-auto mb-4 border rounded p-2 custom-scrollbar">
          {availableUsers.map((user) => (
            <div key={user._id} className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id={`user-${user._id}`}
                checked={selectedMembers.includes(user._id)}
                onChange={() => toggleUser(user._id)}
                className="cursor-pointer"
              />
              <label
                htmlFor={`user-${user._id}`}
                className="cursor-pointer text-sm"
              >
                {user.firstName} {user.lastName || ""} ({user.email})
              </label>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

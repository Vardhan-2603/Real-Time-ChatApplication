import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import profileDefault from "../assets/profile.png";
import { ArrowLeft, Plus } from "lucide-react";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    connections: 0,
    channels: 0,
    messages: 0,
    memberSince: "",
  });

  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const statsRes = await api.get("/user-api/profile-stats");
        setStats(statsRes.data.payload);

        const notesRes = await api.get("/user-api/get-notes");
        setNotes(notesRes.data.payload || []);
      } catch (err) {
        console.log(err);
      }
    };

    loadData();
  }, []);

  const addNote = async () => {
    if (!newNote.trim()) return;

    try {
      const res = await api.post("/user-api/add-note", {
        text: newNote,
      });

      setNotes(res.data.payload);
      setNewNote("");
    } catch (err) {
      console.log(err);
    }
  };

  const deleteNote = async (index) => {
    try {
      const res = await api.delete(`/user-api/delete-note/${index}`);
      setNotes(res.data.payload);
    } catch (err) {
      console.log(err);
    }
  };

  const updateImage = async () => {
    if (!imageUrl) return;

    try {
      const res = await api.post("/user-api/update-profile-pic", {
        profilePic: imageUrl,
      });

      setUser(res.data.payload);
      setShowInput(false);
      setImageUrl("");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex h-[100vh] bg-[#020617] text-white">
      {/* LEFT SIDEBAR */}
      <div className="w-[260px] bg-slate-900 flex flex-col items-center p-6 border-r border-blue-900">
        {/* PROFILE IMAGE */}
        <div className="relative">
          <img
            src={user?.profilePic || profileDefault}
            className="w-24 h-24 rounded-full object-cover"
          />

          <div
            onClick={() => setShowInput(!showInput)}
            className="absolute bottom-0 right-0 bg-blue-600 p-1 rounded-full cursor-pointer hover:bg-blue-700"
          >
            <Plus size={14} />
          </div>
        </div>

        {/* IMAGE INPUT */}
        {showInput && (
          <div className="mt-3 w-full">
            <input
              placeholder="Enter image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full p-2 rounded bg-slate-800 text-sm"
            />
            <button
              onClick={updateImage}
              className="mt-2 w-full bg-blue-600 p-2 rounded cursor-pointer hover:bg-blue-700"
            >
              Update
            </button>
          </div>
        )}

        <h2 className="text-lg font-semibold mt-4">{user?.firstName}</h2>

        <p className="text-sm text-gray-400">{user?.email}</p>

        <p className="mt-4 text-blue-400">Connections: {stats.connections}</p>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8 relative">
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 cursor-pointer"
        >
          <ArrowLeft size={24} />
        </button>

        <h1 className="text-2xl font-bold mb-10 text-center">
          Profile Dashboard
        </h1>

        {/* STATS */}
        <div className="flex justify-center gap-10 mb-10">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full border-4 border-blue-500 flex items-center justify-center text-xl">
              {stats.channels}
            </div>
            <p className="mt-2 text-gray-400">Channels</p>
          </div>

          <div className="text-center">
            <div className="w-24 h-24 rounded-full border-4 border-green-500 flex items-center justify-center text-xl">
              {stats.messages}
            </div>
            <p className="mt-2 text-gray-400">Messages</p>
          </div>
        </div>

        {/* MEMBER SINCE */}
        <div className="bg-slate-800 p-5 rounded mb-6 text-center">
          Member Since:{" "}
          <span className="text-blue-400">
            {stats.memberSince
              ? new Date(stats.memberSince).toDateString()
              : "Loading..."}
          </span>
        </div>

        {/* NOTES SECTION */}
        <div className="bg-slate-800 p-6 rounded">
          <h2 className="mb-4 text-lg font-semibold">Personal Notes</h2>

          {/* INPUT */}
          <div className="flex gap-2 mb-4">
            <input
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write a note..."
              className="flex-1 p-3 rounded bg-slate-900"
            />

            <button
              onClick={addNote}
              className="bg-blue-600 px-4 rounded cursor-pointer hover:bg-blue-700"
            >
              Save
            </button>
          </div>

          {/* NOTES LIST */}
          <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
            {notes.length === 0 ? (
              <p className="text-gray-400 text-sm">No notes yet</p>
            ) : (
              notes.map((note, index) => (
                <div
                  key={index}
                  className="bg-slate-900 p-3 rounded flex justify-between items-start"
                >
                  <div>
                    <p className="text-sm font-semibold text-blue-400">
                      Note {index + 1}
                    </p>
                    <p className="text-white text-sm">{note.text}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteNote(index)}
                    className="text-red-400 text-xs cursor-pointer hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

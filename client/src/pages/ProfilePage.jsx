import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import profileDefault from "../assets/profile.png";
import { ArrowLeft, Plus, Users, Hash, MessageSquare, Trash2, Calendar, Save } from "lucide-react";

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

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      const res = await api.post("/user-api/update-profile-pic", formData);
      setUser(res.data.payload);
    } catch (err) {
      console.error(err);
      alert("Failed to upload profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 overflow-hidden relative">
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute w-[400px] h-[400px] bg-blue-600 opacity-20 blur-[130px] rounded-full top-20 left-10 pointer-events-none"></div>
      <div className="absolute w-[400px] h-[400px] bg-purple-700 opacity-15 blur-[130px] rounded-full bottom-20 right-10 pointer-events-none"></div>

      {/* LEFT SIDEBAR PANEL */}
      <div className="w-[280px] bg-[#060a1a] flex flex-col items-center p-8 border-r border-white/5 shrink-0 z-10">
        
        {/* Profile Image with Ring border */}
        <div className="relative mb-6 group cursor-pointer">
          <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/10 group-hover:shadow-blue-500/30 transition-all duration-300">
            <img
              src={user?.profilePic || profileDefault}
              className="w-full h-full rounded-full object-cover border-2 border-[#060a1a]"
              alt="avatar"
            />
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-500 p-2 rounded-full cursor-pointer shadow-md text-white transition-all hover:scale-105 active:scale-95"
            title="Update Avatar"
          >
            <Plus size={14} />
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />

        {isUploading && (
          <p className="text-xs text-blue-400 font-bold animate-pulse mt-2 mb-4">
            Uploading image...
          </p>
        )}

        <h2 className="text-xl font-extrabold text-white mt-4 tracking-tight">{user?.firstName} {user?.lastName || ""}</h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">{user?.email}</p>

        <div className="w-full border-t border-white/5 my-6"></div>

        {/* Connection Details */}
        <div className="flex items-center gap-3 bg-blue-600/10 text-blue-400 border border-blue-500/10 px-5 py-3 rounded-2xl w-full">
          <Users size={18} />
          <div>
            <p className="text-xs text-slate-400 leading-none">Connections</p>
            <p className="text-lg font-extrabold leading-none mt-1">{stats.connections}</p>
          </div>
        </div>
      </div>

      {/* MAIN DASHBOARD CONTENT */}
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative z-10 flex flex-col max-w-[800px] mx-auto w-full">
        
        {/* Header toolbar */}
        <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-8 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white border border-white/5 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            title="Go Back"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-xl font-extrabold text-white tracking-wider uppercase bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">
            Profile Dashboard
          </h1>
          <div className="w-10 h-10"></div> {/* Spacer */}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8 shrink-0">
          <div className="glass-panel p-6 rounded-3xl text-center shadow-md flex flex-col items-center relative overflow-hidden group">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <Hash size={24} />
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Joined Channels</p>
            <p className="text-3xl font-extrabold text-white mt-1.5">{stats.channels}</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl text-center shadow-md flex flex-col items-center relative overflow-hidden group">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <MessageSquare size={24} />
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Messages Sent</p>
            <p className="text-3xl font-extrabold text-white mt-1.5">{stats.messages}</p>
          </div>
        </div>

        {/* Member since banner */}
        <div className="glass-panel px-6 py-4 rounded-2xl mb-8 flex items-center justify-between shadow-sm shrink-0 border border-white/5">
          <div className="flex items-center gap-3 text-slate-300 text-sm font-semibold">
            <Calendar className="text-blue-400 w-5 h-5" />
            <span>Member Since</span>
          </div>
          <span className="text-blue-400 font-bold text-sm bg-blue-600/10 border border-blue-500/15 px-3 py-1 rounded-full">
            {stats.memberSince
              ? new Date(stats.memberSince).toDateString()
              : "Loading..."}
          </span>
        </div>

        {/* Personal Notes Manager */}
        <div className="glass-panel p-6 rounded-3xl flex-1 flex flex-col min-h-[350px] shadow-lg">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-300">Personal Notepad</h2>

          {/* Notes Input */}
          <div className="flex gap-3 mb-6 shrink-0">
            <input
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write a personal note..."
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium glass-input"
            />
            <button
              onClick={addNote}
              className="bg-blue-600 hover:bg-blue-500 px-5 rounded-xl font-bold text-sm flex items-center gap-2 transition shadow-md shadow-blue-500/10 cursor-pointer"
            >
              <Save size={16} />
              Save
            </button>
          </div>

          {/* Notes Scroller */}
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
            {notes.length === 0 ? (
              <p className="text-slate-600 text-xs italic text-center py-10">No notes yet. Type above and click save!</p>
            ) : (
              notes.map((note, index) => (
                <div
                  key={index}
                  className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-start hover:border-white/10 transition-colors shadow-sm animate-fade-in-up"
                >
                  <div className="space-y-1 pr-4 min-w-0">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                      Note #{index + 1}
                    </p>
                    <p className="text-slate-200 text-sm font-semibold leading-relaxed break-words">{note.text}</p>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteNote(index)}
                    className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/10 transition-all cursor-pointer flex-shrink-0"
                    title="Delete Note"
                  >
                    <Trash2 size={14} />
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

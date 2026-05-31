import { useEffect, useState } from "react";
import { getChannelMembersApi } from "../services/api";

export default function ChannelMembersModal({ channel, onClose }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await getChannelMembersApi(channel._id);
        setMembers(res.data.payload || []);
      } catch (err) {
        console.error("Failed to load members", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [channel._id]);

  return (
    <div className="fixed inset-0 bg-[#020617]/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in-up">
      <div className="bg-[#1e293b] border border-slate-700 w-[400px] max-h-[80vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-white"># {channel.name}</h2>
            <p className="text-sm text-slate-400">{members.length} Members</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors font-bold"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full"></div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {members.map((member) => {
                const initials = member.firstName ? member.firstName.charAt(0).toUpperCase() : "U";
                return (
                  <div key={member._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/50 transition-colors cursor-default">
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                      {initials}
                    </div>
                    <div>
                      <p className="text-slate-200 font-semibold">
                        {member.firstName} {member.lastName || ""}
                      </p>
                      <p className="text-xs text-slate-500">{member.email}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
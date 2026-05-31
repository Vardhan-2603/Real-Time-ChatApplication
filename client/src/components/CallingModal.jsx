import { useEffect } from "react";
import socket from "../services/socket";
import { addIceCandidateToPeer } from "../services/webrtc";

export default function CallingModal({ receiver, onCancel, type }) {
  const initials = receiver?.firstName 
    ? receiver.firstName.charAt(0).toUpperCase() 
    : "U";

  useEffect(() => {
    const handleIceCandidate = async ({ candidate }) => {
      try {
        await addIceCandidateToPeer(candidate);
      } catch (err) {
        console.error(err);
      }
    };
    
    socket.on("ice-candidate", handleIceCandidate);
    
    return () => {
      socket.off("ice-candidate", handleIceCandidate);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#020617]/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in-up">
      <div className="bg-[#1e293b] border border-slate-700 w-[320px] p-8 rounded-3xl text-center shadow-2xl flex flex-col items-center">
        
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
          <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center text-3xl text-slate-300 font-bold border-4 border-slate-600 relative z-10 shadow-lg">
            {initials}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">Calling...</h2>
        <p className="text-slate-400 font-medium mb-6">
          {receiver?.firstName} {receiver?.lastName || ""}
        </p>

        <div className="bg-slate-800/50 border border-slate-700/50 px-4 py-2 rounded-full text-slate-300 text-sm mb-8 flex items-center gap-2">
          {type === "video" ? "📹 Video Call" : "📞 Audio Call"}
        </div>

        <button
          onClick={onCancel}
          className="bg-red-500 hover:bg-red-600 text-white font-bold w-16 h-16 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-red-500/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path fillRule="evenodd" d="M5.25 5.5a.75.75 0 011.06 0l12 12a.75.75 0 11-1.06 1.06l-12-12a.75.75 0 010-1.06z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M18.31 5.5a.75.75 0 010 1.06l-12 12a.75.75 0 11-1.06-1.06l12-12a.75.75 0 011.06 0z" clipRule="evenodd" />
          </svg>
        </button>
          
      </div>
    </div>
  );
}
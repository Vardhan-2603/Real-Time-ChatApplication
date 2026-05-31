import { useEffect, useRef } from "react";

export default function VideoCallModal({
  localStream,
  remoteStream,
  onEndCall,
}) {

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const remoteAudioRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }

    // IMPORTANT FOR AUDIO CALLS
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }

  }, [remoteStream]);

  useEffect(() => {
    return () => {

      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }

      if (remoteStream) {
        remoteStream.getTracks().forEach((track) => track.stop());
      }

    };
  }, [localStream, remoteStream]);

  return (
    <div className="fixed inset-0 z-50 bg-[#020617] flex flex-col items-center justify-center animate-fade-in-up">

      {/* REMOTE AUDIO */}
      <audio
        ref={remoteAudioRef}
        autoPlay
      />

      {/* REMOTE VIDEO */}
      <div className="absolute inset-0 bg-slate-900">

        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">

            <div className="animate-spin w-10 h-10 border-4 border-slate-600 border-t-blue-500 rounded-full mb-4"></div>

            <p className="font-medium animate-pulse">
              Connecting...
            </p>

          </div>
        )}

      </div>

      {/* LOCAL VIDEO */}
      <div className="absolute top-6 right-6 w-32 md:w-48 aspect-[3/4] bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700 z-10">

        {localStream ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm bg-slate-800">
            No Camera
          </div>
        )}

      </div>

      {/* CONTROLS */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex items-center gap-6 bg-slate-900/60 backdrop-blur-md px-8 py-4 rounded-full border border-slate-700/50 z-10 shadow-2xl">

        <div className="text-slate-300 font-medium text-sm mr-4 flex items-center gap-2">

          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>

          Live

        </div>

        <button
          onClick={onEndCall}
          className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-red-500/20 flex items-center justify-center group"
        >

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-7 h-7 group-hover:rotate-[135deg] transition-transform duration-300"
          >

            <path
              fillRule="evenodd"
              d="M5.25 5.5a.75.75 0 011.06 0l12 12a.75.75 0 11-1.06 1.06l-12-12a.75.75 0 010-1.06z"
              clipRule="evenodd"
            />

            <path
              fillRule="evenodd"
              d="M18.31 5.5a.75.75 0 010 1.06l-12 12a.75.75 0 11-1.06-1.06l12-12a.75.75 0 011.06 0z"
              clipRule="evenodd"
            />

          </svg>

        </button>

      </div>

    </div>
  );
}
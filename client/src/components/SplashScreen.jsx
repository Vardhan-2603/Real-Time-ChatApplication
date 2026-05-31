import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

export default function SplashScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#020617] relative overflow-hidden">
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute w-[500px] h-[500px] bg-blue-600 opacity-20 blur-[160px] rounded-full -top-40 -left-40 pointer-events-none animate-pulse"></div>
      <div className="absolute w-[600px] h-[600px] bg-purple-700 opacity-15 blur-[180px] rounded-full -bottom-40 -right-40 pointer-events-none"></div>
      <div className="absolute w-[400px] h-[400px] bg-indigo-500 opacity-10 blur-[130px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      {/* Floating Sparkles in the background */}
      <div className="sparkle sparkle1"></div>
      <div className="sparkle sparkle2"></div>
      <div className="sparkle sparkle3"></div>
      <div className="sparkle sparkle4"></div>

      {/* Main Glassmorphic Container Card */}
      <div className="z-10 w-[90%] max-w-[650px] p-10 md:p-14 rounded-3xl glass-panel text-center shadow-2xl flex flex-col items-center border border-white/10 animate-fade-in-up">
        
        {/* Logo with 3D Ring Glow */}
        <div className="circle-container mb-8">
          <img src={logo} alt="Chat Application Logo" className="logo-image" />
        </div>

        {/* Tagline */}
        <h1 className="text-center mb-6 leading-tight">
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            Chat Application
          </span>
          <span className="block text-slate-300 text-lg md:text-xl mt-4 font-medium px-4 leading-relaxed">
            Ignite conversations, connect instantly, and watch your collaboration flow in real time.
          </span>
        </h1>

        <p className="text-slate-400 text-sm max-w-md mb-10">
          A secure, fast, and feature-rich real-time messaging workspace built with WebRTC calling, channels, and AI analytics.
        </p>

        {/* Get Started Button */}
        <button
          onClick={() => navigate("/login")}
          className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-lg font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 cursor-pointer"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

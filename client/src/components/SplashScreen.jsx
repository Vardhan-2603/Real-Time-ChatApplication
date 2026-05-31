import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

export default function SplashScreen() {
  const navigate = useNavigate();

  const goToPage = () => {
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#020617] relative overflow-hidden">
      {/* smooth white curved section */}
      <div className="absolute bottom-0 w-full overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          className="block w-full h-[240px]"
        >
          <path
            fill="#ffffff"
            d="M0,160 C360,260 1080,60 1440,160 L1440,320 L0,320 Z"
          />
        </svg>
      </div>

      {/* glowing background */}
      <div className="absolute w-[500px] h-[500px] bg-blue-700 opacity-20 blur-[150px] rounded-full pointer-events-none"></div>

      {/* tagline */}

      <p className="text-center mb-8 z-10 px-6 leading-relaxed">
        <span className="text-blue-400 text-5xl font-extrabold tracking-wide drop-shadow-[0_0_12px_#3b82f6] transition-transform duration-300 hover:scale-125 cursor-pointer">
          Spark
        </span>

        <span className="text-white text-xl ml-3 font-semibold">
          – unleash chaos, ignite conversations, and watch the universe of ideas
          collide in real time.
        </span>
      </p>

      {/* logo container */}

      <div className="circle-container mb-10 z-10">
        <img src={logo} alt="logo" className="logo-image" />
      </div>

      {/* button */}

      <button
        onClick={goToPage}
        className="px-8 py-3 bg-white text-black rounded-lg text-lg font-semibold 
transition-all duration-300 cursor-pointer
hover:bg-[#020617] hover:text-white hover:scale-110 hover:shadow-[0_0_25px_#3b82f6] z-10"
      >
        Get Started
      </button>
    </div>
  );
}

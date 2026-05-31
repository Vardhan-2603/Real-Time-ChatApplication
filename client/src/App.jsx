import { createBrowserRouter, RouterProvider } from "react-router";
import { useEffect } from "react";

import ChatWorkspace from "./pages/ChatWorkspace";
import SplashScreen from "./components/SplashScreen";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ChatArea from "./components/ChatArea";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./utils/protectedRoute";
import GuestRoute from "./utils/GuestRoute";
import DashboardPage from "./pages/DashboardPage";
import { useAuthStore } from "./store/useAuthStore";
import logo from "./assets/logo.png";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <GuestRoute>
        <SplashScreen />
      </GuestRoute>
    )
  },
  {
    path: "/login",
    element: (
      <GuestRoute>
        <Login />
      </GuestRoute>
    )
  },
  {
    path: "/signup",
    element: (
      <GuestRoute>
        <Signup />
      </GuestRoute>
    )
  },
  {
    path: "/chat",
    //  CRITICAL SECURITY: Kept the ProtectedRoute wrapper from Code 1
    element: (
      <ProtectedRoute>
        <ChatWorkspace />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        //  POLISHED: Matched the Dark Mode theme of your ChatArea
        element: (
          <div className="flex-1 bg-[#020617] flex items-center justify-center">
            <p className="text-slate-500 text-lg">Select a chat to start messaging</p>
          </div>
        )
      },
      {
        path: ":userId",
        element: <ChatArea />
      },
      {
        path: "dashboard",
        element: <DashboardPage />
      }
    ]
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    )
  }
]);

function AuthLoading() {
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
        <span className="text-blue-400 text-5xl font-extrabold tracking-wide drop-shadow-[0_0_12px_#3b82f6] transition-transform duration-300 hover:scale-110 cursor-pointer">
          Chat Application
        </span>
        <span className="text-white text-xl ml-3 font-semibold">
          – ignite conversations, connect instantly, and collaborate in real time.
        </span>
      </p>

      {/* logo container */}
      <div className="circle-container mb-10 z-10">
        <img src={logo} alt="logo" className="logo-image" />
      </div>

      {/* Loading Indicator */}
      <div className="flex items-center gap-3 z-10 px-6">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        <span className="text-slate-400 font-medium">Checking authentication...</span>
      </div>
    </div>
  );
}

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return <AuthLoading />;
  }

  return (
    <RouterProvider router={router} />
  );
}

export default App;
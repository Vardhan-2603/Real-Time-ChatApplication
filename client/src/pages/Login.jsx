import { useForm } from "react-hook-form";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import bg from "../assets/bg1.png";
import logo from "../assets/logo.png";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    const success = await login(data);
    if (success) {
      navigate("/chat");
    }
  };

  return (
    <div
      className="min-h-screen bg-[#020617] bg-cover bg-center flex flex-col relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(2, 6, 23, 0.9) 0%, rgba(2, 6, 23, 0.95) 100%), url(${bg})`,
      }}
    >
      {/* Background Glowing Ambient Lights */}
      <div className="absolute w-[400px] h-[400px] bg-blue-600 opacity-20 blur-[130px] rounded-full top-20 left-10 pointer-events-none"></div>
      <div className="absolute w-[400px] h-[400px] bg-purple-700 opacity-15 blur-[130px] rounded-full bottom-20 right-10 pointer-events-none"></div>

      {/* NAVBAR */}
      <div className="flex items-center p-6 z-10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <img
            src={logo}
            className="w-10 h-10 rounded-full border border-white/20 shadow-lg"
            alt="logo"
          />
          <span className="text-white font-semibold text-lg tracking-wide">Chat Application</span>
        </div>
      </div>

      {/* LOGIN CARD */}
      <div className="flex flex-1 justify-center items-center p-6 z-10">
        <div className="glass-panel-heavy p-8 md:p-10 rounded-3xl w-full max-w-[420px] shadow-2xl animate-fade-in-up">
          <h2 className="text-white text-3xl font-extrabold mb-2 text-center tracking-tight">
            Welcome Back
          </h2>
          <p className="text-slate-400 text-sm text-center mb-8">
            Log in to continue to your workspace
          </p>

          {error && (
            <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* EMAIL */}
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  autoFocus
                  className="w-full pl-12 pr-4 py-3 rounded-xl outline-none text-white glass-input placeholder-slate-500 text-sm font-medium"
                  {...register("email", {
                    required: "Enter Email Address",
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5 font-medium pl-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3 rounded-xl outline-none text-white glass-input placeholder-slate-500 text-sm font-medium"
                  {...register("password", {
                    required: "Enter Password",
                  })}
                />
                <div
                  className="absolute right-4 cursor-pointer text-slate-400 hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5 font-medium pl-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* LOGIN BUTTON */}
            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] cursor-pointer mt-2 text-sm tracking-wide"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>


          {/* SIGNUP LINK */}
          <p className="text-center text-slate-400 mt-8 text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-400 font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

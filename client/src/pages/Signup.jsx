import { useForm } from "react-hook-form";
import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import bg from "../assets/bg1.png";
import logo from "../assets/logo.png";
import { Eye, EyeOff, Lock, Mail, User, Image, AlignLeft } from "lucide-react";

export default function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError("");
    try {
      await api.post("/user-api/register", {
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        email: data.email,
        password: data.password,
        profilePic: data.profilePic,
        tagLine: data.tagline,
      });
      navigate("/login");
    } catch (err) {
      if (err.response?.data?.error) {
        setServerError(err.response.data.error);
      } else {
        setServerError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-[#020617] bg-cover bg-center flex flex-col relative overflow-hidden"
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

      {/* SIGNUP CARD */}
      <div className="flex flex-1 justify-center items-center p-6 z-10 my-8">
        <div className="glass-panel-heavy p-8 md:p-10 rounded-3xl w-full max-w-[500px] shadow-2xl animate-fade-in-up">
          <h2 className="text-white text-3xl font-extrabold mb-2 text-center tracking-tight">
            Create Account
          </h2>
          <p className="text-slate-400 text-sm text-center mb-8">
            Ignite your experience by registering below
          </p>

          {serverError && (
            <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm text-center font-medium">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* NAME GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">First Name</label>
                <div className="relative flex items-center">
                  <User className="absolute left-4 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="First Name"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl outline-none text-white glass-input placeholder-slate-500 text-sm font-medium"
                    {...register("firstName", { required: "Enter First Name" })}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium pl-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">Last Name (optional)</label>
                <div className="relative flex items-center">
                  <User className="absolute left-4 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Last Name (optional)"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl outline-none text-white glass-input placeholder-slate-500 text-sm font-medium"
                    {...register("lastName")}
                  />
                </div>
              </div>
            </div>

            {/* USERNAME */}
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">Username</label>
              <div className="relative flex items-center">
                <User className="absolute left-4 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Choose username (optional)"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl outline-none text-white glass-input placeholder-slate-500 text-sm font-medium"
                  {...register("username", {
                    pattern: {
                      value: /^[a-zA-Z][a-zA-Z0-9_]*$/,
                      message: "Must start with a letter and contain only alphanumeric/underscores",
                    },
                    validate: async (value) => {
                      if (!value) return true;
                      try {
                        const res = await api.get(
                          `/user-api/check-username?username=${value}`,
                        );
                        return res.data.available || res.data.message;
                      } catch (e) {
                        return "Error checking username";
                      }
                    },
                  })}
                />
              </div>
              {errors.username && (
                <p className="text-red-400 text-xs mt-1.5 font-medium pl-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 text-slate-400 w-4 h-4" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl outline-none text-white glass-input placeholder-slate-500 text-sm font-medium"
                  {...register("email", {
                    required: "Enter Email Address",
                    pattern: {
                      value: /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Invalid email format (local part must start with a letter)",
                    },
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
                <Lock className="absolute left-4 text-slate-400 w-4 h-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Choose password"
                  className="w-full pl-11 pr-11 py-2.5 rounded-xl outline-none text-white glass-input placeholder-slate-500 text-sm font-medium"
                  {...register("password", { required: "Enter Password" })}
                />
                <div
                  className="absolute right-4 cursor-pointer text-slate-400 hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </div>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5 font-medium pl-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* PROFILE PIC */}
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">Profile Pic URL</label>
              <div className="relative flex items-center">
                <Image className="absolute left-4 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="https://example.com/avatar.png (optional)"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl outline-none text-white glass-input placeholder-slate-500 text-sm font-medium"
                  {...register("profilePic")}
                />
              </div>
            </div>

            {/* TAGLINE */}
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">Status Tagline</label>
              <div className="relative flex items-center">
                <AlignLeft className="absolute left-4 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Hey there! I am using Chat Application... (optional)"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl outline-none text-white glass-input placeholder-slate-500 text-sm font-medium"
                  {...register("tagline")}
                />
              </div>
            </div>

            {/* SIGNUP BUTTON */}
            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] cursor-pointer mt-4 text-sm tracking-wide"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          {/* LOGIN LINK */}
          <p className="text-center text-slate-400 mt-6 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 font-semibold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

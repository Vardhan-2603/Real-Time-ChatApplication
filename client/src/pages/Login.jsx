import { useForm } from "react-hook-form";
import api from "../services/api";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

import bg from "../assets/bg1.png";
import logo from "../assets/logo.png";

import { Eye, EyeOff } from "lucide-react";

import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";

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

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);

      const user = result.user;

      const success = await useAuthStore.getState().googleLogin({
        firstName: user.displayName?.split(" ")[0] || "",

        lastName: user.displayName?.split(" ")[1] || "",

        email: user.email,

        profilePic: user.photoURL,

        googleId: user.uid,
      });

      if (success) {
        navigate("/chat");
      }
    } catch (error) {
      console.log("Google Login Error:", error);

      alert("Google Login Failed");
    }
  };

  return (
    <div
      className="h-screen bg-cover bg-center flex flex-col"
      style={{
        backgroundImage: `url(${bg})`,
      }}
    >
      {/* NAVBAR */}

      <div className="flex items-center p-5">
        <img
          src={logo}
          className="w-12 h-12 rounded-full border border-white"
          alt="logo"
        />
      </div>

      {/* LOGIN SECTION */}

      <div className="flex flex-1 justify-center items-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white/20 backdrop-blur-lg p-10 rounded-2xl w-105 shadow-xl border border-white/30"
        >
          <h2 className="text-white text-2xl font-semibold mb-6 text-center">
            Login
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-100 text-sm text-center">
              {error}
            </div>
          )}

          {/* EMAIL */}

          <div className="mb-4">
            <input
              placeholder="Email"
              autoFocus
              className="w-full p-3 rounded-lg bg-white/90 outline-none"
              {...register("email", {
                required: "Enter Email",
              })}
            />

            {errors.email && (
              <p className="text-red-400 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* PASSWORD */}

          <div className="mb-4 relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 rounded-lg bg-white/90 outline-none"
              {...register("password", {
                required: "Enter Password",
              })}
            />

            <div
              className="absolute right-3 top-3 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>

            {errors.password && (
              <p className="text-red-400 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* LOGIN BUTTON */}

          <button
            disabled={loading}
            className="w-full bg-white text-black py-3 rounded-lg font-semibold 
transition-all duration-300 mb-4 cursor-pointer disabled:opacity-50
hover:bg-[#020617] hover:text-white hover:border-2 hover:border-blue-500 hover:shadow-[0_0_15px_#3b82f6]"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* OR DIVIDER */}

          <div className="flex items-center gap-3 mb-4">
            <hr className="flex-1 border-white/50" />

            <p className="text-white text-sm">OR</p>

            <hr className="flex-1 border-white/50" />
          </div>

          {/* GOOGLE LOGIN */}

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white text-black py-3 rounded-lg font-semibold 
transition-all duration-300 cursor-pointer
hover:bg-red-500 hover:text-white hover:shadow-[0_0_15px_#ef4444]"
          >
            Continue with Google
          </button>

          {/* SIGNUP LINK */}

          <p className="text-center text-white mt-6 text-sm">
            Create new account?{" "}
            <Link to="/signup" className="text-blue-300 hover:underline">
              SignUp
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

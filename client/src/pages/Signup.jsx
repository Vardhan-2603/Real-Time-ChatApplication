import { useForm } from "react-hook-form";
import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

import bg from "../assets/bg1.png";
import logo from "../assets/logo.png";

import { Eye, EyeOff } from "lucide-react";

export default function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const onSubmit = async (data) => {
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
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-[#020617] bg-cover bg-center flex flex-col"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* NAVBAR */}

      <div className="flex items-center p-5">
        <img
          src={logo}
          className="w-12 h-12 rounded-full border border-white"
        />
      </div>

      {/* SIGNUP CARD */}

      <div className="flex flex-1 justify-center items-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white/20 backdrop-blur-lg p-10 rounded-2xl w-[440px] shadow-xl border border-white/30"
        >
          <h2 className="text-white text-2xl font-semibold mb-6 text-center">
            Create Account
          </h2>

          {/* FIRST NAME */}

          <div className="mb-4">
            <input
              placeholder="First Name"
              className="w-full p-3 rounded-lg bg-white/90 outline-none"
              {...register("firstName", { required: "Enter First Name" })}
            />

            {errors.firstName && (
              <p className="text-red-400 text-sm mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* LAST NAME */}

          <div className="mb-4">
            <input
              placeholder="Last Name (optional)"
              className="w-full p-3 rounded-lg bg-white/90 outline-none"
              {...register("lastName")}
            />
          </div>

          {/* USERNAME */}

          <div className="mb-4">
            <input
              placeholder="Username (optional)"
              className="w-full p-3 rounded-lg bg-white/90 outline-none"
              {...register("username", {
                pattern: {
                  value: /^[a-zA-Z][a-zA-Z0-9_]*$/,
                  message: "Username must start with an alphabet letter and contain only letters, numbers, and underscores",
                },
                validate: async (value) => {
                  if (!value) return true;
                  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
                    return "Username must start with an alphabet letter and contain only letters, numbers, and underscores";
                  }
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

            {errors.username && (
              <p className="text-red-400 text-sm mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* EMAIL */}

          <div className="mb-4">
            <input
              placeholder="Email"
              className="w-full p-3 rounded-lg bg-white/90 outline-none"
              {...register("email", {
                required: "Enter Email",
                pattern: {
                  value: /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Invalid email format. The email local part must start with a letter and have a valid domain.",
                },
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
              {...register("password", { required: "Enter Password" })}
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

          {/* PROFILE PIC */}

          <div className="mb-4">
            <input
              placeholder="Profile Pic URL (optional)"
              className="w-full p-3 rounded-lg bg-white/90 outline-none"
              {...register("profilePic")}
            />
          </div>

          {/* TAGLINE */}

          <div className="mb-4">
            <input
              placeholder="Tagline (optional)"
              className="w-full p-3 rounded-lg bg-white/90 outline-none"
              {...register("tagline")}
            />
          </div>

          {/* SERVER ERROR */}

          {serverError && (
            <p className="text-red-400 text-sm mb-3 text-center">
              {serverError}
            </p>
          )}

          {/* SIGNUP BUTTON */}

          <button
            className="w-full bg-white text-black py-3 rounded-lg font-semibold 
transition-all duration-300 cursor-pointer
hover:bg-[#020617] hover:text-white hover:border-2 hover:border-blue-500 hover:shadow-[0_0_15px_#3b82f6]"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

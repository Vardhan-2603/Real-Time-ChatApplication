import { useState } from "react";
import api from "../services/api";

export default function AuthPage({ goChat, goBack }) {
  const [isSignup, setIsSignup] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const signup = async () => {
    try {
      await api.post("/user-api/register", form);

      alert("User Registered Successfully");

      setIsSignup(false);
    } catch (error) {
      console.log(error);
    }
  };

  const login = async () => {
    try {
      await api.post("/user-api/login", form);

      alert("Login Successful");

      goChat();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f235e]">
      <div className="bg-slate-100 shadow-2xl rounded-xl p-10 w-96">
        <button onClick={goBack} className="text-blue-600 text-sm mb-4">
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h1>

        {isSignup && (
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="w-full border p-3 mb-3 rounded-lg"
          />
        )}

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          onChange={handleChange}
          className="w-full border p-3 mb-3 rounded-lg"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full border p-3 mb-4 rounded-lg"
        />

        <button
          onClick={isSignup ? signup : login}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
        >
          {isSignup ? "Sign Up" : "Login"}
        </button>

        <p className="text-center mt-5 text-sm text-gray-600">
          {isSignup ? "Already have an account?" : "New here?"}

          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-blue-600 ml-1 font-semibold"
          >
            {isSignup ? "Login" : "Signup"}
          </button>
        </p>
      </div>
    </div>
  );
}

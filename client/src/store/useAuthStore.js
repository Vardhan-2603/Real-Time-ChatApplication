import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../services/api";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      loading: false,
      isAuthenticated: false,
      error: null,
      isCheckingAuth: true,

      checkAuth: async () => {
        try {
          let res = await api.get("/user-api/check-auth");
          set({
            user: res.data.payload,
            isAuthenticated: true,
            isCheckingAuth: false,
          });
        } catch (err) {
          console.log("checkAuth error:", err);
          localStorage.removeItem("token");
          set({
            user: null,
            isAuthenticated: false,
            isCheckingAuth: false,
          });
        }
      },

      login: async (userCredObj) => {
        try {
          set({
            loading: true,
            error: null,
          });

          let res = await api.post("/user-api/login", userCredObj);

          if (res.data.token) {
            localStorage.setItem("token", res.data.token);
          }

          set({
            loading: false,
            error: null,
            isAuthenticated: true,
            user: res.data.payload,
          });

          return true;
        } catch (err) {
          console.log(err);
          localStorage.removeItem("token");

          set({
            loading: false,
            error: err.response?.data?.message || err.message || "Login failed",
            isAuthenticated: false,
            user: null,
          });

          return false;
        }
      },

      logout: async () => {
        try {
          set({
            loading: true,
            error: null,
          });

          await api.get("/user-api/logout");
          localStorage.removeItem("token");

          set({
            user: null,
            loading: false,
            isAuthenticated: false,
          });
        } catch (err) {
          console.log(err);

          set({
            loading: false,
            error:
              err.response?.data?.message || err.message || "Logout failed",
            isAuthenticated: false,
            user: null,
          });
        }
      },

      setUser: (user) =>
        set(() => ({
          user,
          isAuthenticated: !!user,
          loading: false,
          error: null,
        })),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

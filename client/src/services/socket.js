import { io } from "socket.io-client";

const SOCKET_URL = (
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:4000" : "https://real-time-chatapplication-backend.onrender.com")
).replace(/\/$/, "");

const socket = io(

  SOCKET_URL,

  {

    withCredentials: true,

    transports: ["websocket"],

    autoConnect: true,

    reconnection: true,

    reconnectionAttempts: 10,

    reconnectionDelay: 1000,

  },

);

export default socket;
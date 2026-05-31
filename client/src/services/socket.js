import { io } from "socket.io-client";

const SOCKET_URL = (
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000"
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
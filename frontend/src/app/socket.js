import { io } from "socket.io-client";

export const socket = io("http://localhost:8080", {
  auth: {
    token: typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null
  }
});

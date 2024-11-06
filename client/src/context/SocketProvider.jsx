import React, { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = (props) => {
  // Determine the socket URL based on the environment
  const socketUrl = process.env.NODE_ENV === 'production'
    ? "https://video-call-a4d9.onrender.com" // Production URL
    : "http://localhost:8000"; // Development URL

  const socket = useMemo(() => io(socketUrl), [socketUrl]);

  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};
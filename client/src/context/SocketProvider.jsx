import React, { createContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

// Create a context for the socket
export const SocketContext = createContext();

// Replace this with your deployed Socket.IO server URL
const SOCKET_SERVER_URL = "https://video-call-a4d9.onrender.com"; // Update this line

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL, {
      withCredentials: true, // Include this if you need to send cookies
      transports: ["websocket"], // Adjust transport methods if necessary
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const value = useMemo(() => socket, [socket]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

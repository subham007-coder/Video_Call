import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import Footer from "../Components/Footer";

const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { email, room } = data;
      navigate(`/room/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <>
    <div className="bg-slate-900 w-full min-h-screen font-sans py-10 text-white text-center">
      <h1 className="mb-8 text-2xl">Join Room</h1>
      <form
        onSubmit={handleSubmitForm}
        className="max-w-sm mx-auto p-10 border rounded-lg border-gray-600 flex justify-center items-start flex-col"
      >
        <label
          htmlFor="email"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Email ID
        </label>
        <input
          required
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-transparent dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-none"
          placeholder="name@your.com"
        />
        <br />
        <label
          htmlFor="room"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Room Number
        </label>
        <input
          required
          type="number"
          id="room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-transparent dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-none"
          placeholder="123"
        />
        <br />
        <button className="bg-transparent py-2 px-5 rounded-lg border border-blue-500 hover:border-gray-50">
          Join
        </button>
      </form>
    </div>
      <Footer />
    </>
  );
};

export default LobbyScreen;

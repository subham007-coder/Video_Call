// RoomPage.jsx
import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import Footer from "../Components/Footer";
import GestureVideo from "../Components/GestureVideo"; // Import GestureVideo

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [gesture, setGesture] = useState(null); // State for gesture

  const handleGesture = (detectedGesture) => {
    setGesture(detectedGesture);
    socket.emit("gesture:detected", { detectedGesture });
    setTimeout(() => setGesture(null), 3000); // Clear gesture after 3 seconds
  };

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`User ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    if (!remoteSocketId) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(async ({ from, offer }) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    setRemoteSocketId(from);
    setMyStream(stream);

    const ans = await peer.getAnswer(offer);
    socket.emit("call:accepted", { to: from, ans });
  }, [socket]);

  const sendStreams = useCallback(() => {
    if (myStream) {
      myStream.getTracks().forEach((track) => peer.peer.addTrack(track, myStream));
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(({ ans }) => {
    peer.setLocalDescription(ans);
    sendStreams();
    console.log("Call Accepted!");
  }, [sendStreams]);

  const handleNegoNeeded = useCallback(async () => {
    if (!remoteSocketId) return;

    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  const handleNegoNeedIncomming = useCallback(async ({ from, offer }) => {
    const ans = await peer.getAnswer(offer);
    socket.emit("peer:nego:done", { to: from, ans });
  }, [socket]);

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    peer.peer.addEventListener("track", (ev) => setRemoteStream(ev.streams[0]));
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
      peer.peer.removeEventListener("track", (ev) => setRemoteStream(ev.streams[0]));
    };
  }, [handleNegoNeeded]);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [socket, handleUserJoined, handleIncommingCall, handleCallAccepted, handleNegoNeedIncomming, handleNegoNeedFinal]);

  return (
    <div className="bg-slate-900 w-full min-h-screen font-sans text-white flex justify-center items-center flex-col">
      <h1 className="text-2xl">Room Page</h1>
      <div className="video-wrapper flex flex-col justify-center items-center relative">
        {myStream && <ReactPlayer playing height="300px" width="300px" url={myStream} />}
        {remoteStream && <ReactPlayer playing height="300px" width="300px" url={remoteStream} />}
        
        <GestureVideo onGesture={handleGesture} /> {/* Gesture overlay component */}
        
        {gesture && (
          <div
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              color: "white",
              padding: "5px 10px",
              borderRadius: "8px",
            }}
          >
            Gesture: {gesture}
          </div>
        )}
        <h4 className="mt-2">
          {remoteSocketId ? "Connected" : "Waiting For Someone!"}
        </h4>
      </div>
      <div className="button-wrap gap-2 flex mt-5 mb-4">
        {myStream && (
          <button
            onClick={sendStreams}
            className="bg-transparent py-2 px-5 rounded-lg border border-blue-500 hover:border-gray-50 hover:text-blue-300"
          >
            Send Stream
          </button>
        )}
        {remoteSocketId && (
          <button
            onClick={handleCallUser}
            className="bg-transparent py-2 px-5 rounded-lg border border-blue-500 hover:border-gray-50 hover:text-blue-300"
          >
            Call
          </button>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default RoomPage;

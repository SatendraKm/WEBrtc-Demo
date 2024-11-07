import React, { useEffect, useCallback, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../service/peer";

const Meeting = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState("");
  const [myStream, setMyStream] = useState("");
  const [remoteStream, setRemoteStream] = useState("");

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined the room `);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log("incoming call", from, offer);
      const answer = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, answer });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    const senders = peer.peer.getSenders();
    const tracks = myStream.getTracks();

    tracks.forEach((track) => {
      const sender = senders.find((s) => s.track && s.track.id === track.id);
      if (!sender) {
        peer.peer.addTrack(track, myStream);
      }
    });
  }, [myStream]);
  const handleCallAccepted = useCallback(
    ({ from, answer }) => {
      if (answer) {
        peer.setRemoteDescription(answer);
        sendStreams();
        console.log("Call accepted, remote description set");
      } else {
        console.error("Received null or undefined answer");
      }
    },
    [sendStreams]
  );

  const handleNegotiationneeded = useCallback(
    () => async () => {
      const offer = await peer.getOffer();
      socket.emit("peer:nego:needed", { to: remoteSocketId, offer });
    },
    [socket, remoteSocketId]
  );
  const handleNegotiationIncomming = useCallback(
    async ({ from, offer }) => {
      const answer = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, answer });
    },
    [socket]
  );
  const handleNegotiationFinal = useCallback(async ({ answer }) => {
    await peer.setLocalDescription(answer);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegotiationneeded);
    return () => {
      peer.peer.removeEventListener(
        "negotiationneeded",
        handleNegotiationneeded
      );
    };
  }, [handleNegotiationneeded]);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegotiationIncomming);
    socket.on("peer:nego:final", handleNegotiationFinal);
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegotiationIncomming);
      socket.off("peer:nego:final", handleNegotiationFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegotiationIncomming,
    handleNegotiationFinal,
  ]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-600">
          Video Meeting
        </h1>

        <div className="mb-4 text-center">
          <h4 className="text-lg font-semibold">
            {remoteSocketId ? "Connected" : "Waiting for someone to join..."}
          </h4>
        </div>

        <div className="flex justify-center space-x-4 mb-6">
          {myStream && (
            <button
              onClick={sendStreams}
              className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300"
            >
              Send Stream
            </button>
          )}
          {remoteSocketId && (
            <button
              onClick={handleCallUser}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300"
            >
              Accept Call
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center space-y-6 md:space-y-0 md:space-x-6">
          {myStream && (
            <div className="w-full md:w-1/2">
              <h2 className="text-xl font-semibold mb-2 text-center">
                My Stream
              </h2>
              <div className="rounded-lg overflow-hidden shadow-md">
                <ReactPlayer
                  playing
                  muted
                  height="auto"
                  width="100%"
                  url={myStream}
                />
              </div>
            </div>
          )}
          {remoteStream && (
            <div className="w-full md:w-1/2">
              <h2 className="text-xl font-semibold mb-2 text-center">
                Remote Stream
              </h2>
              <div className="rounded-lg overflow-hidden shadow-md">
                <ReactPlayer
                  playing
                  height="auto"
                  width="100%"
                  url={remoteStream}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Meeting;

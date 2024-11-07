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
    <div>
      <h1>Meeting</h1>
      <h4>{remoteSocketId ? "connected" : "no one in the meeting"}</h4>
      {myStream && <button onClick={sendStreams}>Send stream</button>}
      {remoteSocketId && <button onClick={handleCallUser}>accept</button>}
      {myStream && (
        <>
          <h1>Me</h1>
          <ReactPlayer
            playing
            height={"100px"}
            width={"100px"}
            url={myStream}
          />
        </>
      )}
      {remoteStream && (
        <>
          <h1>Remote</h1>
          <ReactPlayer
            playing
            height={"100px"}
            width={"100px"}
            url={remoteStream}
          />
        </>
      )}
    </div>
  );
};

export default Meeting;

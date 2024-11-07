import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [email, setEmail] = useState("");
  const [meetingId, setMeetingId] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !meetingId) {
      alert("Please fill in both fields");
      return;
    }
    socket.emit("meeting:join", { email, meetingId });
    // You can call your server API here
    console.log("Joining with:", email, meetingId);
  };
  const handleJoinMeeting = useCallback(
    (data) => {
      const { email, meetingId } = data;
      navigate(`/meeting/${meetingId}`);
      console.log(email);
    },
    [navigate]
  );
  useEffect(() => {
    socket.on("meeting:join", handleJoinMeeting);
    return () => {
      socket.off("meeting:join");
    };
  }, [socket, handleJoinMeeting]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center">
          Join a Meeting
        </h1>

        <form onSubmit={handleSubmit}>
          <label className="block text-gray-700 mb-2">Email ID</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <label className="block text-gray-700 mb-2">Meeting ID</label>
          <input
            type="text"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            placeholder="Enter meeting ID"
            className="w-full p-3 border border-gray-300 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white p-3 rounded font-semibold hover:bg-indigo-700 transition duration-300"
          >
            Join
          </button>
        </form>
      </div>
    </div>
  );
}

export default HomePage;

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
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-600">
          Join a Meeting
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="meetingId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Meeting ID
            </label>
            <input
              id="meetingId"
              type="text"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              placeholder="Enter meeting ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300"
          >
            Join Meeting
          </button>
        </form>
      </div>
    </div>
  );
}

export default HomePage;

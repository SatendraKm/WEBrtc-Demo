import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./screens/HomePage";
import Meeting from "./screens/Meeting";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/meeting/:meetingId" element={<Meeting />} />
      </Routes>
    </div>
  );
};

export default App;

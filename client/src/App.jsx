import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./components/Dashboard";
import MusicPlayer from "./components/MusicPlayer";

import "./App.css";
import { useState } from "react";

function App() {
  const [songData, setSongData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSongData = async (songId) => {
    try {
      setLoading(true);
      setError(null);
      // First, fetch the lyrics and generated images
      const lyricsResponse = await fetch(
        `http://localhost:3000/lycris?id=${songId}`
      );
      if (!lyricsResponse.ok) {
        throw new Error("Failed to fetch song data");
      }
      const data = await lyricsResponse.json();

      // Create the complete song data object
      const completeData = {
        ...data,
        audioUrl: `http://localhost:3000/audio?id=${songId}`,
      };

      setSongData(completeData);
    } catch (error) {
      console.error("Error fetching song data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                fetchSongData={fetchSongData}
                loading={loading}
                error={error}
              />
            }
          />
          <Route
            path="/musicplayer"
            element={
              <MusicPlayer
                songData={songData}
                loading={loading}
                error={error}
              />
            }
          />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

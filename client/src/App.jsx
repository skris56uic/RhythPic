import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useRef } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./components/Dashboard";
import MusicPlayer from "./components/MusicPlayer";

import "./App.css";

function App() {
  const [songData, setSongData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());

  const fetchSongData = async (songId) => {
    try {
      setLoading(true);
      setError(null);

      const metadataResponse = await fetch("http://localhost:3000/songs");
      const metadataData = await metadataResponse.json();
      const songMetadata = metadataData.songs.find(
        (song) => song.id === songId
      );

      if (!songMetadata) {
        throw new Error("Song metadata not found");
      }

      // First, fetch the lyrics and generated images
      const lyricsResponse = await fetch(
        `http://localhost:3000/lycris?id=${songId}`
      );
      if (!lyricsResponse.ok) {
        throw new Error("Failed to fetch song data");
      }
      const lyricsData = await lyricsResponse.json();

      const completeData = {
        ...lyricsData,
        name: songMetadata.name,
        artist: songMetadata.artist,
      };
      console.log(completeData);
      // Set up audio
      audioRef.current.src = `http://localhost:3000/audio?id=${songId}`;
      audioRef.current.load();

      setSongData(completeData);
    } catch (error) {
      console.error("Error fetching song data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
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
                audioRef={audioRef}
                isPlaying={isPlaying}
                togglePlayPause={togglePlayPause}
              />
            }
          />
        </Routes>
        <Footer
          songData={songData}
          audioRef={audioRef}
          isPlaying={isPlaying}
          togglePlayPause={togglePlayPause}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;

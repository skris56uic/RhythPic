import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AppContext } from "./AppContextAndAppContextProvider";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./components/Dashboard";
import MusicPlayer from "./components/MusicPlayer";

import "./App.css";

function App() {
  const { songData, setSongData } = useContext(AppContext);

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/musicplayer" element={<MusicPlayer />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        {songData && <Footer />}
      </div>
    </BrowserRouter>
  );
}

export default App;

import { useContext, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AppContext } from "./AppContextAndAppContextProvider";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./components/Dashboard";
import MusicPlayer from "./components/MusicPlayer";
import { fetchListOfSongs } from "./api/api";

import "./App.css";

function App() {
  const { setAllSongs, setLoading } = useContext(AppContext);

  useEffect(() => {
    (async function () {
      setLoading({ text: "Loading Songs ..." });
      const data = await fetchListOfSongs();
      setAllSongs(data.songs);
      setLoading(null);
    })();
  }, []);

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/musicplayer" element={<MusicPlayer />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

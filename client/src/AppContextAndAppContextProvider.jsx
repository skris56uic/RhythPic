/* eslint-disable react/prop-types */
import { createContext, useState, useRef, useEffect } from "react";
import { base_url, fetchSongLyrics, fetchSongTrivia } from "./api/api";

const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [allSongs, setAllSongs] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [songProgress, setSongProgress] = useState(0);
  const [loading, setLoading] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queuedSongs, setQueuedSongs] = useState(() => {
    const savedQueue = localStorage.getItem("songQueue");
    return savedQueue ? JSON.parse(savedQueue) : [];
  });
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    const saved = localStorage.getItem("recentlyPlayed");
    return saved ? JSON.parse(saved) : [];
  });
  const audioRef = useRef(new Audio());

  useEffect(() => {
    localStorage.setItem("songQueue", JSON.stringify(queuedSongs));
  }, [queuedSongs]);

  useEffect(() => {
    try {
      // Only store essential song data
      const essentialData = recentlyPlayed.map((song) => ({
        id: song.id,
        name: song.name,
        artist: song.artist,
        album_art_url: song.album_art_url,
        favourite: song.favourite,
      }));
      localStorage.setItem("recentlyPlayed", JSON.stringify(essentialData));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      // If storage fails, keep the state but don't crash
    }
  }, [recentlyPlayed]);

  const addToRecentlyPlayed = (song) => {
    if (!song) return;
    setRecentlyPlayed((prev) => {
      // Create minimal song object
      const minimalSong = {
        id: song.id,
        name: song.name,
        artist: song.artist,
        album_art_url: song.album_art_url,
        favourite: song.favourite,
      };
      const filtered = prev.filter((s) => s.id !== song.id);
      const updated = [minimalSong, ...filtered].slice(0, 5);
      return updated;
    });
  };

  const addToQueue = (song) => {
    if (!queuedSongs.some((queuedSong) => queuedSong.id === song.id)) {
      setQueuedSongs([...queuedSongs, song]);
    }
  };

  const removeFromQueue = (songId) => {
    setQueuedSongs(queuedSongs.filter((song) => song.id !== songId));
  };

  const clearQueue = () => {
    setQueuedSongs([]);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const playQueuedSong = async (song) => {
    try {
      setLoading({ text: "Loading Song..." });

      if (!song.lyricsAndImages) {
        const lyrics = await fetchSongLyrics(song.id);
        const trivia = await fetchSongTrivia(lyrics.fileName);

        const updatedSongs = allSongs.map((s) =>
          s.id === song.id
            ? {
                ...s,
                fileName: lyrics.fileName,
                lyricsAndImages: lyrics.isong.lines,
                trivia: trivia.description,
              }
            : s
        );
        setAllSongs(updatedSongs);
        song = updatedSongs.find((s) => s.id === song.id);
      }

      setCurrentSong(song);
      addToRecentlyPlayed(song);
      audioRef.current.src = `${base_url}/audio?id=${song.id}`;
      await audioRef.current.load();
      await audioRef.current.play();
      setIsPlaying(true);
      removeFromQueue(song.id);
      setLoading(null);
    } catch (error) {
      console.error("Error playing queued song:", error);
      setLoading(null);
    }
  };

  return (
    <AppContext.Provider
      value={{
        allSongs,
        setAllSongs,
        currentSong,
        setCurrentSong,
        songProgress,
        setSongProgress,
        loading,
        setLoading,
        isPlaying,
        setIsPlaying,
        audioRef,
        togglePlayPause,
        queuedSongs,
        addToQueue,
        removeFromQueue,
        clearQueue,
        playQueuedSong,
        recentlyPlayed,
        addToRecentlyPlayed,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };

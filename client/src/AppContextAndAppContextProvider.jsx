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
  const audioRef = useRef(new Audio());

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("songQueue", JSON.stringify(queuedSongs));
  }, [queuedSongs]);

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

      // If song details aren't loaded yet, fetch them
      if (!song.lyricsAndImages) {
        const lyrics = await fetchSongLyrics(song.id);
        const trivia = await fetchSongTrivia(lyrics.fileName);

        // Update the song in allSongs with the new data
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

        // Update the current song with the fetched data
        song = updatedSongs.find((s) => s.id === song.id);
      }

      setCurrentSong(song);
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };

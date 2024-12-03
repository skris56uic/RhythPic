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
    const storedQueue = localStorage.getItem("queuedSongs");
    return storedQueue ? JSON.parse(storedQueue) : [];
  });
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("none"); // none, one, all
  const [volume, setVolume] = useState(50);
  const [shuffleHistory, setShuffleHistory] = useState([]);
  const [shuffleQueue, setShuffleQueue] = useState([]);
  const audioRef = useRef(new Audio());
  const loadingRef = useRef(false);

  const addToRecentlyPlayed = (song) => {
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((s) => s.id !== song.id);
      return [song, ...filtered].slice(0, 10);
    });
  };

  const addToQueue = (song) => {
    setQueuedSongs((prev) => {
      const updatedQueue = prev.some((queuedSong) => queuedSong.id === song.id)
        ? prev
        : [...prev, song];
      localStorage.setItem("queuedSongs", JSON.stringify(updatedQueue));
      return updatedQueue;
    });
  };

  const removeFromQueue = (songId) => {
    setQueuedSongs((prev) => {
      const updatedQueue = prev.filter((song) => song.id !== songId);
      localStorage.setItem("queuedSongs", JSON.stringify(updatedQueue));
      return updatedQueue;
    });
  };

  const loadAndPlaySong = async (song) => {
    if (!song || loadingRef.current) return false;

    try {
      loadingRef.current = true;
      setLoading({ text: "Loading Song..." });

      // Reset current audio
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = "";
      setIsPlaying(false);

      // Load song details if needed
      let songToPlay = song;
      if (!song.lyricsAndImages) {
        const lyrics = await fetchSongLyrics(song.id);
        const trivia = await fetchSongTrivia(lyrics.fileName);

        songToPlay = {
          ...song,
          fileName: lyrics.fileName,
          lyricsAndImages: lyrics.isong.lines,
          trivia: trivia.description,
        };

        setAllSongs((prev) =>
          prev.map((s) => (s.id === song.id ? songToPlay : s))
        );
      }

      // Update current song before loading audio
      setCurrentSong(songToPlay);
      addToRecentlyPlayed(songToPlay);

      // Load and play audio
      audioRef.current.src = `${base_url}/audio?id=${songToPlay.id}`;

      // Wait for audio to be loaded
      await new Promise((resolve, reject) => {
        const handleCanPlay = () => {
          audioRef.current.removeEventListener("canplay", handleCanPlay);
          audioRef.current.removeEventListener("error", handleError);
          resolve();
        };

        const handleError = (error) => {
          audioRef.current.removeEventListener("canplay", handleCanPlay);
          audioRef.current.removeEventListener("error", handleError);
          reject(error);
        };

        audioRef.current.addEventListener("canplay", handleCanPlay);
        audioRef.current.addEventListener("error", handleError);
        audioRef.current.load();
      });

      await audioRef.current.play();
      setIsPlaying(true);
      return true;
    } catch (error) {
      console.error("Error loading song:", error);
      return false;
    } finally {
      setLoading(null);
      loadingRef.current = false;
    }
  };

  const getNextSong = () => {
    if (!currentSong || !allSongs) return null;

    // First priority: Queued songs
    if (queuedSongs.length > 0) {
      return queuedSongs[0];
    }

    const currentIndex = allSongs.findIndex(
      (song) => song.id === currentSong.id
    );

    // Handle shuffle mode
    if (isShuffle) {
      // If shuffle queue is empty, generate new shuffled queue excluding current song
      if (shuffleQueue.length === 0) {
        const availableSongs = allSongs.filter(
          (song) => song.id !== currentSong.id
        );
        const newShuffleQueue = [...availableSongs].sort(
          () => Math.random() - 0.5
        );
        setShuffleQueue(newShuffleQueue);
        setShuffleHistory([currentSong]);
        return newShuffleQueue[0];
      }
      return shuffleQueue[0];
    }

    // Handle repeat modes
    if (currentIndex === allSongs.length - 1) {
      // If at end of playlist
      if (repeatMode === "all") {
        return allSongs[0]; // Go back to start
      } else if (repeatMode === "one") {
        return currentSong; // Repeat current song
      }
      return null; // Stop playing
    }

    // Normal next song
    return allSongs[currentIndex + 1];
  };

  const getPreviousSong = () => {
    if (!currentSong || !allSongs) return null;

    const currentIndex = allSongs.findIndex(
      (song) => song.id === currentSong.id
    );

    // Handle shuffle mode
    if (isShuffle) {
      if (shuffleHistory.length > 1) {
        const previousSong = shuffleHistory[shuffleHistory.length - 2];
        setShuffleHistory((prev) => prev.slice(0, -1));
        setShuffleQueue((prev) => [currentSong, ...prev]);
        return previousSong;
      }
      // If no history, get random song
      const availableSongs = allSongs.filter(
        (song) => song.id !== currentSong.id
      );
      return availableSongs[Math.floor(Math.random() * availableSongs.length)];
    }

    // Handle repeat modes
    if (currentIndex === 0) {
      // If at start of playlist
      if (repeatMode === "all") {
        return allSongs[allSongs.length - 1]; // Go to end
      } else if (repeatMode === "one") {
        return currentSong; // Repeat current song
      }
      return null; // Stay on first song
    }

    // Normal previous song
    return allSongs[currentIndex - 1];
  };

  const playNext = async () => {
    if (!currentSong || !allSongs || loadingRef.current) return;

    const nextSong = getNextSong();
    if (!nextSong) return;

    // Update shuffle history if in shuffle mode
    if (isShuffle) {
      setShuffleHistory((prev) => [...prev, nextSong]);
      setShuffleQueue((prev) => prev.slice(1));
    }

    // Remove from queue if it was a queued song
    if (queuedSongs.length > 0) {
      setQueuedSongs((prev) => prev.slice(1));
    }

    await loadAndPlaySong(nextSong);
  };

  const playPrevious = async () => {
    if (!currentSong || !allSongs || loadingRef.current) return;

    const prevSong = getPreviousSong();
    if (!prevSong) return;

    await loadAndPlaySong(prevSong);
  };

  const togglePlayPause = async () => {
    if (loadingRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error toggling play/pause:", error);
      setIsPlaying(false);
    }
  };

  const toggleShuffle = () => {
    setIsShuffle((prev) => {
      const newValue = !prev;
      if (newValue) {
        // Starting shuffle mode
        setShuffleHistory([currentSong]);
        const availableSongs = allSongs.filter(
          (song) => song.id !== currentSong.id
        );
        setShuffleQueue([...availableSongs].sort(() => Math.random() - 0.5));
      } else {
        // Ending shuffle mode
        setShuffleHistory([]);
        setShuffleQueue([]);
      }
      return newValue;
    });
  };

  const toggleRepeat = () => {
    setRepeatMode((current) => {
      switch (current) {
        case "none":
          return "one";
        case "one":
          return "all";
        case "all":
          return "none";
        default:
          return "none";
      }
    });
  };

  const toggleMute = () => {
    if (volume === 0) {
      setVolume(50);
      audioRef.current.volume = 0.5;
    } else {
      setVolume(0);
      audioRef.current.volume = 0;
    }
  };

  useEffect(() => {
    const handleSongEnd = async () => {
      if (repeatMode === "one") {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      } else {
        await playNext();
      }
    };

    audioRef.current.addEventListener("ended", handleSongEnd);
    return () => audioRef.current.removeEventListener("ended", handleSongEnd);
  }, [repeatMode]);

  useEffect(() => {
    audioRef.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const playQueuedSong = async (song) => {
    if (loadingRef.current) return;

    setQueuedSongs((prev) => prev.filter((s) => s.id !== song.id));
    const success = await loadAndPlaySong(song);
    if (success) {
      setIsPlaying(true);
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
        isShuffle,
        toggleShuffle,
        repeatMode,
        toggleRepeat,
        queuedSongs,
        setQueuedSongs,
        addToQueue,
        removeFromQueue,
        playQueuedSong,
        recentlyPlayed,
        volume,
        setVolume,
        toggleMute,
        audioRef,
        togglePlayPause,
        playNext,
        playPrevious,
        loadAndPlaySong,
        addToRecentlyPlayed,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };

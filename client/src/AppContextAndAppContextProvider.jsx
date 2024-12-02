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
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("none");
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem("volume");
    return savedVolume ? Number(savedVolume) : 100;
  });

  const audioRef = useRef();
  const shuffledSongsRef = useRef([]);

  useEffect(() => {
    audioRef.current = new Audio();
    const savedVolume = localStorage.getItem("volume");
    audioRef.current.volume = savedVolume ? Number(savedVolume) / 100 : 1;

    return () => {
      audioRef.current.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      localStorage.setItem("volume", volume.toString());
    }
  }, [volume]);

  useEffect(() => {
    if (isShuffle && allSongs) {
      // Create a new shuffled array when shuffle is enabled
      shuffledSongsRef.current = [...allSongs].sort(() => Math.random() - 0.5);
    }
  }, [isShuffle, allSongs]);

  // Other utility functions remain the same
  const addToRecentlyPlayed = (song) => {
    if (!song) return;
    setRecentlyPlayed((prev) => {
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

  const toggleShuffle = () => {
    setIsShuffle((prev) => !prev);
  };

  const toggleMute = () => {
    setVolume((prev) => (prev === 0 ? 100 : 0));
  };

  const getNextSong = () => {
    if (queuedSongs.length > 0) {
      return queuedSongs[0];
    }

    if (!currentSong || !allSongs) return null;

    if (isShuffle) {
      const currentShuffleIndex = shuffledSongsRef.current.findIndex(
        (song) => song.id === currentSong.id
      );
      const nextIndex =
        (currentShuffleIndex + 1) % shuffledSongsRef.current.length;
      return shuffledSongsRef.current[nextIndex];
    }

    const currentIndex = allSongs.findIndex(
      (song) => song.id === currentSong.id
    );
    const nextIndex = (currentIndex + 1) % allSongs.length;
    return allSongs[nextIndex];
  };

  const getPreviousSong = () => {
    if (!currentSong || !allSongs) return null;

    if (isShuffle) {
      const currentShuffleIndex = shuffledSongsRef.current.findIndex(
        (song) => song.id === currentSong.id
      );
      const prevIndex =
        currentShuffleIndex === 0
          ? shuffledSongsRef.current.length - 1
          : currentShuffleIndex - 1;
      return shuffledSongsRef.current[prevIndex];
    }

    const currentIndex = allSongs.findIndex(
      (song) => song.id === currentSong.id
    );
    const prevIndex =
      currentIndex === 0 ? allSongs.length - 1 : currentIndex - 1;
    return allSongs[prevIndex];
  };

  const playSong = async (song) => {
    if (!song) return false;

    try {
      setLoading({ text: "Loading Song..." });

      // Stop current playback
      audioRef.current.pause();
      audioRef.current.src = "";
      setIsPlaying(false);

      // Load song details if needed
      if (!song.lyricsAndImages) {
        const lyrics = await fetchSongLyrics(song.id);
        const trivia = await fetchSongTrivia(lyrics.fileName);

        const updatedSong = {
          ...song,
          fileName: lyrics.fileName,
          lyricsAndImages: lyrics.isong.lines,
          trivia: trivia.description,
        };

        setAllSongs((prev) =>
          prev.map((s) => (s.id === song.id ? updatedSong : s))
        );
        song = updatedSong;
      }

      audioRef.current.src = `${base_url}/audio?id=${song.id}`;

      await audioRef.current.load();
      setCurrentSong(song);
      addToRecentlyPlayed(song);
      await audioRef.current.play();
      setIsPlaying(true);
      setLoading(null);
      return true;
    } catch (error) {
      console.error("Error in playSong:", error);
      setLoading(null);
      return false;
    }
  };

  const playNext = async () => {
    try {
      if (repeatMode === "one") {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        return;
      }

      const nextSong = getNextSong();
      if (nextSong) {
        const success = await playSong(nextSong);
        if (success && queuedSongs.length > 0) {
          setQueuedSongs(queuedSongs.slice(1));
        }
      }
    } catch (error) {
      console.error("Error in playNext:", error);
      setLoading(null);
    }
  };

  const playPrevious = async () => {
    try {
      if (audioRef.current.currentTime > 3) {
        // If more than 3 seconds into the song, restart it
        audioRef.current.currentTime = 0;
        if (!isPlaying) {
          await audioRef.current.play();
          setIsPlaying(true);
        }
        return;
      }

      const previousSong = getPreviousSong();
      if (previousSong) {
        await playSong(previousSong);
      }
    } catch (error) {
      console.error("Error in playPrevious:", error);
      setLoading(null);
    }
  };

  const toggleRepeat = () => {
    const modes = ["none", "one", "all"];
    const currentIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIndex + 1) % modes.length]);
  };

  useEffect(() => {
    if (audioRef.current) {
      const handleSongEnd = async () => {
        if (repeatMode === "one") {
          audioRef.current.currentTime = 0;
          await audioRef.current.play();
        } else {
          await playNext();
        }
      };

      audioRef.current.addEventListener("ended", handleSongEnd);
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener("ended", handleSongEnd);
        }
      };
    }
  }, [repeatMode, currentSong, queuedSongs]);

  // Context value remains the same
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
        playQueuedSong: playSong,
        recentlyPlayed,
        addToRecentlyPlayed,
        playNext,
        playPrevious,
        toggleShuffle,
        isShuffle,
        toggleRepeat,
        repeatMode,
        volume,
        setVolume,
        toggleMute,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };

import { createContext, useState, useRef, useEffect } from "react";
import { base_url, fetchSongLyrics, fetchSongTrivia } from "./api/api";

const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [allSongs, setAllSongs] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [songProgress, setSongProgress] = useState(0);
  const [loading, setLoading] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queuedSongs, setQueuedSongs] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("none"); // none, one, all
  const [volume, setVolume] = useState(50);
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
      if (prev.some((queuedSong) => queuedSong.id === song.id)) {
        return prev;
      }
      return [...prev, song];
    });
  };

  const removeFromQueue = (songId) => {
    setQueuedSongs((prev) => prev.filter((song) => song.id !== songId));
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

  const playQueuedSong = async (song) => {
    if (loadingRef.current) return;

    setQueuedSongs((prev) => prev.filter((s) => s.id !== song.id));
    await loadAndPlaySong(song);
  };

  const playNext = async () => {
    if (!currentSong || !allSongs || loadingRef.current) return;

    const currentIndex = allSongs.findIndex(
      (song) => song.id === currentSong.id
    );
    let nextSong;

    if (queuedSongs.length > 0) {
      nextSong = queuedSongs[0];
      setQueuedSongs((prev) => prev.slice(1));
    } else {
      const nextIndex = (currentIndex + 1) % allSongs.length;
      nextSong = allSongs[nextIndex];
    }

    if (nextSong) {
      await loadAndPlaySong(nextSong);
    }
  };

  const playPrevious = async () => {
    if (!currentSong || !allSongs || loadingRef.current) return;

    const currentIndex = allSongs.findIndex(
      (song) => song.id === currentSong.id
    );
    const prevIndex =
      currentIndex === 0 ? allSongs.length - 1 : currentIndex - 1;
    const prevSong = allSongs[prevIndex];

    if (prevSong) {
      await loadAndPlaySong(prevSong);
    }
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
    setIsShuffle((prev) => !prev);
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
      } else if (repeatMode === "all" || queuedSongs.length > 0) {
        await playNext();
      } else {
        setIsPlaying(false);
      }
    };

    audioRef.current.addEventListener("ended", handleSongEnd);
    return () => audioRef.current.removeEventListener("ended", handleSongEnd);
  }, [repeatMode, queuedSongs]);

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

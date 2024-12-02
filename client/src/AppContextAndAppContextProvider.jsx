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
  const [audioState, setAudioState] = useState({
    source: "",
    isLoading: false,
    error: null,
  });

  const audioRef = useRef();

  useEffect(() => {
    audioRef.current = new Audio();
    // Set initial volume from localStorage or default to 100%
    const savedVolume = localStorage.getItem("volume");
    audioRef.current.volume = savedVolume ? Number(savedVolume) / 100 : 1;

    return () => {
      audioRef.current.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (audioState.source) {
      const loadAudio = async () => {
        try {
          audioRef.current.src = audioState.source;
          await audioRef.current.load();
          await audioRef.current.play();
          setIsPlaying(true);
          setAudioState((prev) => ({ ...prev, isLoading: false }));
          setLoading(null);
        } catch (error) {
          setAudioState((prev) => ({ ...prev, error, isLoading: false }));
          setIsPlaying(false);
          setLoading(null);
        }
      };

      setAudioState((prev) => ({ ...prev, isLoading: true }));
      loadAudio();
    }
  }, [audioState.source]);

  useEffect(() => {
    localStorage.setItem("songQueue", JSON.stringify(queuedSongs));
  }, [queuedSongs]);

  useEffect(() => {
    try {
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
    }
  }, [recentlyPlayed]);

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
    setIsShuffle(!isShuffle);
  };

  const getRandomSong = () => {
    if (allSongs) {
      const randomIndex = Math.floor(Math.random() * allSongs.length);
      return allSongs[randomIndex];
    }
    return null;
  };

  const toggleRepeat = () => {
    const modes = ["none", "one", "all"];
    const currentIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIndex + 1) % modes.length]);
  };

  const playSong = async (song) => {
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

      // Set audio source first
      audioRef.current.src = `${base_url}/audio?id=${song.id}`;

      // Wait for audio to be loaded
      await new Promise((resolve, reject) => {
        audioRef.current.onloadeddata = () => {
          resolve();
        };
        audioRef.current.onerror = (e) => {
          console.error("Audio load error:", e);
          reject(e);
        };
        audioRef.current.load();
      });

      // Update states after audio is loaded
      setCurrentSong(song);
      addToRecentlyPlayed(song);

      // Play the audio
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
      // If repeat one is enabled, replay current song
      if (repeatMode === "one") {
        await playSong(currentSong, false);
        return;
      }

      if (isShuffle) {
        const randomSong = getRandomSong();
        if (randomSong) {
          await playSong(randomSong);
        }
        return;
      }

      // Check if current song is in queue
      const currentQueueIndex = queuedSongs.findIndex(
        (s) => s.id === currentSong?.id
      );

      if (queuedSongs.length > 0) {
        let nextSong;
        let newQueue;

        if (currentQueueIndex === -1) {
          // Current song not in queue, play first queued song
          nextSong = queuedSongs[0];
          newQueue = queuedSongs.slice(1);
        } else if (currentQueueIndex + 1 < queuedSongs.length) {
          // Play next song in queue
          nextSong = queuedSongs[currentQueueIndex + 1];
          newQueue = queuedSongs.slice(currentQueueIndex + 1);
        } else {
          // End of queue reached, find current song in all songs and play next
          const currentAllSongsIndex = allSongs.findIndex(
            (s) => s.id === currentSong.id
          );
          const nextIndex = (currentAllSongsIndex + 1) % allSongs.length;
          nextSong = allSongs[nextIndex];
          newQueue = [];
        }

        const success = await playSong(nextSong, true);
        if (success) {
          setQueuedSongs(newQueue);
        }
      } else {
        // No queue, play from all songs
        const currentIndex = allSongs.findIndex((s) => s.id === currentSong.id);
        if (currentIndex > -1) {
          // Always go to next song, wrapping around to beginning if at end
          const nextIndex = (currentIndex + 1) % allSongs.length;
          await playSong(allSongs[nextIndex], false);
        }
      }
    } catch (error) {
      console.error("Error in playNext:", error);
      setLoading(null);
    }
  };

  const playPrevious = async () => {
    try {
      // Check if current song is in queue
      const currentQueueIndex = queuedSongs.findIndex(
        (s) => s.id === currentSong?.id
      );

      if (currentQueueIndex !== -1 || queuedSongs.length > 0) {
        // If song is in queue or queue exists, just restart current song
        audioRef.current.currentTime = 0;
        if (!isPlaying) {
          await audioRef.current.play();
          setIsPlaying(true);
        }
        return;
      }

      // If not in queue, handle navigation through all songs list
      const currentIndex = allSongs.findIndex((s) => s.id === currentSong.id);
      if (currentIndex > -1) {
        // If it's the first song, go to the last song
        const prevIndex =
          currentIndex === 0 ? allSongs.length - 1 : currentIndex - 1;
        await playSong(allSongs[prevIndex], false);
      }
    } catch (error) {
      console.error("Error in playPrevious:", error);
      setLoading(null);
    }
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
  }, [repeatMode, currentSong]);

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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };

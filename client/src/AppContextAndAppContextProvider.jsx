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

  const playSong = async (song, isFromQueue = false) => {
    try {
      console.log(
        "PlaySong called with:",
        song.name,
        "isFromQueue:",
        isFromQueue
      );
      setLoading({ text: "Loading Song..." });

      // Stop current playback
      audioRef.current.pause();
      audioRef.current.src = "";
      setIsPlaying(false);

      // Load song details if needed
      if (!song.lyricsAndImages) {
        console.log("Fetching lyrics and trivia for:", song.name);
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
          console.log("Audio loaded successfully");
          resolve();
        };
        audioRef.current.onerror = (e) => {
          console.error("Audio load error:", e);
          reject(e);
        };
        audioRef.current.load();
      });

      // Update states after audio is loaded
      console.log("Updating states for:", song.name);
      setCurrentSong(song);
      addToRecentlyPlayed(song);

      // Play the audio
      await audioRef.current.play();
      setIsPlaying(true);

      // Handle queue after successful play
      if (isFromQueue) {
        console.log("Removing from queue:", song.name);
        setQueuedSongs((prev) => {
          const newQueue = prev.filter((s) => s.id !== song.id);
          console.log("New queue length:", newQueue.length);
          return newQueue;
        });
      }

      setLoading(null);
      return true;
    } catch (error) {
      console.error("Error in playSong:", error);
      setLoading(null);
      return false;
    }
  };

  const playNext = async () => {
    console.log("PlayNext called, current song:", currentSong?.name);
    console.log(
      "Current queue:",
      queuedSongs.map((s) => s.name)
    );
    console.log("Repeat mode:", repeatMode);

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
      } else {
        // First check if current song is in queue
        const currentQueueIndex = queuedSongs.findIndex(
          (s) => s.id === currentSong?.id
        );
        console.log("Current queue index:", currentQueueIndex);

        if (currentQueueIndex !== -1) {
          // Currently playing a queued song
          console.log("Current song is in queue");
          if (currentQueueIndex + 1 < queuedSongs.length) {
            // There's a next song in queue
            const nextSong = queuedSongs[currentQueueIndex + 1];
            console.log("Playing next queued song:", nextSong.name);
            const success = await playSong(nextSong, true);
            if (success) {
              // Remove only the current song from queue
              setQueuedSongs((prev) =>
                prev.filter((s) => s.id !== currentSong.id)
              );
            }
          } else {
            // No more songs in queue, go back to all songs
            console.log("No more queued songs, going back to all songs");
            const allSongsIndex = allSongs.findIndex(
              (s) => s.id === currentSong.id
            );
            let nextIndex = (allSongsIndex + 1) % allSongs.length;

            // If we're at the end and repeat all is not enabled, stop
            if (nextIndex === 0 && repeatMode !== "all") {
              return;
            }

            await playSong(allSongs[nextIndex], false);
            setQueuedSongs((prev) =>
              prev.filter((s) => s.id !== currentSong.id)
            );
          }
        } else if (queuedSongs.length > 0) {
          // Not playing a queued song but queue exists
          console.log("Starting queue playback");
          const nextSong = queuedSongs[0];
          const success = await playSong(nextSong, true);
          if (success) {
            setQueuedSongs((prev) => prev.slice(1));
          }
        } else {
          // No queue, play from all songs
          console.log("Playing from all songs");
          const currentIndex = allSongs.findIndex(
            (s) => s.id === currentSong.id
          );
          if (currentIndex > -1) {
            let nextIndex = (currentIndex + 1) % allSongs.length;

            // If we're at the end and repeat all is not enabled, stop
            if (nextIndex === 0 && repeatMode !== "all") {
              return;
            }

            await playSong(allSongs[nextIndex], false);
          }
        }
      }
    } catch (error) {
      console.error("Error in playNext:", error);
      setLoading(null);
    }
  };

  const playPrevious = async () => {
    console.log("PlayPrevious called, current song:", currentSong?.name);
    console.log(
      "Current queue:",
      queuedSongs.map((s) => s.name)
    );

    try {
      // Check if the current song is in the recently played list
      const currentIndex = recentlyPlayed.findIndex(
        (s) => s.id === currentSong?.id
      );
      console.log("Current index in recently played:", currentIndex);

      if (currentIndex > 0) {
        // There's a song before the current song in the recently played list
        const previousSong = recentlyPlayed[currentIndex - 1];
        console.log(
          "Playing previous song from recently played:",
          previousSong.name
        );

        // Add the previous song to the beginning of the queue
        setQueuedSongs((prev) => [previousSong, ...prev]);

        // Play the previous song from the queue
        await playSong(previousSong, true);
      } else {
        // The current song is the first in the recently played list, so play it again
        console.log("Playing current song again");
        await playSong(currentSong, true);
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

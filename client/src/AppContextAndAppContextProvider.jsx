import { createContext, useState, useRef } from "react";

const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [songProgress, setSongProgress] = useState(0);
  const [songData, setSongData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <AppContext.Provider
      value={{
        songProgress,
        setSongProgress,
        songData,
        setSongData,
        loading,
        setLoading,
        error,
        setError,
        isPlaying,
        setIsPlaying,
        audioRef,
        togglePlayPause,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };

import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";

import { AppContext } from "../AppContextAndAppContextProvider";

import "./Footer.css";

export default function Footer() {
  const {
    allSongs,
    currentSong,
    setSongProgress,
    isPlaying,
    audioRef,
    togglePlayPause,
    playNext,
    playPrevious,
    toggleShuffle,
    toggleRepeat,
    isShuffle,
    repeatMode,
    volume,
    setVolume,
    toggleMute,
  } = useContext(AppContext);

  const [progress, setProgress] = useState(0);

  const handleNext = async () => {
    const currentIndex = allSongs?.findIndex(
      (song) => song.id === currentSong?.id
    );
    console.log("Before Next:", {
      currentSongName: currentSong?.name,
      currentIndex,
      totalSongs: allSongs?.length,
      nextSongWouldBe: allSongs?.[(currentIndex + 1) % allSongs.length]?.name,
    });
    await playNext();
  };

  const handlePrevious = async () => {
    const currentIndex = allSongs?.findIndex(
      (song) => song.id === currentSong?.id
    );
    console.log("Before Previous:", {
      currentSongName: currentSong?.name,
      currentIndex,
      totalSongs: allSongs?.length,
      previousSongWouldBe:
        allSongs?.[currentIndex === 0 ? allSongs.length - 1 : currentIndex - 1]
          ?.name,
    });
    await playPrevious();
  };

  useEffect(() => {
    if (currentSong) {
      const audio = audioRef.current;

      const handleTimeUpdate = () => {
        setProgress((audio.currentTime / audio.duration) * 100 || 0);
        setSongProgress(audio.currentTime);
      };

      audio.addEventListener("timeupdate", handleTimeUpdate);
      return () => audio.removeEventListener("timeupdate", handleTimeUpdate);
    }
  }, [currentSong, audioRef]);

  const handleVolumeChange = (e) => {
    const value = Number(e.target.value);
    setVolume(value);
  };

  const handleProgressChange = (e) => {
    const value = Number(e.target.value);
    const time = (value / 100) * audioRef.current.duration;
    audioRef.current.currentTime = time;
    setProgress(value);
    setSongProgress(audioRef.current);
  };

  // Log current song state when it changes
  useEffect(() => {
    if (currentSong) {
      console.log("Current Song Updated:", {
        name: currentSong.name,
        id: currentSong.id,
        index: allSongs?.findIndex((song) => song.id === currentSong.id),
        audioSrc: audioRef.current.src,
      });
    }
  }, [currentSong, allSongs]);

  return (
    currentSong && (
      <footer className="footer">
        <input
          className="slider"
          type="range"
          min="0"
          max="100"
          value={progress}
          onInput={handleProgressChange}
          style={{
            background: `linear-gradient(to right, #bb6bfc ${progress}%, #1e1e1e ${progress}%)`,
          }}
        />
        <div className="allcontrols">
          <Link to={`/musicplayer/` + currentSong.id} className="songinfo">
            <img
              className="albumcover"
              src={currentSong.album_art_url}
              alt={"Album Cover"}
            ></img>
            <div className="songdetails">
              <span className="songname">{currentSong.name}</span>
              <span className="artists">{currentSong.artist}</span>
            </div>
          </Link>
          <div className="mediacontrols">
            <svg
              fill="CurrentColor"
              version="1.1"
              id="Ebene_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              width="64px"
              height="64px"
              viewBox="0 0 64.00 64.00"
              enableBackground="new 0 0 64 64"
              xmlSpace="preserve"
              stroke="#e1e1e1"
              strokeWidth="0.5"
              onClick={toggleShuffle}
              className={`footericonsmall ${isShuffle ? "active" : ""}`}
              data-tooltip={isShuffle ? "Disable shuffle" : "Enable shuffle"}
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                {" "}
                <g>
                  {" "}
                  <path d="M63.909,15.436c-0.02-0.067-0.035-0.135-0.062-0.2c-0.029-0.068-0.068-0.131-0.104-0.195 c-0.027-0.05-0.049-0.102-0.08-0.148c-0.074-0.11-0.158-0.214-0.251-0.307l-7.999-7.999c-0.781-0.781-2.047-0.781-2.828,0 s-0.781,2.047,0,2.828L57.172,14h-10l-32,32H2c-1.104,0-2,0.896-2,2s0.896,2,2,2h14.828l32-32h8.344l-4.586,4.586 c-0.781,0.781-0.781,2.047,0,2.828C52.977,25.805,53.488,26,54,26s1.023-0.195,1.414-0.586l7.999-7.999 c0.093-0.093,0.177-0.196,0.251-0.307c0.031-0.047,0.053-0.099,0.08-0.148c0.035-0.064,0.074-0.127,0.104-0.195 c0.026-0.065,0.042-0.133,0.062-0.2c0.017-0.058,0.039-0.113,0.052-0.173c0.051-0.259,0.051-0.524,0-0.783 C63.948,15.549,63.926,15.493,63.909,15.436z"></path>{" "}
                  <path d="M63.848,48.765c0.026-0.065,0.042-0.133,0.062-0.2c0.017-0.058,0.039-0.113,0.052-0.173c0.051-0.259,0.051-0.524,0-0.783 c-0.013-0.06-0.035-0.115-0.052-0.173c-0.02-0.067-0.035-0.135-0.062-0.2c-0.029-0.068-0.068-0.131-0.104-0.195 c-0.027-0.05-0.049-0.102-0.08-0.148c-0.074-0.11-0.158-0.214-0.251-0.307l-7.999-7.999c-0.781-0.781-2.047-0.781-2.828,0 s-0.781,2.047,0,2.828L57.172,46h-8.344l-9.414-9.414c-0.781-0.781-2.047-0.781-2.828,0s-0.781,2.047,0,2.828L47.172,50h10 l-4.586,4.586c-0.781,0.781-0.781,2.047,0,2.828C52.977,57.805,53.488,58,54,58s1.023-0.195,1.414-0.586l7.999-7.999 c0.093-0.093,0.177-0.196,0.251-0.307c0.031-0.047,0.053-0.099,0.08-0.148C63.779,48.896,63.818,48.833,63.848,48.765z"></path>{" "}
                  <path d="M2,18h13.172l9.414,9.414C24.977,27.805,25.488,28,26,28s1.023-0.195,1.414-0.586c0.781-0.781,0.781-2.047,0-2.828 L16.828,14H2c-1.104,0-2,0.896-2,2S0.896,18,2,18z"></path>{" "}
                </g>{" "}
              </g>
            </svg>
            <svg
              className="footericon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              onClick={handlePrevious}
              data-tooltip="Previous track"
            >
              <path d="M9.195 18.44c1.25.714 2.805-.189 2.805-1.629v-2.34l6.945 3.968c1.25.715 2.805-.188 2.805-1.628V8.69c0-1.44-1.555-2.343-2.805-1.628L12 11.029v-2.34c0-1.44-1.555-2.343-2.805-1.628l-7.108 4.061c-1.26.72-1.26 2.536 0 3.256l7.108 4.061Z" />
            </svg>
            {isPlaying ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="footericon"
                onClick={togglePlayPause}
                data-tooltip={isPlaying ? "Pause" : "Play"}
              >
                <path
                  fillRule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM9 8.25a.75.75 0 0 0-.75.75v6c0 .414.336.75.75.75h.75a.75.75 0 0 0 .75-.75V9a.75.75 0 0 0-.75-.75H9Zm5.25 0a.75.75 0 0 0-.75.75v6c0 .414.336.75.75.75H15a.75.75 0 0 0 .75-.75V9a.75.75 0 0 0-.75-.75h-.75Z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="footericon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                onClick={togglePlayPause}
                data-tooltip={isPlaying ? "Pause" : "Play"}
              >
                <path
                  fillRule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm14.024-.983a1.125 1.125 0 0 1 0 1.966l-5.603 3.113A1.125 1.125 0 0 1 9 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113Z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="footericon"
              onClick={handleNext}
              data-tooltip="Next track"
            >
              <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.346 12 7.249 12 8.689v2.34L5.055 7.061Z" />
            </svg>
            {repeatMode === "none" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="footericonsmall"
                onClick={toggleRepeat}
              >
                <path
                  fillRule="evenodd"
                  d="M12 5.25c1.213 0 2.415.046 3.605.135a3.256 3.256 0 0 1 3.01 3.01c.044.583.077 1.17.1 1.759L17.03 8.47a.75.75 0 1 0-1.06 1.06l3 3a.75.75 0 0 0 1.06 0l3-3a.75.75 0 0 0-1.06-1.06l-1.752 1.751c-.023-.65-.06-1.296-.108-1.939a4.756 4.756 0 0 0-4.392-4.392 49.422 49.422 0 0 0-7.436 0A4.756 4.756 0 0 0 3.89 8.282c-.017.224-.033.447-.046.672a.75.75 0 1 0 1.497.092c.013-.217.028-.434.044-.651a3.256 3.256 0 0 1 3.01-3.01c1.19-.09 2.392-.135 3.605-.135Zm-6.97 6.22a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.752-1.751c.023.65.06 1.296.108 1.939a4.756 4.756 0 0 0 4.392 4.392 49.413 49.413 0 0 0 7.436 0 4.756 4.756 0 0 0 4.392-4.392c.017-.223.032-.447.046-.672a.75.75 0 0 0-1.497-.092c-.013.217-.028.434-.044.651a3.256 3.256 0 0 1-3.01 3.01 47.953 47.953 0 0 1-7.21 0 3.256 3.256 0 0 1-3.01-3.01 47.759 47.759 0 0 1-.1-1.759L6.97 15.53a.75.75 0 0 0 1.06-1.06l-3-3Z"
                  clipRule="evenodd"
                />
              </svg>
            ) : repeatMode === "one" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="footericonsmall active"
                onClick={toggleRepeat}
                data-tooltip={
                  repeatMode === "none"
                    ? "Enable repeat"
                    : repeatMode === "one"
                    ? "Repeat all"
                    : "Disable repeat"
                }
              >
                <path d="M12.97 3.97a.75.75 0 0 1 1.06 0l2.5 2.5a.75.75 0 0 1 0 1.06l-2.5 2.5a.75.75 0 1 1-1.06-1.06l1.72-1.72h-3.44a3.75 3.75 0 0 0-3.75 3.75v.75a.75.75 0 0 1-1.5 0v-.75a5.25 5.25 0 0 1 5.25-5.25h3.44l-1.72-1.72a.75.75 0 0 1 0-1.06ZM11.03 20.03a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 0 1 0-1.06l2.5-2.5a.75.75 0 1 1 1.06 1.06l-1.72 1.72h3.44a3.75 3.75 0 0 0 3.75-3.75v-.75a.75.75 0 0 1 1.5 0v.75a5.25 5.25 0 0 1-5.25 5.25h-3.44l1.72 1.72a.75.75 0 0 1 0 1.06Z" />
                <text
                  x="12"
                  y="14"
                  textAnchor="middle"
                  fontSize="8"
                  fill="currentColor"
                  className="active"
                >
                  1
                </text>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="footericonsmall active"
                onClick={toggleRepeat}
                data-tooltip={
                  repeatMode === "none"
                    ? "Enable repeat"
                    : repeatMode === "one"
                    ? "Repeat all"
                    : "Disable repeat"
                }
              >
                <path
                  fillRule="evenodd"
                  d="M12 5.25c1.213 0 2.415.046 3.605.135a3.256 3.256 0 0 1 3.01 3.01c.044.583.077 1.17.1 1.759L17.03 8.47a.75.75 0 1 0-1.06 1.06l3 3a.75.75 0 0 0 1.06 0l3-3a.75.75 0 0 0-1.06-1.06l-1.752 1.751c-.023-.65-.06-1.296-.108-1.939a4.756 4.756 0 0 0-4.392-4.392 49.422 49.422 0 0 0-7.436 0A4.756 4.756 0 0 0 3.89 8.282c-.017.224-.033.447-.046.672a.75.75 0 1 0 1.497.092c.013-.217.028-.434.044-.651a3.256 3.256 0 0 1 3.01-3.01c1.19-.09 2.392-.135 3.605-.135Zm-6.97 6.22a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.752-1.751c.023.65.06 1.296.108 1.939a4.756 4.756 0 0 0 4.392 4.392 49.413 49.413 0 0 0 7.436 0 4.756 4.756 0 0 0 4.392-4.392c.017-.223.032-.447.046-.672a.75.75 0 0 0-1.497-.092c-.013.217-.028.434-.044.651a3.256 3.256 0 0 1-3.01 3.01 47.953 47.953 0 0 1-7.21 0 3.256 3.256 0 0 1-3.01-3.01 47.759 47.759 0 0 1-.1-1.759L6.97 15.53a.75.75 0 0 0 1.06-1.06l-3-3Z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <div className="volumecontrols">
            <button
              className="mutebutton"
              onClick={toggleMute}
              aria-label={volume === 0 ? "Unmute" : "Mute"}
            >
              {volume === 0 ? (
                <svg
                  className="footericon"
                  enable-background="new 0 0 50 50"
                  height="50px"
                  id="Layer_1"
                  version="1.1"
                  viewBox="0 0 50 50"
                  width="50px"
                  xml:space="preserve"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                >
                  <line
                    fill="none"
                    stroke="#bb6bfc"
                    stroke-linecap="round"
                    stroke-miterlimit="10"
                    stroke-width="2"
                    x1="32"
                    x2="42"
                    y1="20"
                    y2="30"
                  />
                  <line
                    fill="none"
                    stroke="#bb6bfc"
                    stroke-linecap="round"
                    stroke-miterlimit="10"
                    stroke-width="2"
                    x1="42"
                    x2="32"
                    y1="20"
                    y2="30"
                  />
                  <rect fill="none" height="50" width="50" />
                  <rect fill="none" height="50" width="50" />
                  <path
                    d="M10,33H3  c-1.103,0-2-0.898-2-2V19c0-1.102,0.897-2,2-2h7"
                    fill="none"
                    stroke="#bb6bfc"
                    stroke-linejoin="round"
                    stroke-miterlimit="10"
                    stroke-width="2.08"
                  />
                  <path
                    d="M9.604,32.43  C9.256,32.129,9,31.391,9,30.754V19.247c0-0.637,0.256-1.388,0.604-1.689L22.274,4.926C23.905,3.27,26,3.898,26,6.327v36.988  c0,2.614-1.896,3.604-3.785,1.686L9.604,32.43z"
                    fill="none"
                    stroke="#bb6bfc"
                    stroke-linejoin="round"
                    stroke-miterlimit="10"
                    stroke-width="1.9797"
                  />
                </svg>
              ) : volume > 50 ? (
                <svg
                  className="footericon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
                  <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
                </svg>
              ) : (
                <svg
                  className="footericon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
                </svg>
              )}
            </button>
            <input
              className="slider"
              type="range"
              min="0"
              max="100"
              value={volume}
              onInput={handleVolumeChange}
              style={{
                background: `linear-gradient(to right, var(--purple) ${volume}%, var(--lightgrey) ${volume}%)`,
              }}
            />
          </div>
        </div>
      </footer>
    )
  );
}

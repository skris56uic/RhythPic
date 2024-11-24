import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";

import { fetchSongData } from "../api/api";
import { AppContext } from "../AppContextAndAppContextProvider";

import "./Dashboard.css";

export default function Dashboard() {
  const {
    songData,
    setSongData,
    loading,
    setLoading,
    error,
    setError,
    audioRef,
  } = useContext(AppContext);

  const [songs, setSongs] = useState([]);
  const [loadingSongs, setLoadingSongs] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await fetch("http://localhost:3000/songs");
        if (!response.ok) {
          throw new Error("Failed to fetch songs");
        }
        const data = await response.json();
        setSongs(data.songs);
      } catch (error) {
        console.error("Error fetching songs:", error);
      } finally {
        setLoadingSongs(false);
      }
    };

    fetchSongs();
  }, []);

  function generateSongTiles(from = 0, to = 5) {
    const generatedSongTiles = [];
    for (let i = from; i < to; i++) {
      generatedSongTiles.push(
        <Link
          to="/musicplayer"
          key={songs[i].id}
          className="songtile"
          onClick={() => handleSongClick(songs[i].id)}
        >
          <img
            className="songimages"
            src={songs[i].album_art_url}
            alt={`${songs[i].name}\n${songs[i].artist}`}
          ></img>
          <div className="songdetails">
            <span className="songname">{songs[i].name}</span>
            <span className="artists">{songs[i].artist}</span>
          </div>
        </Link>
      );
    }

    return generatedSongTiles;
  }

  function geneerateQueueListItems() {
    const queueListItems = [];
    for (let i = 0; i < songs.length; i++) {
      queueListItems.push(
        <Link
          to="/musicplayer"
          key={songs[i].id}
          className="queueListitem"
          onClick={() => handleSongClick(songs[i].id)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="playicon"
          >
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm14.024-.983a1.125 1.125 0 0 1 0 1.966l-5.603 3.113A1.125 1.125 0 0 1 9 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113Z"
              clipRule="evenodd"
            />
          </svg>
          <div className="songdetails">
            <span className="songname">{songs[i].name}</span>
            <span className="artists">{songs[i].artist}</span>
          </div>
        </Link>
      );
    }

    return queueListItems;
  }

  const handleSongClick = async (songId) => {
    const song = songs.find((s) => s.id === songId);
    if (song) {
      const reply = await fetchSongData(songId);
      audioRef.current.src = `http://localhost:3000/audio?id=${songId}`;
      audioRef.current.load();
      setLoading(true);
      setError(null);
      setSongData(reply);
    }
  };

  return (
    <div
      className="dashboard"
      style={{
        height: `${
          songData
            ? "calc(100vh - (var(--footerheight) + var(--navbarheight)))"
            : "calc(100vh - (var(--navbarheight)))"
        }`,
      }}
    >
      <div className="playlists">
        <h2>Recently Played</h2>
        {loading && <div className="loading">Loading songs...</div>}

        {error && <div className="error">Error: {error}</div>}
        <div className="songlist">
          {songs.length && generateSongTiles(0, 5)}
          <div className="emptysongtile">
            <svg
              className="tileicon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <h2>All Songs</h2>
        <div className="songlist">
          {songs.length && generateSongTiles(5, 10)}
          <div className="emptysongtile">
            <svg
              className="tileicon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <h2>Playlists</h2>
        <div className="songlist">
          {songs.length && generateSongTiles(10, 13)}
          <div className="emptysongtile">
            <svg
              className="tileicon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
      <div className="queuedsongs">
        <h2 className="title">Queued Songs</h2>
        {songs.length && geneerateQueueListItems()}
      </div>
    </div>
  );
}

import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";

import { fetchSongLyrics, fetchSongTrivia } from "../api/api";
import { AppContext } from "../AppContextAndAppContextProvider";
import Loader from "./Loader";

import "./Dashboard.css";

export default function Dashboard() {
  const {
    allSongs,
    setAllSongs,
    currentSong,
    setCurrentSong,
    loading,
    setLoading,
    audioRef,
  } = useContext(AppContext);

  function generateSongTiles(from = 0, to = 5) {
    const generatedSongTiles = [];
    for (let i = from; i < to; i++) {
      generatedSongTiles.push(
        <Link
          to="/musicplayer"
          key={allSongs[i].id}
          className="songtile"
          onClick={() => handleSongClick(allSongs[i].id)}
        >
          <img
            className="songimages"
            src={allSongs[i].album_art_url}
            alt={`${allSongs[i].name}\n${allSongs[i].artist}`}
          ></img>
          <div className="songdetails">
            <span className="songname">{allSongs[i].name}</span>
            <span className="artists">{allSongs[i].artist}</span>
          </div>
        </Link>
      );
    }

    return generatedSongTiles;
  }

  function geneerateQueueListItems() {
    const queueListItems = [];
    for (let i = 0; i < allSongs.length; i++) {
      queueListItems.push(
        <Link
          to="/musicplayer"
          key={allSongs[i].id}
          className="queueListitem"
          onClick={() => handleSongClick(allSongs[i].id)}
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
            <span className="songname">{allSongs[i].name}</span>
            <span className="artists">{allSongs[i].artist}</span>
          </div>
        </Link>
      );
    }

    return queueListItems;
  }

  const handleSongClick = async (songId) => {
    setLoading({ text: "Fetching Song Details ..." });

    if (!allSongs.find((song) => song.id === songId).lyricsAndImages) {
      //console.log("data not in app, fetching data from server");

      const lyrics = await fetchSongLyrics(songId);

      const trivia = await fetchSongTrivia(lyrics.fileName);

      const newAllSongs = allSongs.map((song) =>
        song.id === songId
          ? {
              ...song,
              fileName: lyrics.fileName,
              lyricsAndImages: lyrics.isong.lines,
              trivia: trivia.description,
            }
          : song
      );

      setAllSongs(newAllSongs);

      setCurrentSong(newAllSongs.find((song) => song.id === songId));

      audioRef.current.src = `http://localhost:3000/audio?id=${songId}`;
      audioRef.current.load();

      setLoading(null);
    } else {
      // console.log("data already in app, no need to fetch from server");

      setCurrentSong(allSongs.find((song) => song.id === songId));

      setLoading(null);
    }
  };

  return loading ? (
    <Loader />
  ) : (
    <div
      className="dashboard"
      style={{
        height: `${
          currentSong
            ? "calc(100vh - (var(--footerheight) + var(--navbarheight)))"
            : "calc(100vh - (var(--navbarheight)))"
        }`,
      }}
    >
      <div className="playlists">
        <h2>Recently Played</h2>

        <div className="songlist">
          {allSongs.length && generateSongTiles(0, 5)}
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
          {allSongs.length && generateSongTiles(5, 10)}
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
        <h2>Favourites</h2>
        <div className="songlist">
          {allSongs.length && generateSongTiles(10, 13)}
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
        {allSongs.length && geneerateQueueListItems()}
      </div>
    </div>
  );
}

import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AppContext } from "../AppContextAndAppContextProvider";
import Loader from "./Loader";

import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    allSongs,
    setAllSongs,
    currentSong,
    loading,
    queuedSongs = [], // Provide default empty array
    addToQueue,
    removeFromQueue,
    playQueuedSong,
    recentlyPlayed = [], // Provide default empty array
    setIsPlaying,
  } = useContext(AppContext);

  function handleFavouriteClick(songId) {
    if (!allSongs) return;

    const updatedSongs = allSongs.map((song) => {
      if (song.id === songId) {
        return { ...song, favourite: !song.favourite };
      }
      return song;
    });

    setAllSongs(updatedSongs);

    if (localStorage.getItem("favourites")) {
      const favourites = JSON.parse(localStorage.getItem("favourites"));
      if (favourites.includes(songId)) {
        const updatedFavourites = favourites.filter((id) => id !== songId);
        localStorage.setItem("favourites", JSON.stringify(updatedFavourites));
      } else {
        localStorage.setItem(
          "favourites",
          JSON.stringify([...favourites, songId])
        );
      }
    } else {
      localStorage.setItem("favourites", JSON.stringify([songId]));
    }
  }

  async function handleQueueItemClick(song) {
    await playQueuedSong(song);
    navigate(`/musicplayer/${song.id}`);
  }

  function handleRemoveFromQueue(e, songId) {
    e.stopPropagation();
    removeFromQueue(songId);
  }

  function generateSongTiles(songs) {
    if (!songs || !songs.length) return null;

    return songs.map((song) => (
      <Link to={`/musicplayer/${song.id}`} key={song.id} className="songtile">
        <img
          className="songimages"
          src={song.album_art_url}
          alt={`${song.name}\n${song.artist}`}
        />
        <div className="songdetails">
          <span className="songname">{song.name}</span>
          <span className="artists">{song.artist}</span>
        </div>
        <div className="song-actions">
          <button
            className="dashboardfavouritesbutton"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleFavouriteClick(song.id);
            }}
            title={
              song.favourite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <svg
              className={
                `dashboardfavouritesicon` +
                (song.favourite ? " dashboardfavouritesiconactive" : "")
              }
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
            </svg>
          </button>
          <button
            className={`add-to-queue-button ${
              queuedSongs.some((queuedSong) => queuedSong.id === song.id)
                ? "in-queue"
                : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToQueue(song);
            }}
            title={
              queuedSongs.some((queuedSong) => queuedSong.id === song.id)
                ? "Already in queue"
                : "Add to queue"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`queue-icon ${
                queuedSongs.some((queuedSong) => queuedSong.id === song.id)
                  ? "in-queue"
                  : ""
              }`}
            >
              <path d="M6 3a3 3 0 00-3 3v2.25a3 3 0 003 3h2.25a3 3 0 003-3V6a3 3 0 00-3-3H6zM15.75 3a3 3 0 00-3 3v2.25a3 3 0 003 3H18a3 3 0 003-3V6a3 3 0 00-3-3h-2.25zM6 12.75a3 3 0 00-3 3V18a3 3 0 003 3h2.25a3 3 0 003-3v-2.25a3 3 0 00-3-3H6zM17.625 13.5a.75.75 0 00-1.5 0v2.625H13.5a.75.75 0 000 1.5h2.625v2.625a.75.75 0 001.5 0v-2.625h2.625a.75.75 0 000-1.5h-2.625V13.5z" />
            </svg>
          </button>
        </div>
      </Link>
    ));
  }

  function generateQueueListItems() {
    // Ensure queuedSongs exists and has length property
    if (!queuedSongs || !queuedSongs.length) {
      return <div className="no-songs">No songs in queue</div>;
    }

    return queuedSongs.map((song) => (
      <div
        className="queueListitem"
        key={song.id}
        onClick={() => handleQueueItemClick(song)}
        style={{ cursor: "pointer" }}
      >
        <img
          className="queue-song-image"
          src={song.album_art_url}
          alt={song.name}
        />
        <div className="songdetails">
          <span className="songname">{song.name}</span>
          <span className="artists">{song.artist}</span>
        </div>
        <button
          className="remove-from-queue"
          onClick={(e) => handleRemoveFromQueue(e, song.id)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="remove-icon"
          >
            <path
              fillRule="evenodd"
              d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    ));
  }

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
          {recentlyPlayed?.length > 0 ? (
            generateSongTiles(recentlyPlayed)
          ) : (
            <div>No recently played songs</div>
          )}
        </div>
        <h2>All Songs</h2>
        <div className="songlist">
          {allSongs?.length > 0 ? generateSongTiles(allSongs) : null}
        </div>
      </div>
      <div className="queuedsongs">
        <h2 className="title">Queued Songs</h2>
        {generateQueueListItems()}
      </div>
    </div>
  );
}

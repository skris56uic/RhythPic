import { useContext } from "react";
import { Link } from "react-router-dom";

import { AppContext } from "../AppContextAndAppContextProvider";
import Loader from "./Loader";

import "./favourites.css";

export default function Favourites() {
  const { allSongs, setAllSongs, currentSong, loading } =
    useContext(AppContext);

  function handleFavouriteClick(songId) {
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

  function generateFavouriteSongTiles() {
    const generatedFavouriteSongTiles = [];
    for (let i = 0; i < allSongs.length; i++) {
      if (!allSongs[i].favourite) continue;
      generatedFavouriteSongTiles.push(
        <Link
          to={`/musicplayer/${allSongs[i].id}`}
          key={allSongs[i].id}
          className="songtile"
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

          <button className="favouritesfavouritesbutton">
            <svg
              className={
                `favouritesfavouritesicon` +
                (allSongs[i].favourite ? " favouritesfavouritesiconactive" : "")
              }
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleFavouriteClick(allSongs[i].id);
              }}
            >
              <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
            </svg>
          </button>
        </Link>
      );
    }

    return generatedFavouriteSongTiles;
  }

  return loading ? (
    <Loader />
  ) : (
    <>
      {allSongs && (
        <div
          className="favouritesdashboard"
          style={{
            height: `${
              currentSong
                ? "calc(100vh - (var(--footerheight) + var(--navbarheight)))"
                : "calc(100vh - (var(--navbarheight)))"
            }`,
          }}
        >
          <div>
            <h2>Favourites</h2>
            <div className="favouritessonglist">
              {allSongs.length &&
                (generateFavouriteSongTiles().length === 0 ? (
                  <div>No songs found</div>
                ) : (
                  generateFavouriteSongTiles()
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

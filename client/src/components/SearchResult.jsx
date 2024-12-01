import { useContext } from "react";
import { useParams, Link } from "react-router-dom";

import { AppContext } from "../AppContextAndAppContextProvider";
import Loader from "./Loader";

import "./SearchResult.css";

export default function SearchResult() {
  const { searchvalue } = useParams();
  const { currentSong, allSongs, setAllSongs, loading } =
    useContext(AppContext);

  function handleFavouriteClick(songId) {
    const updatedSongs = allSongs.map((song) => {
      if (song.id === songId) {
        return { ...song, favourite: !song.favourite };
      }
      return song;
    });

    setAllSongs(updatedSongs);
  }

  const filteredSongs =
    Array.isArray(allSongs) && searchvalue.trim() !== ""
      ? allSongs.filter(
          (song) =>
            song.name.toLowerCase().includes(searchvalue.toLowerCase()) ||
            song.artist.toLowerCase().includes(searchvalue.toLowerCase())
        )
      : [];

  function generateSongTiles(from = 0, to = filteredSongs.length) {
    const generatedSongTiles = [];
    for (let i = from; i < to; i++) {
      generatedSongTiles.push(
        <Link
          to={`/musicplayer/${filteredSongs[i].id}`}
          key={filteredSongs[i].id}
          className="searchsongtile"
        >
          <img
            className="searchsongimages"
            src={filteredSongs[i].album_art_url}
            alt={`${filteredSongs[i].name}\n${filteredSongs[i].artist}`}
          ></img>
          <div className="searchsongdetails">
            <span className="searchsongname">{filteredSongs[i].name}</span>
            <span className="searchartists">{filteredSongs[i].artist}</span>
          </div>
          <button className="searchfavouritesbutton">
            <svg
              className={
                `searchfavouritesicon` +
                (filteredSongs[i].favourite
                  ? " searchfavouritesiconactive"
                  : "")
              }
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleFavouriteClick(filteredSongs[i].id);
              }}
            >
              <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
            </svg>
          </button>
        </Link>
      );
    }

    return generatedSongTiles;
  }

  return loading ? (
    <Loader />
  ) : (
    <>
      {allSongs && (
        <div
          className="searchdashboard"
          style={{
            height: `${
              currentSong
                ? "calc(100vh - (var(--footerheight) + var(--navbarheight)))"
                : "calc(100vh - (var(--navbarheight)))"
            }`,
          }}
        >
          <div>
            <h2>Songs matching {searchvalue}...</h2>
            <div className="searchsonglist">
              {filteredSongs.length === 0 ? (
                <div>No songs found</div>
              ) : (
                generateSongTiles(0, filteredSongs.length)
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

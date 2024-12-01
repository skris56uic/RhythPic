import { useContext } from "react";
import { useParams, Link } from "react-router-dom";

import { AppContext } from "../AppContextAndAppContextProvider";

import "./SearchResult.css";

export default function SearchResult() {
  const { searchvalue } = useParams();
  const { currentSong, allSongs } = useContext(AppContext);

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
          onClick={() => handleSongClick(filteredSongs[i].id)}
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
        </Link>
      );
    }

    return generatedSongTiles;
  }

  return (
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
  );
}

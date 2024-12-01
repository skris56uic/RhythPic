import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from "react-router-dom";
import { AppContext } from '../AppContextAndAppContextProvider';

export default function SearchResult() {
    const { searchvalue } = useParams();
    const {allSongs} = useContext(AppContext);

    const filteredSongs = Array.isArray(allSongs) && searchvalue.trim() !== ""
      ? allSongs.filter((song) =>
          song.name.toLowerCase().includes(searchvalue.toLowerCase()) || song.artist.toLowerCase().includes(searchvalue.toLowerCase())
        )
      : [];
  
    function generateSongTiles(from = 0, to = filteredSongs.length) {
        const generatedSongTiles = [];
        for (let i = from; i < to; i++) {
          generatedSongTiles.push(
            <Link
              to={`/musicplayer/${filteredSongs[i].id}`}
              key={filteredSongs[i].id}
              className="songtile"
              onClick={() => handleSongClick(filteredSongs[i].id)}
            >
              <img
                className="songimages"
                src={filteredSongs[i].album_art_url}
                alt={`${filteredSongs[i].name}\n${filteredSongs[i].artist}`}
              ></img>
              <div className="songdetails">
                <span className="songname">{filteredSongs[i].name}</span>
                <span className="artists">{filteredSongs[i].artist}</span>
              </div>
            </Link>
          );
        }
    
        return generatedSongTiles;
      }
    return (
        <div classname="searchresult">
            <div className="songlist">
              {filteredSongs.length === 0 && (
                <div className="no-results-popup">
                  No songs found
                </div>
              )} 
              {filteredSongs.length && generateSongTiles(0, filteredSongs.length)}
            </div>
        </div>
        

    );

}
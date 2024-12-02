import { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";

import SidePanel from "./SidePanel";
import MainPanel from "./MainPanel";
import { AppContext } from "../AppContextAndAppContextProvider";
import { base_url, fetchSongLyrics, fetchSongTrivia } from "../api/api";

import "./MusicPlayer.css";
import Loader from "./Loader";

export default function MusicPlayer() {
  const {
    allSongs,
    setAllSongs,
    setCurrentSong,
    loading,
    setLoading,
    audioRef,
    addToRecentlyPlayed,
  } = useContext(AppContext);
  const { songid } = useParams();

  const [sidepanelstate, setsidepanelstate] = useState("closed");

  function opencloselyricspanel() {
    if (sidepanelstate === "closed") {
      setsidepanelstate("lyrics");
    } else if (sidepanelstate === "trivia") {
      setsidepanelstate("lyrics");
    } else {
      setsidepanelstate("closed");
    }
  }

  function openclosetriviapanel() {
    if (sidepanelstate === "closed") {
      setsidepanelstate("trivia");
    } else if (sidepanelstate === "lyrics") {
      setsidepanelstate("trivia");
    } else {
      setsidepanelstate("closed");
    }
  }

  useEffect(() => {
    console.log("musicplayer mounted");

    (async () => {
      if (allSongs && allSongs.length > 0) {
        const song = allSongs.find((song) => song.id === songid);
        if (song && !song.lyricsAndImages) {
          console.log("data not in app, fetching data from server");
          setLoading({ text: "Fetching Song Details ..." });

          const lyrics = await fetchSongLyrics(songid);

          const trivia = await fetchSongTrivia(lyrics.fileName);

          const newAllSongs = allSongs.map((song) =>
            song.id === songid
              ? {
                  ...song,
                  fileName: lyrics.fileName,
                  lyricsAndImages: lyrics.isong.lines,
                  trivia: trivia.description,
                }
              : song
          );

          setAllSongs(newAllSongs);

          const updatedSong = newAllSongs.find((song) => song.id === songid);
          setCurrentSong(updatedSong);
          addToRecentlyPlayed(updatedSong);

          audioRef.current.src = `${base_url}/audio?id=${songid}`;
          audioRef.current.load();

          setLoading(null);
        } else {
          console.log("data already in app, no need to fetch from server");

          setCurrentSong(song);
          addToRecentlyPlayed(song);

          audioRef.current.src = `${base_url}/audio?id=${songid}`;
          audioRef.current.load();

          setLoading(null);
        }
      }
    })();
  }, [songid, allSongs]);

  return loading ? (
    <Loader />
  ) : (
    <div className="musicplayer">
      <MainPanel
        width={sidepanelstate === "closed" ? 100 : 75}
        opencloselyricspanel={opencloselyricspanel}
        openclosetriviapanel={openclosetriviapanel}
        sidepanelstate={sidepanelstate}
      />
      <SidePanel
        width={sidepanelstate === "closed" ? 0 : 25}
        sidepanelstate={sidepanelstate}
      />
    </div>
  );
}

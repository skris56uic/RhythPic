import { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";

import SidePanel from "./SidePanel";
import MainPanel from "./MainPanel";
import { AppContext } from "../AppContextAndAppContextProvider";
import Loader from "./Loader";

import "./MusicPlayer.css";

export default function MusicPlayer() {
  const { allSongs, currentSong, loading, loadAndPlaySong } =
    useContext(AppContext);

  const { songid } = useParams();
  const [sidepanelstate, setsidepanelstate] = useState("closed");

  useEffect(() => {
    const initializeSong = async () => {
      if (!allSongs || !songid) return;

      // Only load if it's different from current song
      if (currentSong?.id !== songid) {
        const song = allSongs.find((s) => s.id === songid);
        if (song) {
          await loadAndPlaySong(song);
        }
      }
    };

    initializeSong();
  }, [songid, allSongs]); // Remove currentSong from dependencies

  // Panel state handlers...
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

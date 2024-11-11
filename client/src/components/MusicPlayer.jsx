/* eslint-disable react/prop-types */
import { useState } from "react";
import SidePanel from "./SidePanel";
import MainPanel from "./MainPanel";
import "./MusicPlayer.css";

export default function MusicPlayer({ songData }) {
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

  return (
    <div className="musicplayer">
      <MainPanel
        width={sidepanelstate === "closed" ? 100 : 75}
        opencloselyricspanel={opencloselyricspanel}
        openclosetriviapanel={openclosetriviapanel}
        songData={songData}
      />
      <SidePanel
        width={25}
        sidepanelstate={sidepanelstate}
        songData={songData}
      />
    </div>
  );
}

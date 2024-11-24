import { useState, useContext } from "react";

import SidePanel from "./SidePanel";
import MainPanel from "./MainPanel";
import { AppContext } from "../AppContextAndAppContextProvider";

import "./MusicPlayer.css";
import Loader from "./Loader";

export default function MusicPlayer() {
  const { loading } = useContext(AppContext);

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

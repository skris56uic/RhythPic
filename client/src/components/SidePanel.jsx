import { useEffect, useRef, useContext } from "react";

import { AppContext } from "../AppContextAndAppContextProvider";

import "./SidePanel.css";

export default function SidePanel({ width, sidepanelstate }) {
  const { allSongs, currentSong, songProgress } = useContext(AppContext);

  const lyricsContainerRef = useRef(null);
  const activeLyricRef = useRef(null);
  const triviaPanelRef = useRef(null);

  const convertTimeTagToSeconds = (timeTag) => {
    const [minutes, seconds] = timeTag.split(":").map(parseFloat);
    return minutes * 60 + seconds;
  };

  useEffect(() => {
    if (activeLyricRef.current && lyricsContainerRef.current) {
      const container = lyricsContainerRef.current;
      const element = activeLyricRef.current;

      const containerHeight = container.clientHeight;
      const elementTop = element.offsetTop;
      const elementHeight = element.clientHeight;
      const centerPosition =
        elementTop - containerHeight / 2 + elementHeight / 2;

      container.scrollTo({
        top: centerPosition,
        behavior: "smooth",
      });
    }
  }, [songProgress]);

  return (
    <div className="sidepanel" style={{ width: `${width}vw` }}>
      {sidepanelstate === "lyrics" && currentSong && (
        <>
          <h2 className="section-header">Lyrics</h2>
          <div className="lyrics-container" ref={lyricsContainerRef}>
            <div className="lyrics-list">
              {currentSong.lyricsAndImages.map((line, index) => {
                const isCurrentLyric =
                  convertTimeTagToSeconds(line.timeTag) <= songProgress &&
                  (index === currentSong.lyricsAndImages.length - 1 ||
                    convertTimeTagToSeconds(
                      currentSong.lyricsAndImages[index + 1].timeTag
                    ) > songProgress);

                return (
                  <div
                    key={index}
                    className={`lyric-line ${isCurrentLyric ? "active" : ""}`}
                    ref={isCurrentLyric ? activeLyricRef : null}
                  >
                    {line.words !== " " && (
                      <p className={`words ${isCurrentLyric ? "active" : ""}`}>
                        {line.words}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
      {sidepanelstate === "trivia" && (
        <>
          <h2 className="section-header">Trivia</h2>
          <div className="trivia-container">
            <div className="trivia-content" ref={triviaPanelRef}>
              {currentSong.trivia && (
                <div className="fact-text">
                  {currentSong.trivia.split("\n").map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

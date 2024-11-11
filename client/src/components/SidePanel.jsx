/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";
import "./SidePanel.css";

export default function SidePanel({
  width,
  sidepanelstate,
  songData,
  songProgress,
}) {
  const lyricsContainerRef = useRef(null);
  const activeLyricRef = useRef(null);

  const convertTimeTagToSeconds = (timeTag) => {
    const [minutes, seconds] = timeTag.split(":").map(parseFloat);
    return minutes * 60 + seconds;
  };

  useEffect(() => {
    if (activeLyricRef.current && lyricsContainerRef.current) {
      const container = lyricsContainerRef.current;
      const element = activeLyricRef.current;

      // Calculate the scroll position to center the active lyric
      const containerHeight = container.clientHeight;
      const elementTop = element.offsetTop;
      const elementHeight = element.clientHeight;
      const centerPosition =
        elementTop - containerHeight / 2 + elementHeight / 2;

      // Smooth scroll to the position
      container.scrollTo({
        top: centerPosition,
        behavior: "smooth",
      });
    }
  }, [songProgress]);

  return (
    <div className="sidepanel" style={{ width: `${width}vw` }}>
      {sidepanelstate === "lyrics" && songData && (
        <div className="lyrics-container" ref={lyricsContainerRef}>
          <h2>Lyrics</h2>
          <div className="lyrics-list">
            {songData.isong.lines.map((line, index) => {
              const isCurrentLyric =
                convertTimeTagToSeconds(line.timeTag) <= songProgress &&
                (index === songData.isong.lines.length - 1 ||
                  convertTimeTagToSeconds(
                    songData.isong.lines[index + 1].timeTag
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
      )}
      {sidepanelstate === "trivia" && (
        <div className="trivia-container">
          <h2>Trivia</h2>
          {/* Trivia content here */}
        </div>
      )}
    </div>
  );
}

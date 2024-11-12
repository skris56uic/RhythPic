/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import "./SidePanel.css";

export default function SidePanel({
  width,
  sidepanelstate,
  songData,
  songProgress,
}) {
  const lyricsContainerRef = useRef(null);
  const activeLyricRef = useRef(null);
  const triviaPanelRef = useRef(null);
  const [songFact, setSongFact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const fetchSongFact = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `http://localhost:3000/songFact?id=${songData?.fileName}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch song fact");
        }
        const data = await response.json();
        setSongFact(data.description);
      } catch (error) {
        console.error("Error fetching song fact:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (songData?.fileName) {
      fetchSongFact();
    }
  }, [songData?.fileName]);

  return (
    <div className="sidepanel" style={{ width: `${width}vw` }}>
      {sidepanelstate === "lyrics" && songData && (
        <div className="lyrics-container" ref={lyricsContainerRef}>
          <h2 className="section-header">Lyrics</h2>
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
          <h2 className="section-header">Trivia</h2>
          <div className="trivia-content" ref={triviaPanelRef}>
            {loading && <div>Loading song fact...</div>}
            {error && <div>Error: {error}</div>}
            {songFact && (
              <div className="fact-text">
                {songFact.split("\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

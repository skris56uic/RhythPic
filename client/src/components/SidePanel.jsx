/* eslint-disable react/prop-types */
import "./SidePanel.css";

export default function SidePanel({ width, sidepanelstate, songData }) {
  return (
    <div className="sidepanel" style={{ width: `${width}vw` }}>
      {sidepanelstate === "lyrics" && songData && (
        <div className="lyrics-container">
          <h2>Lyrics</h2>
          <div className="lyrics-list">
            {songData.isong.lines.map((line, index) => (
              <div key={index} className="lyric-line">
                {line.words !== " " && (
                  <>
                    <p className="words">{line.words}</p>
                  </>
                )}
              </div>
            ))}
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

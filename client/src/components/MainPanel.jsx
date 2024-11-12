/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import "./MainPanel.css";

export default function MainPanel({
  width,
  opencloselyricspanel,
  openclosetriviapanel,
  songData,
  songProgress,
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState([]);

  const convertTimeTagToSeconds = (timeTag) => {
    const [minutes, seconds] = timeTag.split(":").map(parseFloat);
    return minutes * 60 + seconds;
  };

  useEffect(() => {
    if (songData?.isong?.lines) {
      // Find all lines with images
      const imagesWithIndex = songData.isong.lines
        .map((line, index) => ({ ...line, index }))
        .filter((line) => line.image_base && line.image_base !== "");

      setLoadedImages(imagesWithIndex);
    }
  }, [songData]);

  useEffect(() => {
    if (loadedImages.length > 0 && songProgress) {
      const newIndex = loadedImages.findIndex((img, index) => {
        const currentTime = convertTimeTagToSeconds(img.timeTag);
        const nextTime =
          index < loadedImages.length - 1
            ? convertTimeTagToSeconds(loadedImages[index + 1].timeTag)
            : Infinity;
        return songProgress >= currentTime && songProgress < nextTime;
      });

      if (newIndex !== -1) {
        setCurrentImageIndex(newIndex);
      }
    }
  }, [songProgress, loadedImages]);

  const currentImage = loadedImages[currentImageIndex];

  // Optional: Add functions to navigate between images
  const nextImage = () => {
    if (currentImageIndex < loadedImages.length - 1) {
      setCurrentImageIndex((prev) => prev + 1);
    }
  };

  const previousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="mainpanel" style={{ width: `${width}vw` }}>
      <div className="image-container">
        {currentImage ? (
          <>
            <img
              className="generatedimage"
              src={`data:image/jpeg;base64,${currentImage.image_base}`}
              alt={`Visualization for: ${currentImage.words}`}
              style={{ width: `${width}vw` }}
            />
            {/* Optional: Add navigation controls */}
            <div className="image-navigation">
              <button
                onClick={previousImage}
                disabled={currentImageIndex === 0}
                className="nav-button"
              >
                ←
              </button>
              <span className="image-count">
                {currentImageIndex + 1} / {loadedImages.length}
              </span>
              <button
                onClick={nextImage}
                disabled={currentImageIndex === loadedImages.length - 1}
                className="nav-button"
              >
                →
              </button>
            </div>
          </>
        ) : (
          <div className="no-image-placeholder">No image available</div>
        )}
      </div>

      <div className="sidebarbuttons">
        <div className="sidebarbutton" onClick={opencloselyricspanel}>
          <svg
            className="sidebaricon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z"
              clipRule="evenodd"
            />
          </svg>
          <div>Lyrics</div>
        </div>

        <div className="sidebarbutton" onClick={openclosetriviapanel}>
          <svg
            className="sidebaricon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z"
              clipRule="evenodd"
            />
            <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
          </svg>
          <div>Trivia</div>
        </div>
      </div>
    </div>
  );
}

const fs = require("fs");
const trackId = "7qiZfU4dY1lWllzX7mPBI3"; // Correctly define the track ID
const lycrisURL = `https://spotify-lyrics-api-pi.vercel.app/?trackid=${trackId}&format=lrc`;
console.log("Fetching lyrics from", lycrisURL);

async function fetchLyricsAndImages() {
  const lycris = await fetch(lycrisURL);
  const lrcData = await lycris.json();

  for (const line of lrcData.lines) {
    if (line.words.length > 1) {
      console.log("generating image for:", line.words);
      const imgResponse = await fetch(
        "https://texttoimage-h438.onrender.com/api/v1/imgGenerate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: line.words }),
        }
      );
      const imgData = await imgResponse.json();
      lrcData.lines[lrcData.lines.indexOf(line)].image_base = imgData.photo;
      console.log("Image URL:", imgData.photo);
      console.log("Waiting for 2 minutes to avoid rate limiting");
      await new Promise((resolve) => setTimeout(resolve, 2 * 60 * 1000));
      console.log("Waiting done");
    } else {
      lrcData.lines[lrcData.lines.indexOf(line)].image_base = "";
    }
  }

  const songDetails = {
    name: "Sample Song",
    artist: "Sample Artist",
    isong: {
      id: trackId,
      lines: lrcData.lines,
    },
    fileName: "output.json",
  };

  fs.writeFileSync("songDetails.json", JSON.stringify(songDetails, null, 2));
  console.log("Formatted data saved to songDetails.json");
}

// Call the async function
fetchLyricsAndImages();

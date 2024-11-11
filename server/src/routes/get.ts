import express, { Router } from "express";
import { ImageResponse, Song } from "./interfaces";
import { SongDetails, SongDetailsModel, SongFactModel } from "../models/songs";
import path from "path";
import fs from "fs";

const router: Router = express.Router();

router.get("/songs", (req, res) => {
  try {
    const metadataPath = path.join(
      __dirname,
      "../../assets/songs-metadata.json"
    );
    const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
    res.json(metadata);
  } catch (error) {
    console.error("Error reading metadata:", error);
    res.status(500).send("Error fetching songs list");
  }
});

// Function to get song metadata from JSON file
const getSongMetadata = (
  id: string
): { name: string; artist: string } | null => {
  try {
    const metadataPath = path.join(
      __dirname,
      "../../assets/songs-metadata.json"
    );
    const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
    const song = metadata.songs.find((s: { id: string }) => s.id === id);
    return song ? { name: song.name, artist: song.artist } : null;
  } catch (error) {
    console.error("Error reading metadata:", error);
    return null;
  }
};

router.get("/lycris", async (req, res) => {
  const id = req.query.id as string;
  if (!id) {
    res.status(400).send("No id provided");
    return;
  }
  const song: SongDetails[] = await SongDetailsModel.find({ "isong.id": id });
  if (song.length > 0) {
    console.log("Song found in database");
    res.send(song[0]);
    return;
  }
  try {
    const response = await fetch(
      `https://spotify-lyrics-api-pi.vercel.app/?trackid=${id}&format=lrc`,
      {
        method: "GET",
      }
    );
    const lrcData: Song = await response.json();

    for (const line of lrcData.lines) {
      if (line.words.length > 1) {
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
        console.log("images generated for lycris", line.words);
        const imgData: ImageResponse = await imgResponse.json();
        lrcData.lines[lrcData.lines.indexOf(line)].image_base = imgData.photo;
      } else {
        lrcData.lines[lrcData.lines.indexOf(line)].image_base = "";
      }
    }

    // Get metadata from JSON file
    const metadata = getSongMetadata(id);
    if (!metadata) {
      console.log("Metadata not found for id:", id);
      res.status(404).send("Song metadata not found");
      return;
    }

    const newSong: SongDetails = {
      name: metadata.name,
      artist: metadata.artist,
      fileName: id,
      isong: {
        id,
        lines: lrcData.lines.map((l) => ({
          image_base: l.image_base,
          timeTag: l.timeTag,
          words: l.words,
        })),
      },
    };
    console.log("saving song to db");
    await SongDetailsModel.insertMany([newSong]);
    res.send(newSong);
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Error fetching lyrics");
  }
});

router.get("/audio", (req, res) => {
  const id = req.query.id as string;
  console.log("id", id);
  res.sendFile(path.join(__dirname, "../../assets", `${id}.mp3`));
});

router.get("/songFact", async (req, res) => {
  const songId = req.query.id as string;
  if (!songId) {
    res.status(400).send("No song id provided");
    return;
  }

  try {
    // Check if we already have the song fact in our database
    const existingFact = await SongFactModel.findOne({ songId });
    if (existingFact) {
      console.log("Song fact found in database");
      res.json({ description: existingFact.description });
      return;
    }

    // Get song metadata to construct search query
    const metadata = getSongMetadata(songId);
    if (!metadata) {
      res.status(404).send("Song metadata not found");
      return;
    }

    // Step 1: Search for the song on Genius
    const searchQuery = `${metadata.name} ${metadata.artist}`.replace(
      /\s+/g,
      "%20"
    );
    const searchResponse = await fetch(
      `https://api.genius.com/search?q=${searchQuery}`,
      {
        headers: {
          Authorization:
            "Bearer uDzHnl9XbuxOTAjQSn_NEip0coYscD8j27ByVGbW4iEWE3SXSqXSnVSGVR3uOSUw",
        },
      }
    );

    const searchData = await searchResponse.json();

    if (!searchData.response.hits.length) {
      res.status(404).send("Song not found on Genius");
      return;
    }

    // Extract the Genius song ID from the first hit
    const geniusId = searchData.response.hits[0].result.api_path
      .split("/")
      .pop();

    // Step 2: Get song details including description
    const detailsResponse = await fetch(
      `https://api.genius.com/songs/${geniusId}?text_format=plain`,
      {
        headers: {
          Authorization:
            "Bearer uDzHnl9XbuxOTAjQSn_NEip0coYscD8j27ByVGbW4iEWE3SXSqXSnVSGVR3uOSUw",
        },
      }
    );

    const detailsData = await detailsResponse.json();

    if (!detailsData.response.song.description?.plain) {
      res.status(404).send("No song description found");
      return;
    }

    // Store the song fact in database
    const songFact = await SongFactModel.create({
      songId,
      geniusId,
      description: detailsData.response.song.description.plain,
    });

    res.json({ description: songFact.description });
  } catch (error) {
    console.error("Error fetching song fact:", error);
    res.status(500).send("Error fetching song fact");
  }
});

export default router;

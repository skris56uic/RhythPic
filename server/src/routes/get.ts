import express, { Router } from "express";
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
  res.send("No song found in database");
  return;
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
      res.json({ description: "Unable to Fetch any Facts" });
      return;
    }

    // Step 1: Search for the song on Genius
    const searchQuery = `${metadata.name} by ${metadata.artist}`.replace(
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
      res.json({ description: "Unable to Fetch any Facts" });
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

    const description: string =
      detailsData.response.song.description?.plain ||
      "Unable to Fetch any Facts";
    // Only store in database if we got a real fact
    if (description !== "Unable to Fetch any Facts") {
      await SongFactModel.create({
        songId,
        geniusId,
        description,
      });
    }

    res.json({
      description:
        description.length > 1 ? description : "Unable to Fetch any Facts",
    });
  } catch (error) {
    console.error("Error fetching song fact:", error);
    res.status(500).send("Error fetching song fact");
  }
});

export default router;

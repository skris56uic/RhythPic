import express, { Router } from "express";
import { ImageResponse, Song } from "./interfaces";
import { SongDetails, SongDetailsModel } from "../models/songs";
import path from "path";

const router: Router = express.Router();

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

    const newSong: SongDetails = {
      name: "name",
      artist: "artist",
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

export default router;

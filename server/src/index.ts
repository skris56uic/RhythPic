import express, { Express } from "express";
import mongoose from "mongoose";
import router from "./routes/get";
import cors from "cors";
import * as compression from "compression";

const app: Express = express();
const port = process.env.PORT || 3000;
// const mongoUrl = "mongodb://localhost:27017/lycris";

// Increase the limit for JSON payloads
app.use(express.json({ limit: "50mb" }));
// Increase the limit for URL-encoded payloads
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(
  compression.default({
    level: 9,
  })
);

// Configure CORS with increased header limits
app.use(
  cors({
    origin: "https://rhythpic-front.onrender.com",
    // origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
    maxAge: 600,
  })
);

mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("[server]: Connected to the database");
    app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
    });
  })
  .catch((error: Error) => {
    console.log("[server]: Error connecting to the database", error);
  });

app.use(router);

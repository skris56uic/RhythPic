import express, { Express } from "express";
import mongoose from "mongoose";
import router from "./routes/get";
import cors from "cors";

const app: Express = express();
const port = process.env.PORT || 3000;
const mongoUrl = "mongodb://localhost:27017/lycris";

app.use(cors());

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

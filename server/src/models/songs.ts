import mongoose, { Schema, Document } from "mongoose";

interface ILine {
  timeTag: string;
  words: string;
  image_base: string;
}

interface ISong {
  id: string;
  lines: ILine[];
}

interface SongDetails {
  name: string;
  artist: string;
  isong: ISong;
  fileName: string;
}

interface SongFact {
  songId: string;
  geniusId: string;
  description: string;
}

const LineSchema: Schema = new Schema({
  timeTag: { type: String, required: true },
  words: {
    type: String,
    required: true,
    set: (v: string) => (v.length > 0 ? v : " "),
  },
  image_base: { type: String, required: false },
});

const SongSchema: Schema = new Schema({
  id: { type: String, required: true },
  lines: { type: [LineSchema], required: true },
});

const SongDetailsSchema: Schema = new Schema({
  name: { type: String, required: true },
  artist: { type: String, required: true },
  isong: { type: SongSchema, required: true },
  fileName: { type: String, required: true },
});

const SongFactSchema: Schema = new Schema({
  songId: { type: String, required: true, unique: true },
  geniusId: { type: String, required: true },
  description: { type: String, required: true },
});

const SongDetailsModel = mongoose.model<SongDetails>("Songs", SongDetailsSchema);
const SongFactModel = mongoose.model<SongFact>("SongFacts", SongFactSchema);

export { 
  SongDetailsModel, 
  SongFactModel,
  ILine, 
  ISong, 
  SongDetails,
  SongFact 
};
export interface Song {
  error: boolean;
  syncType: string;
  lines: Line[];
}

export interface Line {
  timeTag: string;
  words: string;
  image_base: string
}


export interface ImageResponse {
    photo: string;
}
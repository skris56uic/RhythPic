export interface Song {
  error: boolean;
  syncType: string;
  lines: Line[];
}

export interface Line {
  timeTag: string;
  words: string;
  image_base: string;
}

export interface ImageResponse {
  photo: string;
}

export interface GeniusSearchResponse {
  meta: {
    status: number;
  };
  response: {
    hits: Array<{
      result: {
        api_path: string;
      };
    }>;
  };
}

export interface GeniusDetailsResponse {
  meta: {
    status: number;
  };
  response: {
    song: {
      description: {
        plain: string;
      };
    };
  };
}
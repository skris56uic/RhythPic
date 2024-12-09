export const base_url = "https://rhythpic-backend.onrender.com";

export async function fetchSongLyrics(songId) {
  try {
    const response = await fetch(`${base_url}/lycris?id=${songId}`);

    if (!response.ok) {
      throw new Error("Failed to Fetch Song Details");
    }

    const lyrics = await response.json();

    return lyrics;
  } catch (error) {
    console.error("Error Fetching Song Details:", error);
  }
}

export async function fetchSongTrivia(fileName) {
  try {
    const response = await fetch(`${base_url}/songFact?id=${fileName}`);

    if (!response.ok) {
      throw new Error("Failed to Fetch Song Details");
    }

    const trivia = await response.json();

    return trivia;
  } catch (error) {
    console.error("Error Fetching Song Details:", error);
  }
}

export async function fetchListOfSongs() {
  try {
    const response = await fetch(`${base_url}/songs`);

    if (!response.ok) {
      throw new Error("Failed to Fetch Songs");
    }

    const allSongs = await response.json();

    allSongs.songs = allSongs.songs.map((song, index) => {
      return {
        ...song,
        index,
      };
    });

    return allSongs;
  } catch (error) {
    console.error("Error Fetching All Songs:", error);
  }
}

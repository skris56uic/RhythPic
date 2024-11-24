export async function fetchSongData(songId) {
  try {
    const metadataResponse = await fetch("http://localhost:3000/songs");
    const metadataData = await metadataResponse.json();
    const songMetadata = metadataData.songs.find((song) => song.id === songId);

    if (!songMetadata) {
      throw new Error("Song metadata not found");
    }

    const lyricsResponse = await fetch(
      `http://localhost:3000/lycris?id=${songId}`
    );
    if (!lyricsResponse.ok) {
      throw new Error("Failed to fetch song data");
    }
    const lyricsData = await lyricsResponse.json();

    const completeData = {
      ...lyricsData,
      name: songMetadata.name,
      artist: songMetadata.artist,
    };

    return completeData;
  } catch (error) {
    console.error("Error fetching song data:", error);
    // setError(error.message);
  } finally {
    // setLoading(false);
  }
}

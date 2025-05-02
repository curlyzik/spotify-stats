import { Artist, AudioFeatures, Genre, Track } from "@/types/spotify";

export function parseTrack(item: any): Track {
  return {
    id: item.id,
    name: item.name,
    artists: item.artists.map((artist: any) => ({
      id: artist.id,
      name: artist.name,
    })),
    album: {
      id: item.album.id,
      name: item.album.name,
      images: item.album.images,
    },
    duration_ms: item.duration_ms,
    popularity: item.popularity,
  };
}

export function parseArtist(item: any): Artist {
  return {
    id: item.id,
    name: item.name,
    images: item.images,
    genres: item.genres,
    popularity: item.popularity,
    followers: item.followers
  };
}

export function extractGenres(artists: Artist[]): Genre[] {
  // Create an object to count genre occurrences
  const genreCounts: Record<string, number> = {};
  let totalGenres = 0;

  // Count occurrences of each genre
  artists.forEach(artist => {
    if (artist.genres && artist.genres.length > 0) {
      artist.genres.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        totalGenres++;
      });
    }
  });

  // Convert to array and sort by count (descending)
  const sortedGenres = Object.entries(genreCounts)
    .map(([name, count]) => {
      // Calculate percentage and ensure it's a number
      const percentage = totalGenres > 0 
        ? Math.round((count / totalGenres) * 100) 
        : 0;
        
      return {
        name,
        count,
        percentage
      };
    })
    .sort((a, b) => b.count - a.count);

  return sortedGenres;
}

export function calculateAudioFeatureAverages(features: AudioFeatures[]): Record<string, number> {
  if (!features || features.length === 0) return {};

  const relevantFeatures = [
    'danceability', 'energy', 'speechiness',
    'acousticness', 'instrumentalness', 'liveness',
    'valence'
  ];

  const sums: Record<string, number> = {};
  const count = features.length;

  // Sum up all feature values
  features.forEach(feature => {
    if (feature) { // Make sure feature is not null or undefined
      relevantFeatures.forEach(key => {
        const value = feature[key as keyof AudioFeatures];
        if (typeof value === 'number' && !isNaN(value)) {
          sums[key] = (sums[key] || 0) + value;
        }
      });
    }
  });

  // Calculate averages, ensuring we don't divide by zero
  const averages: Record<string, number> = {};
  relevantFeatures.forEach(key => {
    if (sums[key] !== undefined) {
      averages[key] = parseFloat((sums[key] / count).toFixed(2));
    }
  });

  return averages;
}

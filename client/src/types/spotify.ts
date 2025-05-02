export interface Image {
  url: string;
  height: number;
  width: number;
}

export interface Artist {
  id: string;
  name: string;
  images?: Image[];
  genres?: string[];
  popularity?: number;
  followers?: {
    total: number;
  };
}

export interface Album {
  id: string;
  name: string;
  images: Image[];
  release_date?: string;
}

export interface Track {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
  duration_ms: number;
  popularity: number;
}

export interface AudioFeatures {
  id: string;
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  duration_ms: number;
  time_signature: number;
  analysis_url?: string;
  track_href: string;
  type: string;
  uri: string;
}

export interface User {
  id: string;
  display_name: string;
  images?: Image[];
}

export type TimeFrame = 'short_term' | 'medium_term' | 'long_term';

export interface TopArtist extends Artist {
  // Any additional fields specific to top artists
}

export interface TopTrack extends Track {
  // Any additional fields specific to top tracks
}

export interface Genre {
  name: string;
  count: number;
  percentage: number;
}

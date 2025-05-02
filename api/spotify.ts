import axios from "axios";
import querystring from "querystring";
import dotenv from "dotenv";
dotenv.config();

// Spotify API URLs
const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_URL = "https://api.spotify.com/v1";

// Scopes needed for this application
const SCOPES = ["user-read-private", "user-read-email", "user-top-read"];

// Client configuration
const CLIENT_ID = process.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.VITE_SPOTIFY_REDIRECT_URI;
console.log(REDIRECT_URI);
// Validate required environment variables
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Missing required environment variables: SPOTIFY_CLIENT_ID and/or SPOTIFY_CLIENT_SECRET"
  );
}

// Generate the authorization URL for Spotify OAuth
export function getAuthorizationUrl(state = "") {
  const params = {
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    state,
    scope: SCOPES.join(" "),
    show_dialog: true,
  };

  return `${SPOTIFY_AUTH_URL}?${querystring.stringify(params)}`;
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(code: string) {
  try {
    const response = await axios.post(
      SPOTIFY_TOKEN_URL,
      querystring.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    throw error;
  }
}

// Refresh the access token
export async function refreshAccessToken(refreshToken: string) {
  try {
    const response = await axios.post(
      SPOTIFY_TOKEN_URL,
      querystring.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw error;
  }
}

// Get the current user's profile
export async function getUserProfile(accessToken: string) {
  try {
    const response = await axios.get(`${SPOTIFY_API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

// Get the user's top tracks
export async function getTopTracks(
  accessToken: string,
  timeRange = "short_term",
  limit = 10
) {
  try {
    const response = await axios.get(`${SPOTIFY_API_URL}/me/top/tracks`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        time_range: timeRange,
        limit,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching top tracks:", error);
    throw error;
  }
}

// Get the user's top artists
export async function getTopArtists(
  accessToken: string,
  timeRange = "short_term",
  limit = 10
) {
  try {
    const response = await axios.get(`${SPOTIFY_API_URL}/me/top/artists`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        time_range: timeRange,
        limit,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching top artists:", error);
    throw error;
  }
}

// Get audio features for a set of tracks to analyze genres and more
export async function getAudioFeatures(
  accessToken: string,
  trackIds: string[]
) {
  try {
    if (!trackIds || trackIds.length === 0) {
      console.log("No track IDs provided for audio features");
      return { audio_features: [] };
    }

    // Use the bulk endpoint instead of individual requests
    // This is more efficient and less likely to hit rate limits
    try {
      const response = await axios.get(`${SPOTIFY_API_URL}/audio-features`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          ids: trackIds.slice(0, 10).join(","), // Take first 10 tracks max
        },
      });

      if (
        response.status === 200 &&
        response.data &&
        response.data.audio_features
      ) {
        // Filter out any null values from the response
        const validFeatures = response.data.audio_features.filter(
          (feature: any) => feature !== null
        );
        return { audio_features: validFeatures };
      }

      return { audio_features: [] };
    } catch (bulkError: any) {
      console.error(
        "Error with bulk audio features request:",
        bulkError.message
      );

      // If bulk request fails, fall back to individual requests
      console.log("Falling back to individual audio feature requests");
      const features = [];
      const limitedTrackIds = trackIds.slice(0, 5); // Limit to 5 tracks for reliability

      for (const trackId of limitedTrackIds) {
        try {
          console.log(`Requesting audio features for track ${trackId}`);
          const response = await axios.get(
            `${SPOTIFY_API_URL}/audio-features/${trackId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (response.status === 200 && response.data) {
            features.push(response.data);
          }
        } catch (trackError: any) {
          console.error(
            `Error fetching audio features for track ${trackId}:`,
            trackError.message
          );
          // Continue with other tracks even if one fails
        }
      }

      return { audio_features: features };
    }
  } catch (error: any) {
    console.error("Error in audio features processing:", error.message);

    // Add more detailed error logging to diagnose the issue
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
    } else if (error.request) {
      console.error("Error request exists but no response");
    } else {
      console.error("Error message:", error.message);
    }

    // Return empty features rather than throwing error
    // This allows the UI to handle the case more gracefully
    return { audio_features: [] };
  }
}

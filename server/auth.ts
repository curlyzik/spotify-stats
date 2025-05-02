import * as spotifyService from './spotify';

// Simplified authentication service without database dependency
export async function getSpotifyAuthUrl() {
  const state = Math.random().toString(36).substring(2, 15);
  const authUrl = spotifyService.getAuthorizationUrl(state);
  return { url: authUrl, state };
}

export async function handleSpotifyCallback(code: string) {
  try {
    // Exchange code for tokens
    const tokenData = await spotifyService.exchangeCodeForToken(code);
    
    // Get user profile for identification
    const userProfile = await spotifyService.getUserProfile(tokenData.access_token);
    
    // Return tokens and user info to be stored on client
    return {
      tokens: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: Date.now() + tokenData.expires_in * 1000,
        tokenType: tokenData.token_type,
        scope: tokenData.scope
      },
      user: userProfile
    };
  } catch (error) {
    console.error('Error during callback:', error);
    throw error;
  }
}

export async function refreshAccessToken(refreshToken: string) {
  try {
    const tokenData = await spotifyService.refreshAccessToken(refreshToken);
    
    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || refreshToken,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
      tokenType: tokenData.token_type,
      scope: tokenData.scope
    };
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}

export async function getUserProfile(accessToken: string) {
  return spotifyService.getUserProfile(accessToken);
}

export async function getTopTracks(accessToken: string, timeRange = 'short_term', limit = 10) {
  return spotifyService.getTopTracks(accessToken, timeRange, limit);
}

export async function getTopArtists(accessToken: string, timeRange = 'short_term', limit = 10) {
  return spotifyService.getTopArtists(accessToken, timeRange, limit);
}

export async function getAudioFeatures(accessToken: string, trackIds: string[]) {
  return spotifyService.getAudioFeatures(accessToken, trackIds);
}
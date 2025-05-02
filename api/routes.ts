import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import * as authService from './auth';

export async function registerRoutes(app: Express): Promise<Server> {
  // Spotify authentication endpoints
  app.get('/api/spotify/login', async (req, res) => {
    try {
      const { url, state } = await authService.getSpotifyAuthUrl();
      res.json({ url });
    } catch (err) {
      console.error('Error generating login URL:', err);
      res.status(500).json({ message: 'Failed to generate login URL' });
    }
  });

  app.post('/api/spotify/callback', async (req, res) => {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }
    
    try {
      const authData = await authService.handleSpotifyCallback(code);
      
      // Return tokens and user info to client for storage in localStorage
      res.status(200).json(authData);
    } catch (err) {
      console.error('Error during callback:', err);
      res.status(500).json({ message: 'Authentication failed' });
    }
  });

  app.post('/api/spotify/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    
    try {
      const tokens = await authService.refreshAccessToken(refreshToken);
      res.status(200).json(tokens);
    } catch (err) {
      console.error('Error refreshing token:', err);
      res.status(500).json({ message: 'Failed to refresh token' });
    }
  });

  // Get user's top tracks
  app.post('/api/spotify/top-tracks', async (req, res) => {
    const { accessToken, timeRange = 'short_term' } = req.body;
    
    if (!accessToken) {
      return res.status(401).json({ message: 'Access token is required' });
    }
    
    const validTimeRanges = ['short_term', 'medium_term', 'long_term'];
    
    if (!validTimeRanges.includes(timeRange)) {
      return res.status(400).json({ message: 'Invalid time range' });
    }
    
    try {
      const topTracksData = await authService.getTopTracks(accessToken, timeRange, 10);
      res.json(topTracksData.items);
    } catch (err: any) {
      console.error('Error fetching top tracks:', err);
      
      if (err.response && err.response.status === 401) {
        return res.status(401).json({ message: 'Access token expired' });
      }
      
      res.status(500).json({ message: 'Failed to fetch top tracks' });
    }
  });

  // Get user's top artists
  app.post('/api/spotify/top-artists', async (req, res) => {
    const { accessToken, timeRange = 'short_term' } = req.body;
    
    if (!accessToken) {
      return res.status(401).json({ message: 'Access token is required' });
    }
    
    const validTimeRanges = ['short_term', 'medium_term', 'long_term'];
    
    if (!validTimeRanges.includes(timeRange)) {
      return res.status(400).json({ message: 'Invalid time range' });
    }
    
    try {
      const topArtistsData = await authService.getTopArtists(accessToken, timeRange, 10);
      res.json(topArtistsData.items);
    } catch (err: any) {
      console.error('Error fetching top artists:', err);
      
      if (err.response && err.response.status === 401) {
        return res.status(401).json({ message: 'Access token expired' });
      }
      
      res.status(500).json({ message: 'Failed to fetch top artists' });
    }
  });

  // Get audio features for tracks
  app.post('/api/spotify/audio-features', async (req, res) => {
    const { accessToken, trackIds } = req.body;
    
    if (!accessToken) {
      return res.status(401).json({ message: 'Access token is required' });
    }
    
    if (!trackIds || !Array.isArray(trackIds)) {
      console.log("Invalid track IDs format received:", trackIds);
      // Return empty features instead of error
      return res.json({ audio_features: [] });
    }
    
    if (trackIds.length === 0) {
      console.log("Empty track IDs array received");
      return res.json({ audio_features: [] });
    }
    
    try {
      console.log(`Requesting audio features for ${trackIds.length} tracks`);
      const audioFeaturesData = await authService.getAudioFeatures(accessToken, trackIds);
      console.log(`Received audio features for ${audioFeaturesData.audio_features?.length || 0} tracks`);
      return res.json(audioFeaturesData);
    } catch (err: any) {
      console.error('Error fetching audio features:', err.message || err);
      
      if (err.response && err.response.status === 401) {
        console.log("Token expired while fetching audio features");
        return res.status(401).json({ message: 'Access token expired' });
      }
      
      // Always return a valid response, even on error, to avoid breaking the UI
      return res.json({ audio_features: [] });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

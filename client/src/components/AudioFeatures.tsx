import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AudioFeatures as AudioFeaturesType, TimeFrame, Track } from '@/types/spotify';
import { Button } from '@/components/ui/button';
import { calculateAudioFeatureAverages } from '@/lib/spotify';

interface AudioFeaturesProps {
  timeFrame: TimeFrame;
  tracks: Track[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export default function AudioFeatures({
  timeFrame,
  tracks,
  isLoading,
  isError,
  onRetry
}: AudioFeaturesProps) {
  const { getAccessToken } = useAuth();
  const [audioFeatures, setAudioFeatures] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  // Effect to fetch data when tracks or timeFrame changes
  useEffect(() => {
    async function fetchAudioFeatures() {
      if (!tracks || tracks.length === 0) {
        setAudioFeatures({});
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(false);
      
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          setError(true);
          setLoading(false);
          return;
        }
        
        // Extract track IDs from the tracks and make sure they're valid
        const trackIds = tracks
          .filter(track => track && track.id) // Filter out any invalid tracks
          .map(track => track.id);
        
        if (trackIds.length === 0) {
          console.log("No valid track IDs found");
          setAudioFeatures({});
          setLoading(false);
          return;
        }
        
        console.log(`Sending ${trackIds.length} track IDs for audio features`);
        
        // Fetch audio features for the tracks
        const response = await fetch('/api/spotify/audio-features', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken, trackIds }),
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          console.error('API error response:', data);
          throw new Error(data.message || 'Failed to fetch audio features');
        }
        
        console.log(`Received audio features data:`, data);
        
        if (data && data.audio_features && Array.isArray(data.audio_features) && data.audio_features.length > 0) {
          // Filter out any null values that Spotify might return
          const validFeatures = data.audio_features.filter((feature: any) => feature !== null);
          if (validFeatures.length > 0) {
            console.log(`Processing ${validFeatures.length} valid audio features`);
            const featureAverages = calculateAudioFeatureAverages(validFeatures);
            setAudioFeatures(featureAverages);
          } else {
            console.log("No valid audio features found in response");
            setAudioFeatures({});
          }
        } else {
          console.log("Received empty or invalid audio_features array");
          setAudioFeatures({});
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching audio features:', err);
        setError(true);
        setLoading(false);
      }
    }
    
    fetchAudioFeatures();
  }, [tracks, timeFrame, getAccessToken]);

  // Format feature names for display
  const formatFeatureName = (name: string): string => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Descriptions for audio features
  const featureDescriptions: Record<string, string> = {
    danceability: 'How suitable a track is for dancing based on tempo, rhythm, beat strength, and regularity',
    energy: 'Perceptual measure of intensity and activity. High energy tracks feel fast, loud, and noisy',
    speechiness: 'Presence of spoken words. Values above 0.66 are likely to be speech, 0.33-0.66 may contain both speech and music',
    acousticness: 'Confidence measure of whether the track is acoustic (non-electronic)',
    instrumentalness: 'Predicts whether a track contains no vocals. Values above 0.5 are instrumental',
    liveness: 'Detects the presence of an audience in the recording. Higher values mean higher probability the track was performed live',
    valence: 'Musical positiveness conveyed by a track. High valence sounds more positive (happy, cheerful)'
  };

  // Get color based on value
  const getBarColor = (value: number): string => {
    if (value < 0.3) return 'bg-blue-500';
    if (value < 0.6) return 'bg-green-500';
    return 'bg-purple-500';
  };
  
  // Get color value as HEX string
  const getColorValue = (value: number): string => {
    if (value < 0.3) return '#3b82f6'; // blue
    if (value < 0.6) return '#10b981'; // green
    return '#8b5cf6'; // purple
  };
  
  // Get human-readable time frame
  const getTimeRangeDisplay = (): string => {
    switch (timeFrame) {
      case 'short_term':
        return 'Last 4 weeks';
      case 'medium_term':
        return 'Last 6 months';
      case 'long_term':
        return 'All time';
      default: 
        return 'Last 4 weeks';
    }
  };
  
  if (loading || isLoading) {
    return (
      <div className="p-6 rounded-lg bg-spotify-dark-gray shadow-lg text-center">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Music Analysis</h2>
          <span className="text-xs font-semibold text-spotify-green">{getTimeRangeDisplay()}</span>
        </div>
        <div className="py-10">
          <div className="spinner w-12 h-12 border-4 border-spotify-green border-t-transparent rounded-full mb-4 mx-auto animate-spin"></div>
          <p className="text-spotify-light-gray">Analyzing your music...</p>
        </div>
      </div>
    );
  }

  if (error || isError) {
    return (
      <div className="p-6 rounded-lg bg-spotify-dark-gray shadow-lg text-center">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Music Analysis</h2>
          <span className="text-xs font-semibold text-spotify-green">{getTimeRangeDisplay()}</span>
        </div>
        <div className="py-10">
          <svg className="w-12 h-12 text-red-500 opacity-70 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-spotify-light-gray mb-4">Failed to load audio features</p>
          <Button 
            variant="spotify"
            onClick={onRetry}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (Object.keys(audioFeatures).length === 0) {
    return (
      <div className="p-6 rounded-lg bg-spotify-dark-gray shadow-lg text-center">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Music Analysis</h2>
          <span className="text-xs font-semibold text-spotify-green">{getTimeRangeDisplay()}</span>
        </div>
        <div className="py-10">
          <svg className="w-12 h-12 text-spotify-light-gray opacity-30 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <p className="text-spotify-light-gray">No audio feature data available for {getTimeRangeDisplay().toLowerCase()}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg bg-spotify-dark-gray shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-white">Music Analysis</h2>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-spotify-green">{getTimeRangeDisplay()}</span>
          <span className="text-xs font-medium text-spotify-light-gray">• Audio Features</span>
        </div>
      </div>
      
      <div className="space-y-8">
        {Object.entries(audioFeatures).map(([feature, value]) => {
          const percentage = Math.round(value * 100);
          
          return (
            <div key={feature} className="space-y-3 group hover:transform hover:scale-[1.01] transition-all duration-300 p-3 rounded-lg hover:bg-spotify-black hover:bg-opacity-30">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-spotify-green bg-opacity-10 flex items-center justify-center mr-3">
                    {feature === 'danceability' && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-spotify-green"><path d="m12 17 8-8-8-8-8 8 8 8Z"></path></svg>
                    )}
                    {feature === 'energy' && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-spotify-green"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                    )}
                    {feature === 'speechiness' && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-spotify-green"><path d="M12 18.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"></path><path d="M19 9v12"></path><path d="M5 5v16"></path><path d="M12 5v4"></path></svg>
                    )}
                    {feature === 'acousticness' && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-spotify-green"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle></svg>
                    )}
                    {feature === 'instrumentalness' && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-spotify-green"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                    )}
                    {feature === 'liveness' && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-spotify-green"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
                    )}
                    {feature === 'valence' && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-spotify-green"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" x2="9.01" y1="9" y2="9"></line><line x1="15" x2="15.01" y1="9" y2="9"></line></svg>
                    )}
                  </div>
                  <div className="mr-4">
                    <span className="text-sm font-medium group-hover:text-white transition-colors">{formatFeatureName(feature)}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold" style={{ 
                  color: getColorValue(value)
                }}>
                  {percentage}%
                </span>
              </div>
              
              <div className="w-full bg-spotify-black bg-opacity-40 rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                  className="h-3 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                  style={{ 
                    width: `${percentage}%`, 
                    backgroundColor: getColorValue(value),
                    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3) inset' 
                  }}
                >
                  {percentage > 30 && (
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                  )}
                </div>
              </div>
              
              <p className="text-xs text-spotify-light-gray">{featureDescriptions[feature]}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
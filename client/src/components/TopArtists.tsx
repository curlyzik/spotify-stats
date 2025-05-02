import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Artist, TimeFrame } from '@/types/spotify';
import { Button } from '@/components/ui/button';
import { parseArtist } from '@/lib/spotify';

interface TopArtistsProps {
  timeFrame: TimeFrame;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export default function TopArtists({
  timeFrame,
  isLoading,
  isError,
  onRetry
}: TopArtistsProps) {
  const { getAccessToken } = useAuth();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [showMore, setShowMore] = useState<boolean>(false);

  // Effect to fetch data when timeFrame changes
  useEffect(() => {
    async function fetchTopArtists() {
      setLoading(true);
      setError(false);
      
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          setError(true);
          setLoading(false);
          return;
        }
        
        const response = await fetch('/api/spotify/top-artists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken, timeRange: timeFrame }),
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch top artists');
        }
        
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
          setArtists(data.map(parseArtist));
        } else {
          setArtists([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching top artists:', err);
        setError(true);
        setLoading(false);
      }
    }
    
    fetchTopArtists();
  }, [timeFrame, getAccessToken]);

  const getTimeRangeDisplay = () => {
    switch (timeFrame) {
      case 'short_term': return 'Last month';
      case 'medium_term': return 'Last 6 months';
      case 'long_term': return 'All time';
      default: return 'Last month';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="p-6 rounded-lg bg-spotify-dark-gray shadow-lg text-center">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Top Artists</h2>
          <span className="text-xs font-semibold text-spotify-green">{getTimeRangeDisplay()}</span>
        </div>
        <div className="py-10">
          <div className="spinner w-12 h-12 border-4 border-spotify-green border-t-transparent rounded-full mb-4 mx-auto animate-spin"></div>
          <p className="text-spotify-light-gray">Loading your top artists...</p>
        </div>
      </div>
    );
  }

  if (error || isError) {
    return (
      <div className="p-6 rounded-lg bg-spotify-dark-gray shadow-lg text-center">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Top Artists</h2>
          <span className="text-xs font-semibold text-spotify-green">{getTimeRangeDisplay()}</span>
        </div>
        <div className="py-10">
          <svg className="w-12 h-12 text-red-500 opacity-70 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-spotify-light-gray mb-4">Failed to load top artists</p>
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

  if (artists.length === 0) {
    return (
      <div className="p-6 rounded-lg bg-spotify-dark-gray shadow-lg text-center">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Top Artists</h2>
          <span className="text-xs font-semibold text-spotify-green">{getTimeRangeDisplay()}</span>
        </div>
        <div className="py-10">
          <svg className="w-12 h-12 text-spotify-light-gray opacity-30 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
          <p className="text-spotify-light-gray">No artist data available for {getTimeRangeDisplay().toLowerCase()}.</p>
        </div>
      </div>
    );
  }

  // Toggle show more/less artists
  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  // Calculate how many artists to display based on showMore state
  const displayCount = showMore ? artists.length : 6;

  return (
    <div className="p-6 rounded-lg bg-spotify-dark-gray shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-white">Top Artists</h2>
        <span className="text-xs font-semibold text-spotify-green">{getTimeRangeDisplay()}</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {artists.slice(0, displayCount).map((artist, index) => (
          <div 
            key={artist.id} 
            className="flex items-center space-x-3 p-4 rounded-md bg-spotify-black bg-opacity-30 hover:bg-opacity-50 transition-all duration-300 transform hover:scale-102 hover:shadow-xl"
          >
            <span className="font-bold text-xl text-spotify-green opacity-70 mr-1">
              {index + 1}
            </span>
            
            {artist.images && artist.images.length > 0 ? (
              <div className="w-16 h-16 min-w-16 overflow-hidden rounded-full shadow-md ring-2 ring-spotify-green ring-opacity-30">
                <img 
                  src={artist.images[0].url} 
                  alt={artist.name} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="w-16 h-16 min-w-16 bg-spotify-light-gray bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-spotify-light-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">{artist.name}</p>
              
              {artist.genres && artist.genres.length > 0 && (
                <p className="text-xs text-spotify-light-gray truncate mt-1">
                  {artist.genres.slice(0, 2).join(', ')}
                  {artist.genres.length > 2 && '...'}
                </p>
              )}
              
              {artist.followers && (
                <div className="flex items-center mt-1">
                  <svg className="w-3 h-3 text-spotify-light-gray mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-spotify-light-gray">
                    {new Intl.NumberFormat().format(artist.followers.total)}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {artists.length > 6 && (
        <div className="mt-4 text-center">
          <button 
            className="text-sm text-spotify-green hover:text-spotify-green-bright transition-colors"
            onClick={toggleShowMore}
          >
            {showMore ? 'Show less artists' : 'Show more artists'}
          </button>
        </div>
      )}
    </div>
  );
}
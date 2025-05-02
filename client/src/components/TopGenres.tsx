import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Artist, Genre, TimeFrame } from '@/types/spotify';
import { Button } from '@/components/ui/button';
import { parseArtist, extractGenres } from '@/lib/spotify';

interface TopGenresProps {
  timeFrame: TimeFrame;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export default function TopGenres({
  timeFrame,
  isLoading,
  isError,
  onRetry
}: TopGenresProps) {
  const { getAccessToken } = useAuth();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [showMore, setShowMore] = useState<boolean>(false);

  // Effect to fetch data when timeFrame changes
  useEffect(() => {
    async function fetchGenres() {
      setLoading(true);
      setError(false);
      
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          setError(true);
          setLoading(false);
          return;
        }
        
        // Fetch top artists to extract genre info
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
          const artists = data.map(parseArtist);
          const extractedGenres = extractGenres(artists);
          
          // Format percentage for display
          const formattedGenres = extractedGenres.map(genre => ({
            ...genre,
            percentage: Math.round(genre.percentage) // Make sure it's rounded
          }));
          
          console.log("Formatted genres:", formattedGenres);
          setGenres(formattedGenres);
        } else {
          setGenres([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching genres:', err);
        setError(true);
        setLoading(false);
      }
    }
    
    fetchGenres();
  }, [timeFrame, getAccessToken]);

  const getTimeRangeDisplay = () => {
    switch (timeFrame) {
      case 'short_term': return 'Last month';
      case 'medium_term': return 'Last 6 months';
      case 'long_term': return 'All time';
      default: return 'Last month';
    }
  };

  // Color palette for the genre bars
  const getColor = (index: number): string => {
    const colors = [
      'bg-green-500', 'bg-blue-500', 'bg-purple-500', 
      'bg-pink-500', 'bg-yellow-500', 'bg-indigo-500',
      'bg-red-500', 'bg-teal-500', 'bg-orange-500', 'bg-emerald-500'
    ];
    return colors[index % colors.length];
  };
  
  // Get actual CSS colors for styling
  const getColorValue = (index: number): string => {
    const colorValues = [
      '#10b981', '#3b82f6', '#8b5cf6',
      '#ec4899', '#eab308', '#6366f1',
      '#ef4444', '#14b8a6', '#f97316', '#10b981'
    ];
    return colorValues[index % colorValues.length];
  };

  if (loading || isLoading) {
    return (
      <div className="p-6 rounded-lg bg-spotify-dark-gray shadow-lg text-center">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Top Genres</h2>
          <span className="text-xs font-semibold text-spotify-green">{getTimeRangeDisplay()}</span>
        </div>
        <div className="py-10">
          <div className="spinner w-12 h-12 border-4 border-spotify-green border-t-transparent rounded-full mb-4 mx-auto animate-spin"></div>
          <p className="text-spotify-light-gray">Analyzing your music taste...</p>
        </div>
      </div>
    );
  }

  if (error || isError) {
    return (
      <div className="p-6 rounded-lg bg-spotify-dark-gray shadow-lg text-center">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Top Genres</h2>
          <span className="text-xs font-semibold text-spotify-green">{getTimeRangeDisplay()}</span>
        </div>
        <div className="py-10">
          <svg className="w-12 h-12 text-red-500 opacity-70 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-spotify-light-gray mb-4">Failed to load genre data</p>
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

  if (genres.length === 0) {
    return (
      <div className="p-6 rounded-lg bg-spotify-dark-gray shadow-lg text-center">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Top Genres</h2>
          <span className="text-xs font-semibold text-spotify-green">{getTimeRangeDisplay()}</span>
        </div>
        <div className="py-10">
          <svg className="w-12 h-12 text-spotify-light-gray opacity-30 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
          <p className="text-spotify-light-gray">No genre data available for {getTimeRangeDisplay().toLowerCase()}.</p>
        </div>
      </div>
    );
  }

  // Toggle show more/less genres
  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  // Calculate how many genres to display based on showMore state
  const displayCount = showMore ? genres.length : 8;

  return (
    <div className="p-6 rounded-lg bg-spotify-dark-gray shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-white">Top Genres</h2>
        <span className="text-xs font-semibold text-spotify-green">{getTimeRangeDisplay()}</span>
      </div>
      
      <div className="space-y-4">
        {genres.slice(0, displayCount).map((genre, index) => (
          <div key={genre.name} className="space-y-2 group hover:transform hover:scale-102 transition-all duration-300">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-sm font-medium capitalize group-hover:text-white transition-colors" style={{ color: getColorValue(index) }}>{genre.name}</span>
              </div>
              <span className="text-xs font-semibold text-spotify-green">
                {genre.percentage}%
              </span>
            </div>
            
            <div className="w-full bg-spotify-black bg-opacity-40 rounded-full h-3 overflow-hidden shadow-inner">
              <div 
                className="h-3 rounded-full transition-all duration-1000 ease-out" 
                style={{ 
                  width: `${genre.percentage}%`, 
                  boxShadow: '0 0 10px rgba(0, 0, 0, 0.3) inset',
                  backgroundColor: getColorValue(index)
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      
      {genres.length > 8 && (
        <div className="mt-6 text-center">
          <button 
            className="text-sm text-spotify-green hover:text-spotify-green-bright transition-colors"
            onClick={toggleShowMore}
          >
            {showMore ? 'Show less genres' : 'View all genres'}
          </button>
        </div>
      )}
    </div>
  );
}
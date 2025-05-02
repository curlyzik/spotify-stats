import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TimeFrameSelector from "@/components/TimeFrameSelector";
import Receipt from "@/components/Receipt";
import TopArtists from "@/components/TopArtists";
import TopGenres from "@/components/TopGenres";
import AudioFeatures from "@/components/AudioFeatures";
import AuthRequired from "@/components/AuthRequired";
import SectionTabs, { SectionType } from "@/components/SectionTabs";
import { Track, TimeFrame } from "@/types/spotify";

export default function Home() {
  const { toast } = useToast();
  const {
    user,
    isAuthenticated,
    isLoading: isAuthLoading,
    login,
    getAccessToken,
  } = useAuth();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("short_term");
  const [currentSection, setCurrentSection] = useState<SectionType>("receipt");

  // Top tracks query
  const {
    data: tracks,
    isLoading: isTracksLoading,
    isError: isTracksError,
    refetch: refetchTracks,
  } = useQuery<Track[]>({
    queryKey: ["/api/spotify/top-tracks", timeFrame],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      const response = await apiRequest("POST", "/api/spotify/top-tracks", {
        accessToken,
        timeRange: timeFrame,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to fetch top tracks");
      }

      return response.json();
    },
    enabled: isAuthenticated,
    retry: 1,
  });

  const handleTimeFrameChange = (newTimeFrame: TimeFrame) => {
    setTimeFrame(newTimeFrame);
  };

  const handleSectionChange = (section: SectionType) => {
    setCurrentSection(section);
  };

  const handleLogin = () => {
    login();
  };

  const isLoading = isAuthLoading;

  return (
    <>
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {!isAuthenticated ? (
          <AuthRequired onLoginClick={handleLogin} isLoading={isLoading} />
        ) : (
          <>
            <div className="mb-12">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">Your Spotify Analytics</h1>
                <p className="text-spotify-light-gray">Dive into your music taste and discover what makes your playlist uniquely yours.</p>
              </div>
              
              {/* Time Frame Selector */}
              <TimeFrameSelector
                currentTimeFrame={timeFrame}
                onTimeFrameChange={handleTimeFrameChange}
                isLoading={isTracksLoading}
              />
              
              {/* Mobile Layout with Tabs */}
              <div className="md:hidden">
                <SectionTabs 
                  currentSection={currentSection}
                  onSectionChange={handleSectionChange}
                  isLoading={isTracksLoading}
                />
              
                <div className="space-y-6">
                  {currentSection === "receipt" && (
                    <div className="bg-gradient-to-br from-spotify-black to-spotify-dark-gray p-4 md:p-6 rounded-xl shadow-lg">
                      <Receipt
                        tracks={tracks || []}
                        username={user?.display_name || ""}
                        timeFrame={timeFrame}
                        isLoading={isTracksLoading}
                        isError={isTracksError}
                        onRetry={refetchTracks}
                      />
                    </div>
                  )}
                  
                  {currentSection === "artists" && (
                    <div className="mt-4">
                      <TopArtists 
                        timeFrame={timeFrame}
                        isLoading={isTracksLoading}
                        isError={isTracksError}
                        onRetry={refetchTracks}
                      />
                    </div>
                  )}
                  
                  {currentSection === "genres" && (
                    <div className="mt-4">
                      <TopGenres
                        timeFrame={timeFrame}
                        isLoading={isTracksLoading}
                        isError={isTracksError}
                        onRetry={refetchTracks}
                      />
                    </div>
                  )}
                  
                  {currentSection === "audio" && (
                    <div className="mt-4">
                      <AudioFeatures
                        tracks={tracks || []}
                        timeFrame={timeFrame}
                        isLoading={isTracksLoading}
                        isError={isTracksError}
                        onRetry={refetchTracks}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Desktop Layout - Two-column grid */}
              <div className="hidden md:grid md:grid-cols-2 gap-8">
                {/* Left Column - Top Tracks */}
                <div className="bg-gradient-to-br from-spotify-black to-spotify-dark-gray p-6 rounded-xl shadow-lg">
                  <Receipt
                    tracks={tracks || []}
                    username={user?.display_name || ""}
                    timeFrame={timeFrame}
                    isLoading={isTracksLoading}
                    isError={isTracksError}
                    onRetry={refetchTracks}
                  />
                </div>
                
                {/* Right Column - Stacked sections */}
                <div className="space-y-8">
                  <TopArtists 
                    timeFrame={timeFrame}
                    isLoading={isTracksLoading}
                    isError={isTracksError}
                    onRetry={refetchTracks}
                  />
                  
                  <TopGenres
                    timeFrame={timeFrame}
                    isLoading={isTracksLoading}
                    isError={isTracksError}
                    onRetry={refetchTracks}
                  />
                  
                  <AudioFeatures
                    tracks={tracks || []}
                    timeFrame={timeFrame}
                    isLoading={isTracksLoading}
                    isError={isTracksError}
                    onRetry={refetchTracks}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}

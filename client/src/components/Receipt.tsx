import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";
import { Track } from "@/types/spotify";

interface ReceiptProps {
  tracks: Track[];
  username: string;
  timeFrame: "short_term" | "medium_term" | "long_term";
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export default function Receipt({
  tracks,
  username,
  timeFrame,
  isLoading,
  isError,
  onRetry,
}: ReceiptProps) {
  console.log("tracks", tracks);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    setCurrentDate(today.toLocaleDateString("en-US", options));
  }, []);

  const getTimeRangeDisplay = () => {
    switch (timeFrame) {
      case "short_term":
        return "Last month";
      case "medium_term":
        return "Last 6 months";
      case "long_term":
        return "All time";
      default:
        return "Last month";
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const downloadReceipt = async () => {
    if (!receiptRef.current) return;

    try {
      // Temporarily modify styles for better rendering
      const elements = receiptRef.current.querySelectorAll(".track-item");
      elements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.padding = "8px 0";
        }
      });

      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: null,
        scale: 3, // Higher scale for better quality
        logging: true,
        useCORS: true,
        allowTaint: true,
        onclone: (document, element) => {
          // Add additional styling to the clone for better rendering
          const trackNames = element.querySelectorAll(".track-name");
          const artistNames = element.querySelectorAll(".artist-name");

          trackNames.forEach((el) => {
            if (el instanceof HTMLElement) {
              el.style.wordBreak = "break-word";
              el.style.maxWidth = "100%";
              el.style.whiteSpace = "normal";
            }
          });

          artistNames.forEach((el) => {
            if (el instanceof HTMLElement) {
              el.style.wordBreak = "break-word";
              el.style.maxWidth = "100%";
              el.style.whiteSpace = "normal";
            }
          });
        },
      });

      const link = document.createElement("a");
      link.download = `spotify-receipt-${timeFrame}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error generating receipt image:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center py-16">
        <div className="spinner w-12 h-12 border-4 border-spotify-green border-t-transparent rounded-full mb-4"></div>
        <p className="text-spotify-light-gray">Loading your top tracks...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <svg
          className="w-12 h-12 text-red-500 mb-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <h3 className="text-xl font-bold mb-2">Something went wrong</h3>
        <p className="text-spotify-light-gray mb-6">
          We couldn't fetch your top tracks. Please try again.
        </p>
        <Button variant="spotify" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div
        ref={receiptRef}
        className="bg-spotify-dark-gray shadow-receipt rounded-t-lg overflow-hidden"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">Top Tracks Receipt</h2>
              <p className="text-spotify-light-gray text-sm">
                <span>{getTimeRangeDisplay()}</span> •{" "}
                <span>{currentDate}</span>
              </p>
            </div>
          </div>

          <div className="mb-6 pb-4 border-b border-spotify-light-gray border-opacity-20">
            <p className="text-xs text-spotify-light-gray uppercase font-medium mb-2">
              Username
            </p>
            <p className="font-mono text-sm">{username}</p>
          </div>

          <div className="mb-6">
            <p className="text-xs text-spotify-light-gray uppercase font-medium mb-3">
              Items
            </p>

            <div className="receipt-paper rounded p-4 font-mono text-sm">
              <div className="space-y-5">
                {tracks.map((track, index) => (
                  <a
                    key={track.id}
                    className={`track-item block ${
                      index < tracks.length - 1
                        ? "border-b border-dashed border-spotify-light-gray border-opacity-20 pb-2"
                        : ""
                    }`}
                    href={track.external_urls?.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-spotify-green min-w-[30px]">
                        #{index + 1}
                      </span>
                      <span className="text-xs text-right text-spotify-light-gray min-w-[40px]">
                        {formatDuration(track.duration_ms)}
                      </span>
                    </div>
                    <div className="flex flex-col mt-2 w-full">
                      <div
                        className="track-name font-medium break-words whitespace-normal"
                        style={{
                          overflowWrap: "break-word",
                          hyphens: "auto",
                          maxWidth: "100%",
                          display: "block",
                        }}
                      >
                        {track.name}
                      </div>
                      <div
                        className="artist-name text-xs text-spotify-light-gray break-words whitespace-normal mt-1"
                        style={{
                          overflowWrap: "break-word",
                          hyphens: "auto",
                          maxWidth: "100%",
                          display: "block",
                        }}
                      >
                        {track.artists.map((artist) => artist.name).join(", ")}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between text-xs text-spotify-light-gray pt-2 border-t border-spotify-light-gray border-opacity-20">
            <span>spotify.com</span>
            <span>Generated with Spotify Receipt</span>
          </div>
        </div>
      </div>

      <div className="receipt-edge bg-spotify-dark-gray"></div>

      <div className="mt-6 text-center">
        <Button
          variant="spotify"
          className="py-3 px-6 flex items-center mx-auto"
          onClick={downloadReceipt}
        >
          <Download className="w-5 h-5 mr-2" />
          Download Receipt
        </Button>
      </div>
    </div>
  );
}

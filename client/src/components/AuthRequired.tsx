import { Button } from "@/components/ui/button";

interface AuthRequiredProps {
  onLoginClick: () => void;
  isLoading: boolean;
}

export default function AuthRequired({ onLoginClick, isLoading }: AuthRequiredProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <svg className="w-16 h-16 mb-4 text-spotify-green" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm-1-5a1 1 0 112 0v3a1 1 0 11-2 0v-3zm1-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
      </svg>
      <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
      <p className="text-spotify-light-gray text-center max-w-md mb-6">
        Please log in with your Spotify account to see your top tracks receipt.
      </p>
      <Button 
        variant="spotify"
        className="py-3 px-6"
        onClick={onLoginClick}
        disabled={isLoading}
      >
        {isLoading ? "Connecting..." : "Log in with Spotify"}
      </Button>
    </div>
  );
}

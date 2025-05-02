import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function Header() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  const handleLogin = () => {
    login();
  };

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <header className="w-full bg-spotify-dark-gray py-4 px-6 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <h1 className="text-xl font-bold text-spotify-green">Statify</h1>
      </div>

      <div className="flex items-center">
        {isAuthenticated && user ? (
          <div className="flex items-center space-x-3">
            <a
              className="w-8 h-8 block rounded-full bg-spotify-light-gray overflow-hidden"
              href={user.external_urls?.spotify}
              target="_blank"
              rel="noopener noreferrer"
            >
              {user.images && user.images.length > 0 ? (
                <img
                  src={user.images[0].url}
                  alt="User profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-spotify-light-gray" />
              )}
            </a>
            <a
              className="text-sm block font-medium"
              href={user.external_urls?.spotify}
              target="_blank"
              rel="noopener noreferrer"
            >
              {user.display_name}
            </a>
            <Button
              variant="ghost"
              className="text-sm text-spotify-light-gray hover:text-white transition duration-300"
              onClick={handleLogout}
            >
              Log out
            </Button>
          </div>
        ) : (
          <Button
            variant="spotify"
            onClick={handleLogin}
            disabled={isLoading}
            className="py-2 px-4"
          >
            {isLoading ? "Connecting..." : "Log in with Spotify"}
          </Button>
        )}
      </div>
    </header>
  );
}

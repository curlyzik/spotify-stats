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
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.5 16.5C16.3 16.7 16 16.8 15.7 16.8C15.4 16.8 15.1 16.7 14.9 16.5C13.5 15.4 11.8 14.8 10 14.8C8.7 14.8 7.4 15.1 6.2 15.6C5.8 15.8 5.3 15.6 5.1 15.2C4.9 14.8 5.1 14.3 5.5 14.1C6.9 13.5 8.4 13.2 10 13.2C12.2 13.2 14.2 13.9 15.9 15.2C16.3 15.5 16.3 16.1 15.9 16.5H16.5ZM17.7 13.8C17.5 14 17.1 14.1 16.8 14.1C16.5 14.1 16.2 14 16 13.8C14.3 12.5 12.1 11.7 9.8 11.7C8.3 11.7 6.8 12.1 5.4 12.7C5 12.9 4.4 12.7 4.2 12.3C4 11.9 4.2 11.3 4.6 11.1C6.2 10.4 8 10 9.8 10C12.5 10 15.1 10.9 17.1 12.5C17.5 12.8 17.6 13.4 17.2 13.8H17.7ZM18.9 10.6C18.7 10.8 18.3 11 17.9 11C17.6 11 17.3 10.9 17 10.7C15 9.1 12.2 8.2 9.3 8.2C7.5 8.2 5.6 8.6 3.9 9.4C3.4 9.6 2.9 9.4 2.6 8.9C2.4 8.4 2.6 7.9 3.1 7.6C5.1 6.7 7.2 6.2 9.3 6.2C12.7 6.2 15.9 7.2 18.3 9.1C18.7 9.5 18.8 10.1 18.4 10.5L18.9 10.6Z" fill="#1DB954"/>
        </svg>
        <h1 className="text-xl font-bold">Spotify Receipt</h1>
      </div>

      <div className="flex items-center">
        {isAuthenticated && user ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-spotify-light-gray overflow-hidden">
              {user.images && user.images.length > 0 ? (
                <img src={user.images[0].url} alt="User profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-spotify-light-gray" />
              )}
            </div>
            <span className="text-sm font-medium">{user.display_name}</span>
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

export default function Footer() {
  return (
    <footer className="py-6 px-4 bg-spotify-dark-gray mt-auto">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-spotify-light-gray text-sm">
        <p>© {new Date().getFullYear()} Spotify Receipt Generator. Not affiliated with Spotify AB.</p>
        <div className="mt-4 md:mt-0">
          <a href="#" className="hover:text-white transition duration-300">Privacy Policy</a>
          <span className="mx-2">•</span>
          <a href="#" className="hover:text-white transition duration-300">Terms of Use</a>
        </div>
      </div>
    </footer>
  );
}

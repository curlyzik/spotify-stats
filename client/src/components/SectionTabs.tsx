import { cn } from '@/lib/utils';

export type SectionType = 'receipt' | 'artists' | 'genres' | 'audio';

interface SectionTabsProps {
  currentSection: SectionType;
  onSectionChange: (section: SectionType) => void;
  isLoading: boolean;
}

export default function SectionTabs({
  currentSection,
  onSectionChange,
  isLoading
}: SectionTabsProps) {
  const sectionOptions = [
    { id: 'receipt', label: 'Top Tracks' },
    { id: 'artists', label: 'Top Artists' },
    { id: 'genres', label: 'Top Genres' },
    { id: 'audio', label: 'Audio Features' }
  ] as const;

  return (
    <div className="max-w-lg mx-auto mb-8">
      <div className="bg-spotify-dark-gray rounded-lg p-1 flex">
        {sectionOptions.map((option) => (
          <button
            key={option.id}
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-center font-medium transition-colors",
              currentSection === option.id 
                ? "bg-spotify-green text-white" 
                : "text-spotify-light-gray hover:text-white"
            )}
            onClick={() => onSectionChange(option.id as SectionType)}
            disabled={isLoading || currentSection === option.id}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
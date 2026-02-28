import { useEffect } from "react";
import { Search } from "lucide-react";

interface CompactHeaderProps {
  title: string;
  subtitle: string;
  onSearch: (query: string) => void;
  searchPlaceholder?: string;
}

export function CompactHeader({ title, subtitle, onSearch, searchPlaceholder }: CompactHeaderProps) {
  useEffect(() => {
    const handleFocusSearch = () => {
      const input = document.getElementById("compact-search-input");
      if (input) {
        input.focus();
        input.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    window.addEventListener("focus-hero-search", handleFocusSearch);
    return () => window.removeEventListener("focus-hero-search", handleFocusSearch);
  }, []);

  return (
    <div className="relative w-full py-6 md:py-8 flex flex-col items-center justify-center text-center overflow-visible mb-6">
      {/* Content */}
      <div className="relative z-10 container max-w-7xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8">
          {/* Title Group - Left Aligned on Desktop */}
          <div className="text-center md:text-left space-y-2 flex-shrink-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white drop-shadow-sm transition-colors">
              {title}
            </h1>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed transition-colors max-w-md mx-auto md:mx-0">
              {subtitle}
            </p>
          </div>

          {/* Search Bar - Right Aligned on Desktop */}
          <div className="w-full md:max-w-sm relative group">
            {/* Subtle Glow Effect - smaller blur */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur opacity-10 group-hover:opacity-30 transition-opacity duration-500" />
            
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                id="compact-search-input"
                type="text"
                placeholder={searchPlaceholder || "Search..."}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-full bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all shadow-sm text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

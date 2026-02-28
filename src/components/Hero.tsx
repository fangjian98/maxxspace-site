import { useEffect } from "react";
import { Search } from "lucide-react";

interface HeroProps {
  title: string;
  subtitle: string;
  onSearch: (query: string) => void;
  searchPlaceholder?: string;
}

export function Hero({ title, subtitle, onSearch, searchPlaceholder }: HeroProps) {
  useEffect(() => {
    const handleFocusSearch = () => {
      const input = document.getElementById("hero-search-input");
      if (input) {
        input.focus();
        input.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    window.addEventListener("focus-hero-search", handleFocusSearch);
    return () => window.removeEventListener("focus-hero-search", handleFocusSearch);
  }, []);

  return (
    <div className="relative w-full py-20 flex flex-col items-center justify-center text-center overflow-visible mb-8">
      {/* Content */}
      <div className="relative z-10 container max-w-4xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white drop-shadow-sm transition-colors">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-300 mb-10 max-w-2xl mx-auto font-medium leading-relaxed transition-colors">
          {subtitle}
        </p>

        {/* Liquid Glass Search Bar */}
        <div className="w-full max-w-2xl mx-auto relative group">
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
          
          <div className="relative flex items-center">
            <Search className="absolute left-5 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            <input
              id="hero-search-input"
              type="text"
              placeholder={searchPlaceholder || "Search for resources, tools, and inspiration..."}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full h-16 pl-14 pr-6 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-white/60 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-white/20 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none text-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

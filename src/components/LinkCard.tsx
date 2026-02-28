import { useState } from "react";
import { ExternalLink, Heart } from "lucide-react";
import { useBookmarks } from "@/contexts/BookmarksContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { LinkItem } from "@/types";
import { cn } from "@/lib/utils";
import { getTagColor } from "@/lib/tagUtils";
import { Link } from "wouter";

interface LinkCardProps {
  item: LinkItem;
}

// Helper to get hostname for favicon
const getHostname = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
};

export function LinkCard({ item }: LinkCardProps) {
  const { toggleFavorite, isFavorite } = useBookmarks();
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  const IconComponent = (item.icon && (Icons[item.icon as keyof typeof Icons] as LucideIcon)) || Icons.Globe;
  const isLiked = isFavorite(item.id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error("请先登录后收藏");
      return;
    }

    setIsLikeAnimating(true);
    toggleFavorite(item.id);
    setTimeout(() => setIsLikeAnimating(false), 300);
  };
  const hostname = getHostname(item.url);
  
  // APIs for dynamic images
  const screenshotUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(item.url)}?w=600&h=400`;
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;

  return (
    <div
      className="group relative flex flex-col h-full bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-white/60 dark:border-white/10 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/5 dark:hover:shadow-black/50 hover:-translate-y-1 hover:bg-white/80 dark:hover:bg-white/10 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-0"
        aria-label={item.title}
      />

      {/* Card Header / Screenshot Area */}
      <div className="h-32 w-full bg-slate-100 dark:bg-slate-900/50 relative overflow-hidden pointer-events-none">
         {/* Background Screenshot */}
         {!imgError ? (
           <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
             <img 
               src={screenshotUrl} 
               alt={`${item.title} preview`}
               className="w-full h-full object-cover opacity-90 dark:opacity-70 transition-opacity"
               onError={() => setImgError(true)}
               loading="lazy"
             />
             {/* Gradient Overlay for better text/icon visibility */}
             <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent opacity-100 dark:from-black/80 dark:via-black/20 dark:to-transparent" />
           </div>
         ) : (
           /* Fallback Pattern if screenshot fails */
           <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 group-hover:from-blue-50 group-hover:to-purple-50 dark:group-hover:from-blue-900/20 dark:group-hover:to-purple-900/20 transition-colors duration-500" />
         )}

         {/* Centered Icon / Favicon */}
         <div className="absolute inset-0 flex items-center justify-center">
            <div className={cn(
               "w-16 h-16 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-black/50 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 overflow-hidden border border-white/50 dark:border-white/10",
               !faviconError ? "bg-transparent" : "bg-white dark:bg-slate-800"
             )}>
               {!faviconError ? (
                 <img 
                   src={faviconUrl} 
                   alt="icon" 
                   className="w-10 h-10 object-contain p-1"
                   onError={() => setFaviconError(true)}
                 />
               ) : (
                 <IconComponent className="w-8 h-8 text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
               )}
            </div>
         </div>
         
         {/* Favorite Button */}
         <div className="absolute top-3 right-3 z-20 flex gap-2">
           <button
             onClick={handleFavorite}
             className={cn(
               "p-2 rounded-full backdrop-blur-md transition-all duration-300 shadow-sm pointer-events-auto",
               isLiked 
                 ? "bg-red-50 dark:bg-red-900/30 text-red-500" 
                 : "bg-white/80 dark:bg-black/50 text-slate-400 dark:text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-800"
             )}
           >
             <Heart className={cn("w-4 h-4 transition-transform", isLiked && "fill-current", isLikeAnimating && "scale-150")} />
           </button>
           
           <div className="p-2 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur text-slate-600 dark:text-slate-300 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <ExternalLink className="w-4 h-4" />
           </div>
         </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col relative bg-white/40 dark:bg-white/5 backdrop-blur-sm pointer-events-none">
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {item.title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">
          {item.description}
        </p>
        
        {/* Tags */}
        <div className="mt-auto flex flex-wrap gap-2 pointer-events-auto">
          {item.tags?.slice(0, 3).map(tag => (
            <Link key={tag} href={`/tags?tag=${encodeURIComponent(tag)}`}>
              <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border cursor-pointer hover:opacity-80 transition-opacity", getTagColor(tag))}>
                {tag}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

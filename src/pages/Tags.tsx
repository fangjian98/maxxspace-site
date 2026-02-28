import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { LinkCard } from "@/components/LinkCard";
import { BlogCard } from "@/components/BlogCard";
import { useBookmarks } from "@/contexts/BookmarksContext";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Hash, Tag, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import bgImageLight from "@/assets/liquid-glass-bg.jpeg";
import bgImageDark from "@/assets/page-bg.jpeg";
import { useTheme } from "@/contexts/ThemeContext";
import type { BlogPost, LinkItem } from "@/types";
import { useLocation } from "wouter";

export default function Tags() {
  const { data } = useBookmarks();
  const { theme } = useTheme();
  const [location] = useLocation();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagSearchQuery, setTagSearchQuery] = useState("");

  // Helper to check if item is a blog post
  const isBlogPost = (item: any): item is BlogPost => {
    return 'content' in item && 'date' in item;
  };

  // Handle URL Query Params for initial tag selection
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tagParam = params.get("tag");
    if (tagParam) {
      setSelectedTag(decodeURIComponent(tagParam));
    }
  }, [location]); // Re-run when location changes (although wouter might not update location state on query param change, window search check is safe)

  // Extract all unique tags and count them from ALL sources
  const tagStats = useMemo(() => {
    const stats: Record<string, number> = {};
    
    // Helper to process tags from an array of items
    const processItems = (items: (LinkItem | BlogPost)[]) => {
      items.forEach(item => {
        if (item.tags) {
          item.tags.forEach(tag => {
            const normalizedTag = tag.trim();
            if (normalizedTag) {
              stats[normalizedTag] = (stats[normalizedTag] || 0) + 1;
            }
          });
        }
      });
    };

    // 1. Website Categories
    data.categories.forEach(cat => processItems(cat.items));
    
    // 2. Project Categories
    if (data.projectCategories) {
      data.projectCategories.forEach(cat => processItems(cat.items));
    }

    // 3. Tool Categories
    if (data.toolCategories) {
      data.toolCategories.forEach(cat => processItems(cat.items));
    }

    // 4. Blog Posts
    if (data.posts) {
      processItems(data.posts);
    }
    
    // Sort tags by count (descending) then alphabetically
    return Object.entries(stats).sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    });
  }, [data]);

  // Filter tags based on search query
  const filteredTags = useMemo(() => {
    if (!tagSearchQuery.trim()) return tagStats;
    const query = tagSearchQuery.toLowerCase();
    return tagStats.filter(([tag]) => tag.toLowerCase().includes(query));
  }, [tagStats, tagSearchQuery]);

  // Set initial selected tag if none selected and tags exist (only if no URL param was found/set)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!selectedTag && tagStats.length > 0 && !params.get("tag")) {
      setSelectedTag(tagStats[0][0]);
    }
  }, [tagStats, selectedTag]);

  // Update URL when tag changes
  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    // Optional: update URL to reflect selection without reloading
    const newUrl = `${window.location.pathname}?tag=${encodeURIComponent(tag)}`;
    window.history.pushState({ path: newUrl }, "", newUrl);
  };

  // Filter items based on selected tag from ALL sources
  const filteredItems = useMemo(() => {
    if (!selectedTag) return [];
    
    const items: (LinkItem | BlogPost)[] = [];

    // Helper to filter items
    const collectMatchingItems = (sourceItems: (LinkItem | BlogPost)[]) => {
      sourceItems.forEach(item => {
        if (item.tags && item.tags.some(t => t.trim() === selectedTag)) {
          items.push(item);
        }
      });
    };

    // 1. Website Categories
    data.categories.forEach(cat => collectMatchingItems(cat.items));

    // 2. Project Categories
    if (data.projectCategories) {
      data.projectCategories.forEach(cat => collectMatchingItems(cat.items));
    }

    // 3. Tool Categories
    if (data.toolCategories) {
      data.toolCategories.forEach(cat => collectMatchingItems(cat.items));
    }

    // 4. Blog Posts
    if (data.posts) {
      collectMatchingItems(data.posts);
    }

    return items;
  }, [selectedTag, data]);

  return (
    <div className="h-screen relative flex flex-col font-sans text-foreground overflow-hidden selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100">
      {/* Global Background */}
      <div className="fixed inset-0 z-[-1]">
        <div className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`}>
           <img src={bgImageLight} alt="" className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-white/40 backdrop-blur-[0px]" />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>
           <img src={bgImageDark} alt="" className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-black/40 backdrop-blur-[0px]" />
        </div>
      </div>

      <Navbar />

      {/* Main Content Area - Full height minus Navbar */}
      <main className="flex-1 flex flex-col pt-16 min-h-0 w-full max-w-7xl mx-auto">
        <div className="flex-1 flex flex-col md:flex-row gap-6 p-4 md:p-6 min-h-0">
          
          {/* Left Sidebar: Tag List */}
          <aside className="w-full md:w-64 flex-shrink-0 flex flex-col bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden h-[300px] md:h-full">
            <div className="p-4 border-b border-white/20 dark:border-white/5 bg-white/30 dark:bg-white/5 space-y-3 flex-shrink-0">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
                <Tag className="w-4 h-4" />
                <span>热门标签</span>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <Input 
                  placeholder="搜索标签..." 
                  value={tagSearchQuery}
                  onChange={(e) => setTagSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs bg-white/50 dark:bg-black/20 border-white/40 dark:border-white/10 focus-visible:ring-1"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 min-h-0 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
              <div className="space-y-1 pr-3">
                {filteredTags.length > 0 ? (
                  filteredTags.map(([tag, count]) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all",
                        selectedTag === tag 
                          ? "bg-blue-500 text-white shadow-md shadow-blue-500/20" 
                          : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-blue-400"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Hash className={cn("w-3.5 h-3.5", selectedTag === tag ? "text-blue-200" : "text-slate-400")} />
                        <span className="truncate">{tag}</span>
                      </div>
                      <Badge variant="secondary" className={cn(
                        "ml-2 text-xs font-normal h-5 min-w-5 flex items-center justify-center px-1",
                        selectedTag === tag 
                          ? "bg-blue-600 text-white" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      )}>
                        {count}
                      </Badge>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    未找到标签 "{tagSearchQuery}"
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Right Content: Grid */}
          <div className="flex-1 flex flex-col min-h-0 bg-white/30 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-white/20 dark:border-white/5 flex items-center gap-2 flex-shrink-0 bg-white/40 dark:bg-white/5">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Hash className="w-6 h-6 text-blue-500" />
                {selectedTag}
              </h2>
              <span className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                ({filteredItems.length} 个资源)
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 pb-10 animate-in fade-in zoom-in-95 duration-500 key-[selectedTag]">
                {filteredItems.map((item) => (
                  <div key={item.id} className="h-full">
                    {isBlogPost(item) ? (
                      <BlogCard post={item} />
                    ) : (
                      <LinkCard item={item} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

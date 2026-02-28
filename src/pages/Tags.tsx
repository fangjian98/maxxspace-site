import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { LinkCard } from "@/components/LinkCard";
import { BlogCard } from "@/components/BlogCard";
import { useBookmarks } from "@/contexts/BookmarksContext";
import { Badge } from "@/components/ui/badge";
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

  const isBlogPost = (item: any): item is BlogPost => {
    return 'content' in item && 'date' in item;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tagParam = params.get("tag");
    if (tagParam) {
      setSelectedTag(decodeURIComponent(tagParam));
    }
  }, [location]);

  const tagStats = useMemo(() => {
    const stats: Record<string, number> = {};
    
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

    data.categories.forEach(cat => processItems(cat.items));
    
    if (data.projectCategories) {
      data.projectCategories.forEach(cat => processItems(cat.items));
    }

    if (data.toolCategories) {
      data.toolCategories.forEach(cat => processItems(cat.items));
    }

    if (data.posts) {
      processItems(data.posts);
    }
    
    return Object.entries(stats).sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    });
  }, [data]);

  const filteredTags = useMemo(() => {
    if (!tagSearchQuery.trim()) return tagStats;
    const query = tagSearchQuery.toLowerCase();
    return tagStats.filter(([tag]) => tag.toLowerCase().includes(query));
  }, [tagStats, tagSearchQuery]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!selectedTag && tagStats.length > 0 && !params.get("tag")) {
      setSelectedTag(tagStats[0][0]);
    }
  }, [tagStats, selectedTag]);

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    const newUrl = `${window.location.pathname}?tag=${encodeURIComponent(tag)}`;
    window.history.pushState({ path: newUrl }, "", newUrl);
  };

  const filteredItems = useMemo(() => {
    if (!selectedTag) return [];
    
    const items: (LinkItem | BlogPost)[] = [];

    const collectMatchingItems = (sourceItems: (LinkItem | BlogPost)[]) => {
      sourceItems.forEach(item => {
        if (item.tags && item.tags.some(t => t.trim() === selectedTag)) {
          items.push(item);
        }
      });
    };

    data.categories.forEach(cat => collectMatchingItems(cat.items));

    if (data.projectCategories) {
      data.projectCategories.forEach(cat => collectMatchingItems(cat.items));
    }

    if (data.toolCategories) {
      data.toolCategories.forEach(cat => collectMatchingItems(cat.items));
    }

    if (data.posts) {
      collectMatchingItems(data.posts);
    }

    return items;
  }, [selectedTag, data]);

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Global Background */}
      <div className="fixed inset-0 z-[-1]">
        <div className={`absolute inset-0 transition-opacity duration-700 ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`}>
          <img src={bgImageLight} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/80" />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-700 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>
          <img src={bgImageDark} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        </div>
      </div>

      <Navbar />

      <main className="flex-1 w-full pt-28 md:pt-32 pb-24">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
              标签导航
            </h1>
            <p className="text-muted-foreground text-lg">
              按标签浏览所有资源
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Sidebar: Tag List */}
            <aside className="w-full md:w-64 flex-shrink-0 flex flex-col bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden h-auto md:h-[calc(100vh-220px)] md:sticky md:top-24">
              <div className="p-4 border-b border-border/50 space-y-3 flex-shrink-0">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Tag className="w-4 h-4 text-primary" />
                  <span>热门标签</span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    placeholder="搜索标签..." 
                    value={tagSearchQuery}
                    onChange={(e) => setTagSearchQuery(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 text-sm bg-muted/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 min-h-0">
                <div className="space-y-1">
                  {filteredTags.length > 0 ? (
                    filteredTags.map(([tag, count]) => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all",
                          selectedTag === tag 
                            ? "bg-primary text-primary-foreground" 
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Hash className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{tag}</span>
                        </div>
                        <Badge variant="secondary" className={cn(
                          "ml-2 text-xs font-normal h-5 min-w-5 flex items-center justify-center px-1.5",
                          selectedTag === tag 
                            ? "bg-primary-foreground/20 text-primary-foreground" 
                            : ""
                        )}>
                          {count}
                        </Badge>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      未找到标签 "{tagSearchQuery}"
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* Right Content */}
            <div className="flex-1 min-w-0">
              {/* Selected Tag Header */}
              <div className="flex items-center gap-3 mb-6 p-4 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Hash className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {selectedTag}
                  </h2>
                  <span className="text-muted-foreground text-sm">
                    {filteredItems.length} 个资源
                  </span>
                </div>
              </div>
              
              {/* Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
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

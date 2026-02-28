import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BlogCard } from "@/components/BlogCard";
import { useBookmarks } from "@/contexts/BookmarksContext";
import { useTheme } from "@/contexts/ThemeContext";
import { format } from "date-fns";
import { CalendarDays, Archive, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import bgImageLight from "@/assets/liquid-glass-bg.jpeg";
import bgImageDark from "@/assets/page-bg.jpeg";

export default function BlogList() {
  const { data } = useBookmarks();
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Group posts by Year-Month
  const timeline = useMemo(() => {
    const groups: Record<string, number> = {};
    const posts = data.posts || [];
    
    posts.forEach(post => {
      const dateKey = format(new Date(post.date), "yyyy-MM");
      groups[dateKey] = (groups[dateKey] || 0) + 1;
    });

    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [data.posts]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    const posts = data.posts || [];
    if (!selectedDate) return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return posts.filter(post => 
      format(new Date(post.date), "yyyy-MM") === selectedDate
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data.posts, selectedDate]);

  const pageTitle = data.blogPage?.title || "技术博客";
  const pageSubtitle = data.blogPage?.subtitle || "分享技术心得与生活感悟";

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
              {pageTitle}
            </h1>
            <p className="text-muted-foreground text-lg">
              {pageSubtitle}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar: Timeline */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <div className="sticky top-24">
                <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 p-4">
                  <div className="flex items-center gap-2 text-foreground font-semibold mb-4">
                    <Archive className="w-4 h-4" />
                    <span>归档</span>
                  </div>
                  
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedDate(null)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all",
                        !selectedDate
                          ? "bg-primary text-primary-foreground" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <span className="font-medium">全部文章</span>
                      <span className="text-xs opacity-70">{(data.posts || []).length}</span>
                    </button>

                    {timeline.map(([date, count]) => (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all",
                          selectedDate === date 
                            ? "bg-primary/10 text-primary" 
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            selectedDate === date ? "bg-primary" : "bg-muted-foreground/30"
                          )} />
                          <span>{date}</span>
                        </div>
                        <span className="text-xs opacity-70">{count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Content: Blog List */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-6">
                <CalendarDays className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                  {selectedDate ? `${selectedDate} 归档` : "最新发布"}
                </h2>
                <span className="text-sm text-muted-foreground">
                  ({filteredPosts.length} 篇)
                </span>
              </div>
              
              <div className="space-y-4 animate-fade-in" key={selectedDate || 'all'}>
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))
                ) : (
                  <div className="text-center py-20 text-muted-foreground">
                    暂无文章
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

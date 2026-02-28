import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BlogCard } from "@/components/BlogCard";
import { useBookmarks } from "@/contexts/BookmarksContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { CalendarDays, Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import bgImageLight from "@/assets/liquid-glass-bg.jpeg";
import bgImageDark from "@/assets/page-bg.jpeg";

export default function BlogList() {
  const { data } = useBookmarks();
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // "yyyy-MM"

  // Group posts by Year-Month
  const timeline = useMemo(() => {
    const groups: Record<string, number> = {};
    const posts = data.posts || [];
    
    posts.forEach(post => {
      const dateKey = format(new Date(post.date), "yyyy-MM");
      groups[dateKey] = (groups[dateKey] || 0) + 1;
    });

    // Sort descending
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

  // Dynamic content
  const pageTitle = data.blogPage?.title || "技术博客";
  const pageSubtitle = data.blogPage?.subtitle || "分享技术心得与生活感悟";

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

      <main className="flex-1 flex flex-col pt-16 min-h-0 w-full max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="px-6 pt-8 pb-2 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-2 tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl font-medium">
            {pageSubtitle}
          </p>
        </div>

        <div className="flex-1 flex flex-col md:flex-row gap-6 p-4 md:p-6 min-h-0">
          
          {/* Left Sidebar: Timeline */}
          <aside className="w-full md:w-64 flex-shrink-0 flex flex-col bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden h-[300px] md:h-full">
            <div className="p-4 border-b border-white/20 dark:border-white/5 bg-white/30 dark:bg-white/5 space-y-3 flex-shrink-0">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
                <Archive className="w-4 h-4" />
                <span>时间轴</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 min-h-0 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedDate(null)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all",
                    !selectedDate
                      ? "bg-blue-500 text-white shadow-md shadow-blue-500/20" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-blue-400"
                  )}
                >
                  <span className="font-medium">全部文章</span>
                  <span className="opacity-70 text-xs">{(data.posts || []).length}</span>
                </button>

                {timeline.map(([date, count]) => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all border border-transparent",
                      selectedDate === date 
                        ? "bg-white dark:bg-white/10 border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 shadow-sm" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full", selectedDate === date ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-600")} />
                      <span>{date}</span>
                    </div>
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 min-w-[20px] text-center">
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Content: Blog List */}
          <div className="flex-1 flex flex-col min-h-0 bg-white/30 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-white/20 dark:border-white/5 flex items-center gap-2 flex-shrink-0 bg-white/40 dark:bg-white/5">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CalendarDays className="w-6 h-6 text-blue-500" />
                {selectedDate ? `${selectedDate} 归档` : "最新发布"}
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 scroll-smooth scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
              <div className="grid grid-cols-1 gap-6 pb-10 max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500 key-[selectedDate]">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))
                ) : (
                  <div className="text-center py-20 text-slate-400">
                    暂无文章
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

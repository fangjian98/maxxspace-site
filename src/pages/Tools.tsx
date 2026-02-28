import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { CategorySection } from "@/components/CategorySection";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBookmarks } from "@/contexts/BookmarksContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Search, X } from "lucide-react";
import bgImageLight from "@/assets/liquid-glass-bg.jpeg";
import bgImageDark from "@/assets/page-bg.jpeg";

export default function Tools() {
  const { data } = useBookmarks();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = useMemo(() => {
    const categories = data.toolCategories || [];
    
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase();
    
    return categories
      .map((category) => {
        const filteredItems = category.items.filter((item) => {
          const matchTitle = item.title.toLowerCase().includes(query);
          const matchDesc = item.description?.toLowerCase().includes(query);
          const matchTags = item.tags?.some((tag) => tag.toLowerCase().includes(query));
          
          return matchTitle || matchDesc || matchTags;
        });

        return {
          ...category,
          items: filteredItems,
        };
      })
      .filter((category) => category.items.length > 0);
  }, [searchQuery, data.toolCategories]);

  const pageTitle = data.toolsPage?.title || "开发者工具箱";
  const pageSubtitle = data.toolsPage?.subtitle || "提升效率的在线工具与生产力神器";

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

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto mb-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索工具..."
              className="w-full h-12 pl-12 pr-10 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Content */}
          {searchQuery ? (
            <div className="animate-fade-in">
              {filteredCategories.length > 0 ? (
                <div className="space-y-10">
                  {filteredCategories.map((category) => (
                    <CategorySection key={category.id} category={category} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium text-foreground mb-2">
                    未找到 "{searchQuery}" 相关结果
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-primary hover:underline underline-offset-4"
                  >
                    清除搜索
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              {/* Tabs */}
              <div className="flex justify-center mb-8 overflow-x-auto no-scrollbar">
                <TabsList className="inline-flex h-10 items-center gap-1 rounded-full bg-muted/50 p-1">
                  <TabsTrigger
                    value="all"
                    className="rounded-full px-4 text-sm font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
                  >
                    全部
                  </TabsTrigger>
                  {(data.toolCategories || []).map((category) => (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="rounded-full px-4 text-sm font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
                    >
                      {category.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Tab Content */}
              <TabsContent value="all" className="space-y-10 animate-fade-in">
                {(data.toolCategories || []).map((category) => (
                  <CategorySection key={category.id} category={category} />
                ))}
              </TabsContent>

              {(data.toolCategories || []).map((category) => (
                <TabsContent
                  key={category.id}
                  value={category.id}
                  className="animate-fade-in"
                >
                  <CategorySection category={category} />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

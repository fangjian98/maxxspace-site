import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { CompactHeader } from "@/components/CompactHeader";
import { CategorySection } from "@/components/CategorySection";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBookmarks } from "@/contexts/BookmarksContext";
import { useTheme } from "@/contexts/ThemeContext";
import bgImageLight from "@/assets/liquid-glass-bg.jpeg";
import bgImageDark from "@/assets/page-bg.jpeg";

export default function Websites() {
  const { data } = useBookmarks();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return data.categories;

    const query = searchQuery.toLowerCase();
    
    return data.categories
      .map((category) => {
        // Filter items within category
        const filteredItems = category.items.filter((item) => {
          const matchTitle = item.title.toLowerCase().includes(query);
          const matchDesc = item.description?.toLowerCase().includes(query);
          const matchTags = item.tags?.some((tag) => tag.toLowerCase().includes(query));
          
          return matchTitle || matchDesc || matchTags;
        });

        // Return new category object with filtered items
        return {
          ...category,
          items: filteredItems,
        };
      })
      .filter((category) => category.items.length > 0); // Remove empty categories
  }, [searchQuery, data.categories]);

  // Dynamic content from site settings
  const pageTitle = data.websitesPage?.title || data.title || "精选网站导航";
  const pageSubtitle = data.websitesPage?.subtitle || data.subtitle || "为您整理的高质量开发者资源与设计灵感";
  const searchHint = data.websitesPage?.searchHint;

  return (
    <div className="min-h-screen relative flex flex-col font-sans text-foreground overflow-x-hidden selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100">
      {/* Global Background */}
      <div className="fixed inset-0 z-[-1]">
        <div className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`}>
           <img src={bgImageLight} alt="" className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-white/60 backdrop-blur-[0px]" />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>
           <img src={bgImageDark} alt="" className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-black/60 backdrop-blur-[0px]" />
        </div>
      </div>

      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto pt-24 px-4 pb-20">
        <CompactHeader 
          title={pageTitle}
          subtitle={pageSubtitle}
          onSearch={setSearchQuery} 
          searchPlaceholder={searchHint}
        />

        <div className="container px-4 md:px-6 pb-20">
          
          {/* Search Mode: Show all filtered results without Tabs */}
          {searchQuery ? (
             <div className="animate-in fade-in zoom-in duration-500">
                {filteredCategories.length > 0 ? (
                  <div className="space-y-12">
                    {filteredCategories.map((category) => (
                      <CategorySection key={category.id} category={category} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="inline-block p-4 rounded-full bg-white/50 dark:bg-white/10 mb-4">
                      <span className="text-4xl">🔍</span>
                    </div>
                    <p className="text-xl text-slate-500 dark:text-slate-400 font-medium">
                      No results found for "{searchQuery}"
                    </p>
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline underline-offset-4"
                    >
                      Clear search
                    </button>
                  </div>
                )}
             </div>
          ) : (
            /* Browse Mode: Show Tabs */
            <Tabs defaultValue="all" className="w-full space-y-8">
              {/* Scrollable Tab List Container */}
              <div className="sticky top-16 z-30 -mx-4 px-4 py-2 bg-white/80 dark:bg-black/80 backdrop-blur-md md:static md:bg-transparent md:dark:bg-transparent md:p-0 md:mx-0 flex justify-start w-[calc(100%+2rem)] md:w-full overflow-x-auto no-scrollbar">
                <TabsList className="h-auto p-1.5 bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-full shadow-sm inline-flex min-w-max">
                  <TabsTrigger 
                    value="all"
                    className="rounded-full px-6 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-md transition-all duration-300"
                  >
                    全部
                  </TabsTrigger>
                  {data.categories.map((category) => (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id}
                      className="rounded-full px-6 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-md transition-all duration-300"
                    >
                      {category.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* All Content */}
              <TabsContent value="all" className="space-y-12 animate-in slide-in-from-bottom-4 fade-in duration-500 focus-visible:outline-none">
                {data.categories.map((category) => (
                  <CategorySection key={category.id} category={category} />
                ))}
              </TabsContent>

              {/* Individual Categories */}
              {data.categories.map((category) => (
                <TabsContent 
                  key={category.id} 
                  value={category.id}
                  className="animate-in slide-in-from-bottom-4 fade-in duration-500 focus-visible:outline-none"
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

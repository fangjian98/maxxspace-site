import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useBookmarks } from "@/contexts/BookmarksContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Streamdown } from "streamdown";
import bgImageLight from "@/assets/liquid-glass-bg.jpeg";
import bgImageDark from "@/assets/page-bg.jpeg";

export default function About() {
  const { data } = useBookmarks();
  const { theme } = useTheme();
  
  const title = data.aboutPage?.title || "关于本站";
  const content = data.aboutPage?.content || "暂无关于介绍。";

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
        <div className="container max-w-4xl mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
              {title}
            </h1>
            <p className="text-muted-foreground text-lg">
              了解更多关于本站的信息
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg prose-slate dark:prose-invert max-w-none 
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-xl prose-img:shadow-lg
            markdown-content
            bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-8 md:p-10"
          >
            <Streamdown>{content}</Streamdown>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

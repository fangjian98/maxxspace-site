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
  
  // Default content if not set
  const title = data.aboutPage?.title || "关于本站";
  const content = data.aboutPage?.content || "暂无关于介绍。";

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

      <main className="flex-1 container max-w-4xl mx-auto pt-24 md:pt-32 px-4 pb-20">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-100 mb-6 leading-tight">
              {title}
            </h1>
          </div>

          <div className="prose prose-lg prose-slate dark:prose-invert max-w-none 
            prose-headings:font-bold prose-headings:tracking-tight 
            prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-xl prose-img:shadow-lg
            markdown-content
            bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/40 dark:border-white/10 shadow-sm"
          >
            <Streamdown>{content}</Streamdown>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

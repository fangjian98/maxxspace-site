import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useBookmarks } from "@/contexts/BookmarksContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FeaturedSection } from "@/components/FeaturedSection";
import { Globe, PenTool, Hammer, FileText, ArrowRight } from "lucide-react";
import bgImageLight from "@/assets/liquid-glass-bg.jpeg";
import bgImageDark from "@/assets/page-bg.jpeg";
import { useTheme } from "@/contexts/ThemeContext";

// Typewriter Component
const Typewriter = ({ text, speed = 100 }: { text: string; speed?: number }) => {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayText("");
    
    const intervalId = setInterval(() => {
      if (i < text.length) {
        i++;
        setDisplayText(text.slice(0, i)); 
      } else {
        clearInterval(intervalId);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]);

  return (
    <span>
      {displayText}
      <span className="animate-pulse ml-1 text-blue-500">|</span>
    </span>
  );
};

export default function Home() {
  const { data } = useBookmarks();
  const { theme } = useTheme();

  // Helper to flatten categories to items and filter featured ones
  const featuredWebsites = data.categories
    .flatMap(c => c.items)
    .filter(i => i.isFeatured);
    
  const featuredTools = data.toolCategories
    .flatMap(c => c.items)
    .filter(i => i.isFeatured);
    
  const featuredProjects = data.projectCategories
    .flatMap(c => c.items)
    .filter(i => i.isFeatured);
    
  const featuredPosts = data.posts
    .filter(p => p.isFeatured);

  return (
    <div className="min-h-screen relative flex flex-col font-sans text-foreground overflow-x-hidden selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100">
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

      <main className="flex-1 w-full pt-24 md:pt-32 pb-20">
        
        {/* Hero Section */}
        <div className="container max-w-6xl mx-auto px-4 text-center mb-16 animate-in fade-in zoom-in duration-1000">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white drop-shadow-sm h-24">
            <Typewriter text={data.homePage?.title || data.title} speed={150} />
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            {data.homePage?.subtitle || data.subtitle}
          </p>
        </div>

        {/* 4-Grid Navigation (Restored) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto w-full px-4 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          
          {/* Websites Card */}
          <Link href="/websites">
            <div className="group relative overflow-hidden rounded-3xl p-8 h-[240px] flex flex-col justify-between cursor-pointer transition-transform duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2196F3] to-[#4FC3F7] opacity-90 transition-opacity" />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 text-white">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">网站资源</h3>
                <p className="text-white/80 font-medium">精选优质网站导航，分类整理</p>
              </div>
              
              <div className="relative z-10 flex justify-end">
                <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white group-hover:bg-white group-hover:text-blue-500 transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </Link>

          {/* Tools Card */}
          <Link href="/tools">
            <div className="group relative overflow-hidden rounded-3xl p-8 h-[240px] flex flex-col justify-between cursor-pointer transition-transform duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#9C27B0] to-[#E040FB] opacity-90 transition-opacity" />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 text-white">
                  <PenTool className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">在线工具</h3>
                <p className="text-white/80 font-medium">提升效率的生产力神器</p>
              </div>
              
              <div className="relative z-10 flex justify-end">
                <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white group-hover:bg-white group-hover:text-purple-500 transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </Link>

          {/* Projects Card */}
          <Link href="/projects">
            <div className="group relative overflow-hidden rounded-3xl p-8 h-[240px] flex flex-col justify-between cursor-pointer transition-transform duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF9800] to-[#FFC107] opacity-90 transition-opacity" />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 text-white">
                  <Hammer className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">开源项目</h3>
                <p className="text-white/80 font-medium">我的个人项目与实验作品</p>
              </div>
              
              <div className="relative z-10 flex justify-end">
                <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white group-hover:bg-white group-hover:text-orange-500 transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </Link>

          {/* Blog Card */}
          <Link href="/blog">
            <div className="group relative overflow-hidden rounded-3xl p-8 h-[240px] flex flex-col justify-between cursor-pointer transition-transform duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00C853] to-[#69F0AE] opacity-90 transition-opacity" />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 text-white">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">技术博客</h3>
                <p className="text-white/80 font-medium">分享技术心得与生活感悟</p>
              </div>
              
              <div className="relative z-10 flex justify-end">
                <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white group-hover:bg-white group-hover:text-green-600 transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </Link>

        </div>

        {/* Featured Content Sections */}
        <div className="space-y-4 max-w-7xl mx-auto w-full px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <FeaturedSection 
            title="精选网站" 
            items={featuredWebsites} 
            type="websites" 
          />
          
          <FeaturedSection 
            title="精选工具" 
            items={featuredTools} 
            type="tools" 
          />
          
          <FeaturedSection 
            title="精选项目" 
            items={featuredProjects} 
            type="projects" 
          />
          
          <FeaturedSection 
            title="精选博客" 
            posts={featuredPosts} 
            type="blog" 
          />
        </div>

      </main>

      <Footer />
    </div>
  );
}

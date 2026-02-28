import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useBookmarks } from "@/contexts/BookmarksContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FeaturedSection } from "@/components/FeaturedSection";
import { Globe, PenTool, Hammer, FileText, ArrowRight, Sparkles } from "lucide-react";
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
      <span className="animate-pulse ml-1 text-primary">|</span>
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

  const navCards = [
    {
      href: "/websites",
      title: "网站资源",
      description: "精选优质网站导航",
      icon: Globe,
      gradient: "from-blue-500 to-cyan-400",
      shadowColor: "shadow-blue-500/25",
    },
    {
      href: "/tools",
      title: "在线工具",
      description: "提升效率的生产力神器",
      icon: PenTool,
      gradient: "from-violet-500 to-purple-400",
      shadowColor: "shadow-violet-500/25",
    },
    {
      href: "/projects",
      title: "开源项目",
      description: "个人项目与实验作品",
      icon: Hammer,
      gradient: "from-amber-500 to-orange-400",
      shadowColor: "shadow-amber-500/25",
    },
    {
      href: "/blog",
      title: "技术博客",
      description: "分享技术心得与感悟",
      icon: FileText,
      gradient: "from-emerald-500 to-green-400",
      shadowColor: "shadow-emerald-500/25",
    },
  ];

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Global Background */}
      <div className="fixed inset-0 z-[-1]">
        <div className={`absolute inset-0 transition-opacity duration-700 ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`}>
          <img src={bgImageLight} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/80" />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-700 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>
          <img src={bgImageDark} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        </div>
      </div>

      <Navbar />

      <main className="flex-1 w-full pt-28 md:pt-36 pb-24">
        {/* Hero Section */}
        <div className="container max-w-5xl mx-auto px-4 text-center mb-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>发现优质资源</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 h-20 md:h-24 animate-slide-up">
            <span className="text-foreground">
              <Typewriter text={data.homePage?.title || data.title} speed={120} />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '200ms' }}>
            {data.homePage?.subtitle || data.subtitle}
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="container max-w-6xl mx-auto px-4 mb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {navCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Link key={card.href} href={card.href}>
                  <div 
                    className="group relative overflow-hidden rounded-2xl p-6 h-[200px] flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1 animate-scale-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-95`} />
                    
                    {/* Noise Texture */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')] opacity-50" />

                    {/* Shine Effect */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">{card.title}</h3>
                      <p className="text-white/80 text-sm">{card.description}</p>
                    </div>
                    
                    {/* Arrow */}
                    <div className="relative z-10 flex justify-end">
                      <div className="p-2.5 rounded-full bg-white/20 backdrop-blur-sm text-white group-hover:bg-white group-hover:text-primary transition-all duration-300">
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Featured Content Sections */}
        <div className="container max-w-6xl mx-auto px-4 space-y-16">
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

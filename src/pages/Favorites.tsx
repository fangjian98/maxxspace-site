import { useBookmarks } from "@/contexts/BookmarksContext";
import { LinkCard } from "@/components/LinkCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Heart, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import bgImageLight from "@/assets/liquid-glass-bg.jpeg";
import bgImageDark from "@/assets/page-bg.jpeg";

export default function Favorites() {
  const { data } = useBookmarks();
  const { user } = useAuth();
  const { theme } = useTheme();

  const allItems = [
    ...data.categories.flatMap(c => c.items),
    ...data.projectCategories.flatMap(c => c.items),
    ...data.toolCategories.flatMap(c => c.items)
  ];

  const favoriteItems = allItems.filter(item => data.favorites?.includes(item.id));

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
              我的收藏
            </h1>
            <p className="text-muted-foreground text-lg">
              {favoriteItems.length} 个收藏的内容
            </p>
          </div>

          {!user ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">请先登录</h3>
              <p className="text-muted-foreground max-w-md mb-6 px-4">
                登录后即可查看和管理您的收藏内容。收藏的内容将与您的账户绑定，跨设备同步。
              </p>
              <Link href="/login">
                <Button className="gap-2">
                  立即登录
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ) : favoriteItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in">
              {favoriteItems.map((item) => (
                <div key={item.id} className="h-[260px]">
                  <LinkCard item={item} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">暂无收藏</h3>
              <p className="text-muted-foreground max-w-md mb-6 px-4">
                您还没有收藏任何内容。在浏览网站、工具或项目时，点击卡片右上角的爱心图标即可收藏。
              </p>
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  去浏览
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

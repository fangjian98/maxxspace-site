import { useBookmarks } from "@/contexts/BookmarksContext";
import { LinkCard } from "@/components/LinkCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Favorites() {
  const { data } = useBookmarks();
  const { user } = useAuth();

  // Aggregate all items
  const allItems = [
    ...data.categories.flatMap(c => c.items),
    ...data.projectCategories.flatMap(c => c.items),
    ...data.toolCategories.flatMap(c => c.items)
  ];

  // Filter favorites
  const favoriteItems = allItems.filter(item => data.favorites?.includes(item.id));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-black font-sans text-foreground selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100">
      <Navbar />
      
      <main className="flex-1 container max-w-7xl mx-auto pt-24 md:pt-32 px-4 pb-20">
        <div className="flex items-center gap-3 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">我的收藏</h1>
            <p className="text-slate-500 dark:text-slate-400">
              {favoriteItems.length} 个收藏的内容
            </p>
          </div>
        </div>

        {!user ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white/40 dark:bg-white/5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <Heart className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">请先登录</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
              登录后即可查看和管理您的收藏内容。收藏的内容将与您的账户绑定，跨设备同步。
            </p>
            <Link href="/login">
              <Button>立即登录</Button>
            </Link>
          </div>
        ) : favoriteItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            {favoriteItems.map((item) => (
              <div key={item.id} className="h-[280px]">
                <LinkCard item={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white/40 dark:bg-white/5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-500">
            <Heart className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">暂无收藏</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
              您还没有收藏任何内容。在浏览网站、工具或项目时，点击卡片右上角的爱心图标即可收藏。
            </p>
            <Link href="/">
              <Button variant="outline">去浏览</Button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

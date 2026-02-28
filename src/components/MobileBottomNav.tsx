import { Link, useLocation } from "wouter";
import { Home, Globe, Wrench, FolderHeart, BookOpen, MessageSquare, MoreHorizontal } from "lucide-react";

const navItems = [
  { href: "/", label: "首页", icon: Home },
  { href: "/websites", label: "网站", icon: Globe },
  { href: "/tools", label: "工具", icon: Wrench },
  { href: "/projects", label: "项目", icon: FolderHeart },
  { href: "/blog", label: "博客", icon: BookOpen },
  { href: "/moments", label: "动态", icon: MessageSquare },
];

export function MobileBottomNav() {
  const [location] = useLocation();

  // 检查当前路径是否匹配
  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-white/20 dark:border-white/10 safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link key={item.href} href={item.href}>
              <div className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]">
                <div className={`relative ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  <Icon className="w-5 h-5" />
                  {active && (
                    <div className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                  )}
                </div>
                <span className={`text-[10px] font-medium ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

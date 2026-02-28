import { Link, useLocation } from "wouter";
import { Home, Globe, Wrench, FolderHeart, BookOpen, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden glass border-t border-border/50 safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all",
                  active && "scale-105"
                )}
              >
                {/* Active Background */}
                {active && (
                  <div className="absolute inset-0 bg-primary/10 rounded-xl" />
                )}
                
                {/* Icon */}
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors relative z-10",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                />
                
                {/* Label */}
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors relative z-10",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
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

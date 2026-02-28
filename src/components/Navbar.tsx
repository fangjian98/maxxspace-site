import { useState, useEffect } from "react";
import { LayoutGrid, Search, User, LogOut, Heart, Menu, X, Sparkles } from "lucide-react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useBookmarks } from "@/contexts/BookmarksContext";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { data } = useBookmarks();
  const { user, profile, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // 触发全局搜索
  const openGlobalSearch = () => {
    window.dispatchEvent(new CustomEvent("open-global-search"));
  };

  // 监听滚动
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logoIconStr = data.logoIcon;
  const isImageLogo = logoIconStr?.startsWith("http") || logoIconStr?.startsWith("data:image");
  const LucideLogo = (!isImageLogo && logoIconStr && (Icons[logoIconStr as keyof typeof Icons] as LucideIcon));

  const navLinks = [
    { href: "/", label: "首页" },
    { href: "/websites", label: "网站" },
    { href: "/tools", label: "工具" },
    { href: "/projects", label: "项目" },
    { href: "/blog", label: "博客" },
    { href: "/moments", label: "动态" },
    { href: "/tags", label: "标签" },
    { href: "/about", label: "关于" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <>
      {/* Modern Navbar */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
          scrolled 
            ? 'glass border-b border-border/50 shadow-sm' 
            : 'bg-transparent'
        }`}
      >
        <div className="container h-full mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-full">
            {/* Left Section */}
            <div className="flex items-center gap-8">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-muted/50 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-foreground" />
                ) : (
                  <Menu className="w-5 h-5 text-foreground" />
                )}
              </button>

              {/* Logo */}
              <Link href="/">
                <div className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-primary/25 overflow-hidden group-hover:shadow-primary/40 transition-shadow">
                    {isImageLogo ? (
                      <img src={logoIconStr} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      LucideLogo ? <LucideLogo className="w-5 h-5" /> : (logoIconStr || "N")
                    )}
                  </div>
                  <span className="hidden sm:block text-lg font-semibold text-foreground tracking-tight">
                    {data.logoText}
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <span
                      className={`relative px-4 py-2 text-sm font-medium cursor-pointer transition-colors ${
                        isActive(link.href)
                          ? 'text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {link.label}
                      {isActive(link.href) && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                      )}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-1">
              {/* Search Button */}
              <button
                onClick={openGlobalSearch}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 h-9 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                <Search className="w-4 h-4" />
                <span className="hidden md:inline">搜索</span>
                <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-background/50 rounded border border-border">
                  ⌘K
                </kbd>
              </button>

              {/* Mobile Search */}
              <button
                onClick={openGlobalSearch}
                className="sm:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Search className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-primary/20 transition-all">
                      <Avatar className="h-full w-full">
                        <AvatarImage src={profile?.avatar_url} alt={profile?.nickname || user.email} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-cyan-500 text-white font-medium text-sm">
                          {profile?.nickname?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    className="w-60 p-2 bg-card/95 backdrop-blur-xl border-border rounded-xl shadow-lg" 
                    align="end"
                  >
                    <DropdownMenuLabel className="px-3 py-2">
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold text-foreground">{profile?.nickname || "用户"}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1 bg-border" />
                    <DropdownMenuItem 
                      onClick={() => setLocation("/profile")}
                      className="px-3 py-2 rounded-lg cursor-pointer hover:bg-muted focus:bg-muted"
                    >
                      <User className="w-4 h-4 mr-3 text-muted-foreground" />
                      <span>个人中心</span>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem 
                        onClick={() => setLocation("/admin")}
                        className="px-3 py-2 rounded-lg cursor-pointer hover:bg-muted focus:bg-muted"
                      >
                        <LayoutGrid className="w-4 h-4 mr-3 text-muted-foreground" />
                        <span>管理后台</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => setLocation("/favorites")}
                      className="px-3 py-2 rounded-lg cursor-pointer hover:bg-muted focus:bg-muted"
                    >
                      <Heart className="w-4 h-4 mr-3 text-red-500" />
                      <span>我的收藏</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1 bg-border" />
                    <DropdownMenuItem 
                      onClick={() => { signOut(); setLocation("/login"); }}
                      className="px-3 py-2 rounded-lg cursor-pointer hover:bg-muted focus:bg-muted text-red-500"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      <span>退出登录</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button className="h-9 px-4 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-medium shadow-sm shadow-primary/25 hover:shadow-primary/40 transition-all">
                    登录
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-16 left-0 right-0 z-40 lg:hidden transition-all duration-300 ${
          mobileMenuOpen 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="mx-4 mt-2 p-4 bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-lg">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                <span
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

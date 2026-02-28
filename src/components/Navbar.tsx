import { useState } from "react";
import { LayoutGrid, Home, Search, User, LogOut, Settings, Menu, Heart } from "lucide-react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useBookmarks } from "@/contexts/BookmarksContext";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GlobalSearch } from "@/components/GlobalSearch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { data } = useBookmarks();
  const { user, profile, isAdmin, signOut } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/40 dark:border-white/10 bg-white/70 dark:bg-black/50 backdrop-blur-xl transition-all duration-300 shadow-sm shadow-slate-200/20 dark:shadow-none">
        <div className="container h-full mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-12">
            {/* Mobile Menu Trigger */}
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="-ml-2">
                    <Menu className="h-6 w-6 text-slate-700 dark:text-slate-200" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle className="text-left flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 overflow-hidden">
                        {isImageLogo ? (
                          <img src={logoIconStr} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          LucideLogo ? <LucideLogo className="w-5 h-5" /> : (logoIconStr || "N")
                        )}
                      </div>
                      <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                        {data.logoText}
                      </span>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 mt-8">
                    {navLinks.map((link) => (
                      <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                        <span className={`block py-2 text-lg font-medium transition-colors ${
                          (link.href === '/' && location === '/') || (link.href !== '/' && location.startsWith(link.href))
                            ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                            : 'text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
                        }`}>
                          {link.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 overflow-hidden">
                  {isImageLogo ? (
                    <img src={logoIconStr} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    LucideLogo ? <LucideLogo className="w-5 h-5" /> : (logoIconStr || "N")
                  )}
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 hidden sm:inline-block">
                  {data.logoText}
                </span>
              </div>
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8 text-base font-semibold text-slate-700 dark:text-slate-200">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span className={`cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                    (link.href === '/' && location === '/') || (link.href !== '/' && location.startsWith(link.href))
                      ? 'text-blue-600 dark:text-blue-400 ' 
                      : ''
                  }`}>
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="rounded-full w-9 h-9 bg-white/50 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 transition-all text-slate-700 dark:text-slate-200"
              title="全局搜索 (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
            </Button>

            <ThemeToggle />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden ring-2 ring-transparent hover:ring-blue-500/50 transition-all">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.nickname || user.email} />
                      <AvatarFallback className="bg-blue-600 text-white font-bold">
                        {profile?.nickname?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile?.nickname || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>个人中心</span>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => setLocation("/admin")}>
                      <LayoutGrid className="mr-2 h-4 w-4" />
                      <span>管理后台</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setLocation("/favorites")}>
                    <Heart className="mr-2 h-4 w-4 text-red-500" />
                    <span>我的收藏</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { signOut(); setLocation("/login"); }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>退出登录</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button size="sm" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white/90 rounded-full px-6 shadow-lg shadow-slate-900/20 dark:shadow-none">
                   登录
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

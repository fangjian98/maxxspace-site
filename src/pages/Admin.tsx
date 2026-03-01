import { useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useBookmarks } from "@/contexts/BookmarksContext";
import { useAuth } from "@/contexts/AuthContext";
import { SectionManager } from "@/components/admin/SectionManager";
import { SiteSettings } from "@/components/admin/SiteSettings";
import { ManageBlog } from "@/components/admin/ManageBlog";
import { ManageUsers } from "@/components/admin/ManageUsers";
import { ManageMoments } from "@/components/admin/ManageMoments";
import { ManagePages } from "@/components/admin/ManagePages";
import { DatabaseSettings } from "@/components/admin/DatabaseSettings";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RotateCcw, Download, Upload, LayoutGrid, Hammer, PenTool, FileText, FileCode, Settings, Database, Lock, UserCog, MessageSquare, Menu, Sparkles } from "lucide-react";
import bgImageLight from "@/assets/liquid-glass-bg.jpeg";
import bgImageDark from "@/assets/page-bg.jpeg";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

export default function Admin() {
  const { isAdmin, user, loading: authLoading } = useAuth();
  const { theme } = useTheme();

  // 等待认证状态加载完成
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 未登录用户显示访问受限
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="fixed inset-0 z-[-1]">
          <div className={`absolute inset-0 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>
            <img src={bgImageDark} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
          </div>
          <div className={`absolute inset-0 ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`}>
            <img src={bgImageLight} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/80" />
          </div>
        </div>
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-6 w-6" />
              访问受限
            </CardTitle>
            <CardDescription>
              您需要登录后才能访问管理后台
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/#/login">立即登录</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 加载数据（仅在登录后）
  const { data, resetData, adapterType, importData } = useBookmarks();
  const [activeTab, setActiveTab] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "bookmarks.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Import functionality removed per requirements
  const handleImport = () => {};

  // Redirect non-admin users if they somehow reach here
  if (!isAdmin && user) {
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
        
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
            <Lock className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">访问受限</h1>
          <p className="text-muted-foreground">此页面仅限管理员访问。</p>
          <Button onClick={() => window.location.href = '/'} variant="outline" className="rounded-full">
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: "home", label: "网站资源", icon: LayoutGrid },
    { id: "tools", label: "工具管理", icon: PenTool },
    { id: "projects", label: "项目管理", icon: Hammer },
    { id: "blog", label: "博客管理", icon: FileText },
    { id: "moments", label: "动态管理", icon: MessageSquare },
    { id: "pages", label: "页面管理", icon: FileCode, separator: true },
    { id: "settings", label: "全局设置", icon: Settings },
    { id: "users", label: "用户管理", icon: UserCog, adminOnly: true },
    { id: "database", label: "数据库", icon: Database, adminOnly: true },
  ];

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
        <div className="container max-w-7xl mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>管理控制台</span>
            </div>
            <div className="flex items-center justify-center gap-3 mb-3">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                管理后台
              </h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                adapterType === 'supabase' 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
                {adapterType === 'supabase' ? '云端模式' : '本地模式'}
              </span>
            </div>
            <p className="text-muted-foreground text-lg">
              全站内容管理与系统设置中心
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col md:flex-row gap-6 items-start">
            
            {/* Desktop Sidebar Navigation */}
            <aside className="hidden md:block w-64 flex-shrink-0">
              <div className="sticky top-32">
                <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 animate-fade-in">
                  <TabsList className="flex flex-col w-full h-auto bg-transparent p-0 gap-1">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mb-1">内容管理</div>
                    
                    {menuItems.filter(i => !i.separator && !i.adminOnly && !['pages', 'settings'].includes(i.id)).map(item => (
                      <TabsTrigger 
                        key={item.id} 
                        value={item.id} 
                        className="w-full justify-start px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all hover:bg-muted/50"
                      >
                        <item.icon className="w-4 h-4 mr-3" />
                        {item.label}
                      </TabsTrigger>
                    ))}

                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mt-4 mb-1">系统设置</div>

                    {menuItems.filter(i => ['pages', 'settings'].includes(i.id)).map(item => (
                      <TabsTrigger 
                        key={item.id} 
                        value={item.id} 
                        className="w-full justify-start px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all hover:bg-muted/50"
                      >
                        <item.icon className="w-4 h-4 mr-3" />
                        {item.label}
                      </TabsTrigger>
                    ))}
                    
                    {isAdmin && (
                      <>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mt-4 mb-1">管理员</div>
                        {menuItems.filter(i => i.adminOnly).map(item => (
                          <TabsTrigger 
                            key={item.id} 
                            value={item.id} 
                            className="w-full justify-start px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 transition-all hover:bg-muted/50"
                          >
                            <item.icon className="w-4 h-4 mr-3" />
                            {item.label}
                          </TabsTrigger>
                        ))}
                      </>
                    )}
                  </TabsList>
                </div>
              </div>
            </aside>

            {/* Mobile Menu Trigger */}
            <div className="md:hidden w-full mb-4">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2 rounded-xl bg-card/80 backdrop-blur-sm border-border/50">
                    <Menu className="h-5 w-5" />
                    <span>管理菜单</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px]">
                  <SheetHeader>
                    <SheetTitle>管理菜单</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-1 mt-6">
                    {menuItems.map((item) => {
                      if (item.adminOnly && !isAdmin) return null;
                      return (
                        <div key={item.id}>
                          {item.separator && <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2 mt-2 mb-1">系统设置</div>}
                          <Button
                            variant={activeTab === item.id ? "secondary" : "ghost"}
                            className={`w-full justify-start rounded-xl ${activeTab === item.id ? 'bg-primary/10 text-primary' : ''}`}
                            onClick={() => {
                              setActiveTab(item.id);
                              setMobileMenuOpen(false);
                            }}
                          >
                            <item.icon className="w-4 h-4 mr-2" />
                            {item.label}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0 w-full">
              <TabsContent value="home" className="mt-0 animate-fade-in">
                <SectionManager section="home" title="网站" />
              </TabsContent>

              <TabsContent value="tools" className="mt-0 animate-fade-in">
                <SectionManager section="tools" title="工具" />
              </TabsContent>

              <TabsContent value="projects" className="mt-0 animate-fade-in">
                <SectionManager section="projects" title="项目" />
              </TabsContent>

              <TabsContent value="blog" className="mt-0 animate-fade-in">
                <ManageBlog />
              </TabsContent>

              <TabsContent value="moments" className="mt-0 animate-fade-in">
                <ManageMoments />
              </TabsContent>

              <TabsContent value="pages" className="mt-0 animate-fade-in">
                <ManagePages />
              </TabsContent>
              
              <TabsContent value="settings" className="mt-0 animate-fade-in">
                <SiteSettings />
              </TabsContent>

              {/* User Management Section - Only for Admin */}
              {isAdmin ? (
                <TabsContent value="users" className="mt-0 animate-fade-in">
                  <ManageUsers />
                </TabsContent>
              ) : (
                <TabsContent value="users" className="mt-0 animate-fade-in">
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                      <Lock className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">访问受限</h3>
                    <p className="text-muted-foreground">
                      用户管理仅限管理员操作。
                    </p>
                  </div>
                </TabsContent>
              )}

              {/* Database Section - Only for Admin */}
              {isAdmin ? (
                <TabsContent value="database" className="mt-0 animate-fade-in">
                  <DatabaseSettings />
                </TabsContent>
              ) : (
                <TabsContent value="database" className="mt-0 animate-fade-in">
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                      <Lock className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">访问受限</h3>
                    <p className="text-muted-foreground">
                      数据库配置仅限管理员操作。
                    </p>
                  </div>
                </TabsContent>
              )}

              {/* Data Actions Footer */}
              <div className="mt-12 pt-8 border-t border-border/50">
                <h3 className="text-lg font-semibold text-foreground mb-4">数据管理</h3>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    variant="outline" 
                    onClick={handleExport} 
                    className="rounded-xl bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card hover:text-primary"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    导出 JSON 数据
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 hover:bg-red-500/20 hover:text-red-700 dark:hover:text-red-300">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        重置所有数据
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认重置所有数据？</AlertDialogTitle>
                        <AlertDialogDescription>
                          {adapterType === 'supabase' ? (
                            <div className="space-y-2">
                              <p className="text-red-600 font-semibold">⚠️ 您当前处于云端模式 (Supabase)。</p>
                              <p>出于安全考虑，云端模式不支持一键重置操作。如果您想清空数据库，请通过 Supabase 控制台操作。</p>
                              <p>如果您想恢复本地初始状态，请先断开数据库连接。</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p>此操作将把当前浏览器中的所有数据（网站、分类、博客等）恢复为系统默认的初始状态。</p>
                              <p className="text-red-500 font-medium">⚠️ 您的所有本地更改都将丢失且无法找回。</p>
                              <p>建议在重置前先使用"导出 JSON"功能备份数据。</p>
                            </div>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        {adapterType !== 'supabase' && (
                          <AlertDialogAction onClick={resetData} className="bg-red-600 hover:bg-red-700">
                            确认重置 (本地)
                          </AlertDialogAction>
                        )}
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  * 导出功能用于数据备份和迁移。重置功能仅影响当前环境（本地模式）。
                </p>
              </div>
            </div>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}

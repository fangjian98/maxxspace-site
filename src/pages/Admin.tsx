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
import { RotateCcw, Download, Upload, LayoutGrid, Hammer, PenTool, FileText, FileCode, Settings, Database, Lock, UserCog, MessageSquare, Menu } from "lucide-react";
import bgImage from "@/assets/liquid-glass-bg.jpeg";
import { toast } from "sonner";

export default function Admin() {
  const { data, resetData, adapterType, importData } = useBookmarks();
  const { isAdmin, user } = useAuth();
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
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-slate-50 dark:bg-black">
        <Lock className="w-16 h-16 text-slate-300" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">访问受限</h1>
        <p className="text-slate-500">此页面仅限管理员访问。</p>
        <Button onClick={() => window.location.href = '/'} variant="outline">
          返回首页
        </Button>
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
    <div className="min-h-screen relative flex flex-col font-sans text-foreground overflow-x-hidden selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100">
      {/* Background */}
      <div className="fixed inset-0 z-[-1]">
        <img 
          src={bgImage} 
          alt="" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/40 dark:bg-black/80 backdrop-blur-[0px]" /> 
      </div>

      <Navbar />

      <main className="flex-1 container max-w-7xl mx-auto pt-24 md:pt-32 px-4 pb-20">
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">管理后台</h1>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${adapterType === 'supabase' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800'}`}>
                {adapterType === 'supabase' ? '云端模式 (Supabase)' : '本地模式 (LocalStorage)'}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              全站内容管理与系统设置中心。
            </p>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle>管理菜单</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-6">
                  {menuItems.map((item) => {
                    if (item.adminOnly && !isAdmin) return null;
                    return (
                      <div key={item.id}>
                        {item.separator && <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 py-2 mt-2 mb-1">系统设置</div>}
                        <Button
                          variant={activeTab === item.id ? "secondary" : "ghost"}
                          className={`w-full justify-start ${activeTab === item.id ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
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
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Desktop Sidebar Navigation */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-32">
              <TabsList className="flex flex-col w-full h-auto bg-transparent p-0 gap-1">
                <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-4 py-2 mb-1">内容管理</div>
                
                {menuItems.filter(i => !i.separator && !i.adminOnly && !['pages', 'settings'].includes(i.id)).map(item => (
                  <TabsTrigger 
                    key={item.id} 
                    value={item.id} 
                    className="w-full justify-start px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-all border border-transparent hover:bg-white/40 dark:hover:bg-white/5"
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </TabsTrigger>
                ))}

                <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-4 py-2 mt-4 mb-1">系统设置</div>

                {menuItems.filter(i => ['pages', 'settings'].includes(i.id)).map(item => (
                  <TabsTrigger 
                    key={item.id} 
                    value={item.id} 
                    className="w-full justify-start px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-all border border-transparent hover:bg-white/40 dark:hover:bg-white/5"
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </TabsTrigger>
                ))}
                
                {isAdmin && menuItems.filter(i => i.adminOnly).map(item => (
                  <TabsTrigger 
                    key={item.id} 
                    value={item.id} 
                    className="w-full justify-start px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400 data-[state=active]:shadow-sm transition-all border border-transparent hover:bg-white/40 dark:hover:bg-white/5"
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </aside>

          {/* Content Area */}
          <div className="flex-1 min-w-0 w-full mt-0">
            <TabsContent value="home" className="mt-0 animate-in fade-in zoom-in-95 duration-500">
              <SectionManager section="home" title="网站" />
            </TabsContent>

            <TabsContent value="tools" className="mt-0 animate-in fade-in zoom-in-95 duration-500">
              <SectionManager section="tools" title="工具" />
            </TabsContent>

            <TabsContent value="projects" className="mt-0 animate-in fade-in zoom-in-95 duration-500">
              <SectionManager section="projects" title="项目" />
            </TabsContent>

            <TabsContent value="blog" className="mt-0 animate-in fade-in zoom-in-95 duration-500">
              <ManageBlog />
            </TabsContent>

            <TabsContent value="moments" className="mt-0 animate-in fade-in zoom-in-95 duration-500">
              <ManageMoments />
            </TabsContent>

            <TabsContent value="pages" className="mt-0 animate-in fade-in zoom-in-95 duration-500">
              <ManagePages />
            </TabsContent>
            
            <TabsContent value="settings" className="mt-0 animate-in fade-in zoom-in-95 duration-500">
              <SiteSettings />
            </TabsContent>

            {/* User Management Section - Only for Admin */}
            {isAdmin ? (
              <TabsContent value="users" className="mt-0 animate-in fade-in zoom-in-95 duration-500">
                <ManageUsers />
              </TabsContent>
            ) : (
              <TabsContent value="users" className="mt-0 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white/40 dark:bg-black/60 rounded-xl border border-white/60 dark:border-slate-800">
                  <Lock className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">访问受限</h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    用户管理仅限管理员操作。
                  </p>
                </div>
              </TabsContent>
            )}

            {/* Database Section - Only for Admin */}
            {isAdmin ? (
              <TabsContent value="database" className="mt-0 animate-in fade-in zoom-in-95 duration-500">
                <DatabaseSettings />
              </TabsContent>
            ) : (
              <TabsContent value="database" className="mt-0 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white/40 dark:bg-black/60 rounded-xl border border-white/60 dark:border-slate-800">
                  <Lock className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">访问受限</h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    数据库配置仅限管理员操作。
                  </p>
                </div>
              </TabsContent>
            )}

            {/* Data Actions Footer */}
            <div className="mt-12 pt-8 border-t border-slate-200/60 dark:border-slate-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">数据管理</h3>
              <div className="flex flex-wrap gap-4">
                {/* Import button removed */}
                
                <Button variant="outline" onClick={handleExport} className="bg-white/50 dark:bg-black/60 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-blue-400">
                  <Download className="w-4 h-4 mr-2" />
                  导出 JSON 数据
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/30 shadow-none">
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
                            <p>建议在重置前先使用“导出 JSON”功能备份数据。</p>
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
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                * 导入/导出功能用于数据备份和迁移。重置功能仅影响当前环境（本地模式）。
              </p>
            </div>
          </div>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useBookmarks } from "@/contexts/BookmarksContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Save, Download, Key, User, Shield, Camera } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import bgImageLight from "@/assets/liquid-glass-bg.jpeg";
import bgImageDark from "@/assets/page-bg.jpeg";
import { toast } from "sonner";

export default function Profile() {
  const { user, profile, signOut, updateProfile, updatePassword } = useAuth();
  const { data } = useBookmarks();
  const { theme } = useTheme();
  const [, setLocation] = useLocation();
  const [nickname, setNickname] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      setLocation("/login");
      return;
    }
    
    if (profile && !hasLoadedRef.current) {
      setNickname(profile.nickname || "");
      setAvatarUrl(profile.avatar_url || "");
      hasLoadedRef.current = true;
    }
  }, [user, profile, setLocation]);

  const handleSignOut = async () => {
    await signOut();
    setLocation("/");
  };

  const handleUpdateProfile = async () => {
    const { error } = await updateProfile({ nickname, avatar_url: avatarUrl });
    if (error) {
      toast.error("更新失败: " + error.message);
    } else {
      toast.success("更新成功");
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("密码长度至少为 6 位");
      return;
    }
    const { error } = await updatePassword(newPassword);
    if (!error) {
      setNewPassword("");
      toast.success("密码更新成功");
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        toast.warning("图片较大，建议压缩后上传");
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "bookmarks.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (!user) return null;

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
        <div className="container max-w-4xl mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
              个人中心
            </h1>
            <p className="text-muted-foreground text-lg">
              管理您的账户信息和设置
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* User Info Card */}
            <Card className="w-full md:w-72 flex-shrink-0 bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {nickname?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleAvatarUpload}
                  />
                </div>
                <CardTitle className="text-lg">{nickname || "用户"}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <Button variant="outline" className="w-full justify-start gap-2" onClick={handleExport}>
                  <Download className="w-4 h-4" />
                  导出所有数据
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 text-destructive hover:text-destructive" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                  退出登录
                </Button>
              </CardContent>
            </Card>

            {/* Settings Tabs */}
            <div className="flex-1 min-w-0">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="inline-flex h-10 items-center gap-1 rounded-full bg-muted/50 p-1 mb-6">
                  <TabsTrigger
                    value="profile"
                    className="rounded-full px-4 text-sm font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
                  >
                    <User className="w-4 h-4 mr-2" />
                    个人资料
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="rounded-full px-4 text-sm font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    安全设置
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="mt-0">
                  <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        基本信息
                      </CardTitle>
                      <CardDescription>管理您的公开信息</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="nickname">昵称</Label>
                        <Input 
                          id="nickname" 
                          value={nickname} 
                          onChange={(e) => setNickname(e.target.value)} 
                          placeholder="输入您的昵称"
                        />
                      </div>
                      <Button onClick={handleUpdateProfile} className="gap-2">
                        <Save className="w-4 h-4" />
                        保存更改
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="security" className="mt-0">
                  <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Key className="w-5 h-5 text-primary" />
                        密码安全
                      </CardTitle>
                      <CardDescription>更新您的账户密码</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">新密码</Label>
                        <Input 
                          id="new-password" 
                          type="password" 
                          value={newPassword} 
                          onChange={(e) => setNewPassword(e.target.value)} 
                          placeholder="至少 6 位字符"
                        />
                      </div>
                      <Button onClick={handleUpdatePassword} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                        <Key className="w-4 h-4" />
                        更新密码
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

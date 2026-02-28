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
import { LogOut, Save, Upload, Download, Key } from "lucide-react";
import bgImage from "@/assets/liquid-glass-bg.jpeg";
import { toast } from "sonner";

export default function Profile() {
  const { user, profile, signOut, updateProfile, updatePassword } = useAuth();
  const { data } = useBookmarks();
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
    
    // Only load profile data once to prevent overwriting local state during edits
    // or if the profile loads with a delay
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

      <main className="flex-1 container max-w-4xl mx-auto pt-32 px-4 pb-20">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* User Info Card */}
          <Card className="w-full md:w-1/3 bg-white/60 dark:bg-slate-900/80 backdrop-blur-xl border-white/60 dark:border-white/10 h-fit">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-2xl">{nickname?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleAvatarUpload}
                />
              </div>
              <CardTitle>{nickname || "用户"}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                导出所有数据
              </Button>
              <Button variant="destructive" className="w-full" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                退出登录
              </Button>
            </CardContent>
          </Card>

          {/* Settings Tabs */}
          <div className="flex-1">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/60 dark:bg-black/80 backdrop-blur-xl border border-white/40 dark:border-white/10">
                <TabsTrigger value="profile">个人资料</TabsTrigger>
                <TabsTrigger value="security">安全设置</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="mt-6">
                <Card className="bg-white/60 dark:bg-slate-900/80 backdrop-blur-xl border-white/60 dark:border-white/10">
                  <CardHeader>
                    <CardTitle>基本信息</CardTitle>
                    <CardDescription>管理您的公开信息</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nickname">昵称</Label>
                      <Input 
                        id="nickname" 
                        value={nickname} 
                        onChange={(e) => setNickname(e.target.value)} 
                        className="bg-white/50 dark:bg-slate-950/40"
                      />
                    </div>
                    <Button onClick={handleUpdateProfile} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Save className="w-4 h-4 mr-2" />
                      保存更改
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security" className="mt-6">
                <Card className="bg-white/60 dark:bg-slate-900/80 backdrop-blur-xl border-white/60 dark:border-white/10">
                  <CardHeader>
                    <CardTitle>密码安全</CardTitle>
                    <CardDescription>更新您的账户密码</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">新密码</Label>
                      <Input 
                        id="new-password" 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        className="bg-white/50 dark:bg-slate-950/40"
                        placeholder="至少 6 位字符"
                      />
                    </div>
                    <Button onClick={handleUpdatePassword} className="bg-green-600 hover:bg-green-700 text-white">
                      <Key className="w-4 h-4 mr-2" />
                      更新密码
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

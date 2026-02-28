import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useBookmarks } from "@/contexts/BookmarksContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DatabaseSettings } from "@/components/admin/DatabaseSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn, UserPlus, Sparkles } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import bgImageLight from "@/assets/liquid-glass-bg.jpeg";
import bgImageDark from "@/assets/page-bg.jpeg";

export default function Login() {
  const { configSource, signIn, signUp, user } = useAuth();
  const { data } = useBookmarks();
  const { theme } = useTheme();
  const hasConfig = !!configSource;
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      setLocation("/profile");
    }
  }, [user, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error, data } = await signIn(email, password);
      if (error) {
        setIsLoading(false);
        return;
      }
      // 登录成功，session 已获取，直接跳转
      if (data?.session || data?.user) {
        setLocation("/");
      }
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signUp(email, password);
    setIsLoading(false);
  };

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

      <main className="flex-1 w-full pt-28 md:pt-32 pb-24 flex items-center justify-center">
        <div className="container max-w-md mx-auto px-4">
          {!hasConfig ? (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">连接数据库</h1>
                <p className="text-muted-foreground">
                  在使用登录功能前，请先配置 Supabase 数据库连接。
                </p>
              </div>
              <DatabaseSettings />
            </div>
          ) : (
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg animate-fade-in">
              <CardHeader className="text-center pb-2">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <LogIn className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">欢迎回来</CardTitle>
                <CardDescription className="text-muted-foreground">登录您的账户以访问更多功能</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="inline-flex h-10 w-full items-center gap-1 rounded-lg bg-muted/50 p-1 mb-6">
                    <TabsTrigger 
                      value="login"
                      className="flex-1 rounded-md text-sm font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
                    >
                      登录
                    </TabsTrigger>
                    <TabsTrigger 
                      value="register"
                      className="flex-1 rounded-md text-sm font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
                    >
                      注册
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="mt-0">
                    <form onSubmit={handleLogin} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="email">邮箱地址</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="name@example.com" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">密码</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                        登录
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="register" className="mt-0">
                    <form onSubmit={handleRegister} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="reg-email">邮箱地址</Label>
                        <Input 
                          id="reg-email" 
                          type="email" 
                          placeholder="name@example.com" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-password">密码</Label>
                        <Input 
                          id="reg-password" 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                          placeholder="至少 6 位字符"
                        />
                      </div>
                      <Button type="submit" className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                        注册账户
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-center text-xs text-muted-foreground pt-2">
                {data.copyright || `TechNav Hub © ${new Date().getFullYear()}`}
              </CardFooter>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

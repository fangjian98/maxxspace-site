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
import { Loader2, LogIn, UserPlus } from "lucide-react";
import bgImage from "@/assets/liquid-glass-bg.jpeg";

export default function Login() {
  const { configSource, signIn, signUp, user } = useAuth();
  const { data } = useBookmarks();
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
    const { error } = await signIn(email, password);
    setIsLoading(false);
    if (!error) {
      setLocation("/");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signUp(email, password);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen relative flex flex-col font-sans text-foreground overflow-x-hidden selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100">
      {/* Background */}
      <div className="fixed inset-0 z-[-1]">
        <img 
          src={bgImage} 
          alt="" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[0px]" /> 
      </div>

      <Navbar />

      <main className="flex-1 container max-w-md mx-auto pt-32 px-4 pb-20 flex flex-col justify-center min-h-[calc(100vh-160px)]">
        {!hasConfig ? (
          <div className="animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">连接数据库</h1>
              <p className="text-slate-500 dark:text-slate-400">
                在使用登录功能前，请先配置 Supabase 数据库连接。
              </p>
            </div>
            <DatabaseSettings />
          </div>
        ) : (
          <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border-white/60 dark:border-white/10 shadow-xl animate-in fade-in zoom-in duration-500">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">欢迎回来</CardTitle>
              <CardDescription>登录您的账户以访问更多功能</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">登录</TabsTrigger>
                  <TabsTrigger value="register">注册</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">邮箱地址</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="name@example.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-white/50 dark:bg-black/20"
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
                        className="bg-white/50 dark:bg-black/20"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                      登录
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">邮箱地址</Label>
                      <Input 
                        id="reg-email" 
                        type="email" 
                        placeholder="name@example.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-white/50 dark:bg-black/20"
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
                        className="bg-white/50 dark:bg-black/20"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                      注册账户
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center text-xs text-slate-400">
              {data.copyright || `TechNav Hub © ${new Date().getFullYear()}`}
            </CardFooter>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}

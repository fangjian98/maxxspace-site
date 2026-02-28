import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useBookmarks } from "@/contexts/BookmarksContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Link, UploadCloud, Unplug, CheckCircle, AlertCircle, Lock, Eye, EyeOff, Copy } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PROJECT_CONFIG } from "@/lib/supabaseConfig";
import { toast } from "sonner";

const configSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  key: z.string().min(10, "API Key is required"),
});

export function DatabaseSettings() {
  const { isConnected, connectSupabase, disconnectSupabase, syncLocalToRemote } = useBookmarks();
  const { configSource } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [currentConfig, setCurrentConfig] = useState({ url: "", key: "" });

  useEffect(() => {
    if (configSource === 'env') {
      setCurrentConfig(PROJECT_CONFIG);
    } else if (configSource === 'local') {
      const stored = localStorage.getItem("supabase-config");
      if (stored) {
        try {
          setCurrentConfig(JSON.parse(stored));
        } catch {}
      }
    }
  }, [configSource]);

  const form = useForm<z.infer<typeof configSchema>>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      url: "",
      key: "",
    },
  });

  async function onSubmit(values: z.infer<typeof configSchema>) {
    await connectSupabase(values);
  }

  async function handleSync() {
    setIsSyncing(true);
    await syncLocalToRemote();
    setIsSyncing(false);
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("已复制到剪贴板");
  };

  return (
    <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/60 dark:border-white/10 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-500" />
          数据库连接
        </CardTitle>
        <CardDescription>
          连接到 Supabase 云数据库以实现数据持久化与跨设备同步。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {isConnected ? (
          <div className="space-y-4">
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/50">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-800 dark:text-green-300">已连接</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-400/80">
                {configSource === 'env' 
                  ? "已通过环境配置自动连接到云端数据库。" 
                  : "当前正在使用云端数据库。您的更改将实时保存。"}
              </AlertDescription>
            </Alert>

            {/* Display Connection Details */}
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-white/10">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Project URL</Label>
                <div className="flex gap-2">
                  <Input readOnly value={currentConfig.url} className="bg-white dark:bg-slate-950/60 font-mono text-xs h-8" />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(currentConfig.url)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">API Key (Anon)</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input 
                      readOnly 
                      type={showKey ? "text" : "password"} 
                      value={currentConfig.key} 
                      className="bg-white dark:bg-slate-950/60 font-mono text-xs h-8 pr-8" 
                    />
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowKey(!showKey)}>
                    {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(currentConfig.key)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {configSource === 'env' && (
              <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50">
                <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-800 dark:text-blue-300">环境配置锁定</AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-400/80">
                  数据库连接信息由环境变量或配置文件管理，无法在此界面直接修改。
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button onClick={handleSync} disabled={isSyncing} className="bg-blue-600 hover:bg-blue-700 text-white">
                <UploadCloud className="w-4 h-4 mr-2" />
                {isSyncing ? "同步中..." : "同步本地数据到云端"}
              </Button>
              
              {configSource !== 'env' && (
                <Button variant="outline" onClick={disconnectSupabase} className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20">
                  <Unplug className="w-4 h-4 mr-2" />
                  断开连接
                </Button>
              )}
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400">
              注意：同步操作会用当前浏览器中的本地数据覆盖云端数据库中的数据。
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert variant="default" className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10">
              <AlertCircle className="h-4 w-4 text-slate-500" />
              <AlertTitle>本地模式</AlertTitle>
              <AlertDescription className="text-slate-500">
                当前数据仅存储在浏览器本地。清除缓存可能会导致数据丢失。
              </AlertDescription>
            </Alert>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://your-project.supabase.co" {...field} className="bg-white/50 dark:bg-slate-950/40" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key (anon/public)</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." {...field} className="bg-white/50 dark:bg-slate-950/40" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <Link className="w-4 h-4 mr-2" />
                  连接数据库
                </Button>
              </form>
            </Form>
            
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-4">
              <p>如何获取连接信息？</p>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>访问 <a href="https://database.new" target="_blank" className="text-blue-500 hover:underline">Supabase</a> 创建新项目</li>
                <li>在 Project Settings -&gt; API 中找到 URL 和 Key</li>
                <li>参考项目根目录下的 <code>SUPABASE_SETUP.md</code> 初始化数据库表结构</li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>{children}</label>;
}

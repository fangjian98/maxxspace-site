import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { UserProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Trash2, Shield, ShieldOff, UserX } from "lucide-react";
import { toast } from "sonner";

export function ManageUsers() {
  const { supabase, user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setUsers(data as UserProfile[]);
    } catch (e: any) {
      console.error("Error fetching users:", e);
      toast.error("获取用户列表失败: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [supabase]);

  const handleToggleAdmin = async (targetUser: UserProfile) => {
    if (!supabase) return;
    
    // Prevent self-demotion if you are the only admin? 
    // For simplicity, just warn. 
    if (targetUser.id === currentUser?.id) {
      toast.error("不能更改自己的管理权限");
      return;
    }

    try {
      const newStatus = !targetUser.is_admin;
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: newStatus })
        .eq('id', targetUser.id);

      if (error) throw error;

      setUsers(users.map(u => u.id === targetUser.id ? { ...u, is_admin: newStatus } : u));
      toast.success(`已${newStatus ? "授予" : "移除"} ${targetUser.nickname || targetUser.email} 的管理员权限`);
    } catch (e: any) {
      toast.error("操作失败: " + e.message);
    }
  };

  const handleDeleteUser = async (targetUserId: string) => {
    if (!supabase) return;
    
    if (targetUserId === currentUser?.id) {
      toast.error("不能删除自己");
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', targetUserId);

      if (error) throw error;

      setUsers(users.filter(u => u.id !== targetUserId));
      toast.success("用户资料已删除");
    } catch (e: any) {
      toast.error("删除失败: " + e.message);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/60 dark:border-slate-800 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>用户管理</CardTitle>
            <CardDescription>查看和管理注册用户权限。</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "刷新列表"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索用户昵称或邮箱..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white/50 dark:bg-black/20"
          />
        </div>

        <div className="rounded-md border border-slate-200 dark:border-white/10 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900/40">
              <TableRow>
                <TableHead className="w-[80px]">头像</TableHead>
                <TableHead>用户</TableHead>
                <TableHead>角色</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>{user.nickname?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.nickname || "无昵称"}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.is_admin ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100">管理员</Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-500">普通用户</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          title={user.is_admin ? "降级为普通用户" : "提升为管理员"}
                          onClick={() => handleToggleAdmin(user)}
                          disabled={user.id === currentUser?.id}
                        >
                          {user.is_admin ? (
                            <ShieldOff className="h-4 w-4 text-orange-500" />
                          ) : (
                            <Shield className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="删除用户"
                              disabled={user.id === currentUser?.id}
                            >
                              <UserX className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认删除用户?</AlertDialogTitle>
                              <AlertDialogDescription>
                                此操作将删除用户 <b>{user.nickname || user.email}</b> 的个人资料。
                                <br />
                                注意：这不会从 Supabase Auth 中物理删除账号，但会移除其在应用内的所有关联数据。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-red-600 hover:bg-red-700">
                                确认删除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    {loading ? "加载中..." : "未找到用户"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

import React, { createContext, useContext, useEffect, useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import type { Session, User } from "@supabase/supabase-js";
import { createSupabaseClient, defaultClient } from "@/lib/db/supabase";
import type { SupabaseConfig } from "@/lib/db/supabase";
import { hasValidConfig } from "@/lib/supabaseConfig";
import type { UserProfile } from "@/types";
import { toast } from "sonner";

interface AuthContextType {
  supabase: SupabaseClient | null;
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  
  // Actions
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
  updateEmail: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  
  // Config check
  configSource: 'env' | 'local' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [configSource, setConfigSource] = useState<'env' | 'local' | null>(null);

  // Initialize Supabase
  useEffect(() => {
    const initAuth = async () => {
      let client: SupabaseClient | null = null;
      let source: 'env' | 'local' | null = null;

      // Priority 1: Project Config (Env/Hardcoded)
      if (hasValidConfig()) {
        client = defaultClient;
        source = 'env';
      } 
      
      // Priority 2: LocalStorage (Fallback or Override)
      // Check if user manually connected via Admin panel
      if (!client) {
        const storedConfig = localStorage.getItem("supabase-config");
        if (storedConfig) {
          try {
            const config: SupabaseConfig = JSON.parse(storedConfig);
            client = createSupabaseClient(config);
            source = 'local';
          } catch (e) {
            console.error("Failed to init Supabase from LocalStorage", e);
          }
        }
      }

      if (client && source) {
        setSupabase(client);
        setConfigSource(source);

        try {
          // Get initial session
          const { data: { session } } = await client.auth.getSession();
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            await fetchProfile(client, session.user.id);
          }

          // Listen for auth changes
          const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
              await fetchProfile(client, session.user.id);
            } else {
              setProfile(null);
            }
            setLoading(false);
          });

          setLoading(false);
          return () => subscription.unsubscribe();
        } catch (e) {
           console.error("Error during auth session check", e);
           setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initAuth();
    
    // Listen for storage events (Reload logic removed to prevent infinite loops)
    // Users can manually refresh if they update configuration in another tab.
    return () => {};
  }, []);

  const fetchProfile = async (client: SupabaseClient, userId: string) => {
    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
      } else {
        setProfile(data as UserProfile);
      }
    } catch (e) {
      console.error("Fetch profile exception:", e);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: { message: "Database not connected" } };
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (!result.error) {
      toast.success("登录成功");
    }
    return result;
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) return { error: { message: "Database not connected" } };
    const result = await supabase.auth.signUp({ email, password });
    if (!result.error) {
      toast.success("注册成功！请检查邮箱验证（如果开启了验证）或直接登录");
    }
    return result;
  };

  const signOut = async () => {
    // Optimistic sign out: Clear local state immediately
    setSession(null);
    setUser(null);
    setProfile(null);
    toast.info("已退出登录");
    
    if (supabase) {
      // Execute remote signout without blocking UI
      supabase.auth.signOut().catch(console.error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!supabase || !user) return { error: { message: "Not logged in" } };
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
      
    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast.success("个人资料已更新");
    }
    return { error };
  };

  const updateEmail = async (email: string) => {
    if (!supabase) return { error: { message: "Not connected" } };
    const result = await supabase.auth.updateUser({ email });
    if (!result.error) toast.success("邮箱更新链接已发送");
    return result;
  };

  const updatePassword = async (password: string) => {
    if (!supabase) return { error: { message: "Not connected" } };
    const result = await supabase.auth.updateUser({ password });
    if (!result.error) toast.success("密码已更新");
    return result;
  };

  return (
    <AuthContext.Provider
      value={{
        supabase,
        session,
        user,
        profile,
        isAdmin: !!profile?.is_admin,
        loading,
        configSource,
        signIn,
        signUp,
        signOut,
        updateProfile,
        updateEmail,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Supabase Configuration
// IMPORTANT: Replace these placeholders with your actual Supabase Project URL and Anon Key
// You can find these in your Supabase Dashboard -> Project Settings -> API

export const PROJECT_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || "https://fkltstszoojdpuqymqkv.supabase.co",
  key: import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_LO2zQUK6q2G7eWJ4-CR-MA_ajPy2UVE"
};

export const hasValidConfig = () => {
  return PROJECT_CONFIG.url !== "https://your-project.supabase.co" && 
         PROJECT_CONFIG.key !== "your-anon-key-here";
};

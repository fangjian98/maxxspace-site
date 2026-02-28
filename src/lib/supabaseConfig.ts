// Supabase Configuration
// IMPORTANT: 配置必须通过环境变量设置，请创建 .env 文件
// You can find these in your Supabase Dashboard -> Project Settings -> API

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const PROJECT_CONFIG = {
  url: SUPABASE_URL || "",
  key: SUPABASE_ANON_KEY || ""
};

export const hasValidConfig = () => {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
};

export const isConfigured = hasValidConfig();

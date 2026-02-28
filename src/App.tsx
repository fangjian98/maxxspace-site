import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Router, Route, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { BookmarksProvider } from "@/contexts/BookmarksContext";
import { GlobalSearch } from "@/components/GlobalSearch";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import Home from "@/pages/Home";
import Websites from "@/pages/Websites";
import Admin from "@/pages/Admin";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import Favorites from "@/pages/Favorites";
import Tags from "@/pages/Tags";
import BlogList from "@/pages/BlogList";
import BlogPost from "@/pages/BlogPost";
import Moments from "@/pages/Moments";
import Projects from "@/pages/Projects";
import Tools from "@/pages/Tools";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";

// Use hash-based routing (/#/) to support opening index.html directly via file:// protocol
function AppRouter() {
  return (
    <Router hook={useHashLocation}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/websites" component={Websites} />
        <Route path="/tags" component={Tags} />
        <Route path="/tools" component={Tools} />
        <Route path="/blog" component={BlogList} />
        <Route path="/blog/:id" component={BlogPost} />
        <Route path="/moments" component={Moments} />
        <Route path="/projects" component={Projects} />
        <Route path="/about" component={About} />
        <Route path="/login" component={Login} />
        <Route path="/profile" component={Profile} />
        <Route path="/favorites" component={Favorites} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
      <MobileBottomNav />
    </Router>
  );
}

function App() {
  const [searchOpen, setSearchOpen] = useState(false);

  // 全局快捷键 Cmd/Ctrl + K 打开搜索
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      // Escape 关闭搜索
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };

    // 监听 Navbar 触发的搜索事件
    const handleOpenSearch = () => setSearchOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-global-search", handleOpenSearch);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-global-search", handleOpenSearch);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <AuthProvider>
          <BookmarksProvider>
            <TooltipProvider>
              <Toaster />
              <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
              <AppRouter />
            </TooltipProvider>
          </BookmarksProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

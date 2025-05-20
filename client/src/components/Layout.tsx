import React, { useState, ReactNode } from "react";
import { useLocation, Link } from "wouter";
import { NavIcons } from "./SubjectIcons";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import AdminLogin from "./AdminLogin";
import Footer from "./Footer";
import { Button } from "@/components/ui/button";
import { Sun, Moon, LogOut, User } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { isAdmin, logout } = useAuth();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  
  const getCurrentSection = (): string => {
    if (location === "/" || location.startsWith("/files")) return "files";
    if (location.startsWith("/exams")) return "exams";
    if (location.startsWith("/quizzes") || location.startsWith("/quiz")) return "quizzes";
    return "files";
  };

  const currentSection = getCurrentSection();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center">
          <div className="flex items-center space-x-4 space-x-reverse">
            <h1 className="text-2xl font-bold text-primary dark:text-primary-foreground">دفعة 2026</h1>
          </div>
          
          <div className="flex items-center mt-3 sm:mt-0 space-x-4 space-x-reverse">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="تبديل الوضع الليلي"
              className="rounded-full"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Admin Button */}
            {!isAdmin ? (
              <Button onClick={() => setShowAdminLogin(true)} className="flex items-center space-x-1 space-x-reverse">
                <User className="h-4 w-4 ml-2" />
                <span>تسجيل دخول المشرف</span>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg">
                  <User className="h-4 w-4 ml-2" />
                  <span>مشرف</span>
                </div>
                
                <Button 
                  variant="destructive" 
                  onClick={logout} 
                  className="flex items-center space-x-1 space-x-reverse"
                >
                  <LogOut className="h-4 w-4 ml-2" />
                  <span>تسجيل خروج</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Navigation */}
      <div className="bg-white dark:bg-gray-800 shadow-sm mb-6">
        <div className="container mx-auto">
          <nav className="flex overflow-x-auto">
            <Link href="/files" className={`px-4 py-4 font-medium text-sm sm:text-base whitespace-nowrap transition-colors duration-200 focus:outline-none ${
                currentSection === "files" 
                  ? "border-b-2 border-primary text-primary dark:text-primary" 
                  : "text-gray-500 dark:text-gray-400"
              }`}>
                <span className="flex items-center space-x-1 space-x-reverse">
                  <NavIcons.files className="text-base sm:text-xl" />
                  <span className="mr-1">الملفات</span>
                </span>
            </Link>
            
            <Link href="/exams" className={`px-4 py-4 font-medium text-sm sm:text-base whitespace-nowrap transition-colors duration-200 focus:outline-none ${
                currentSection === "exams" 
                  ? "border-b-2 border-primary text-primary dark:text-primary" 
                  : "text-gray-500 dark:text-gray-400"
              }`}>
                <span className="flex items-center space-x-1 space-x-reverse">
                  <NavIcons.exams className="text-base sm:text-xl" />
                  <span className="mr-1">جدول الاختبارات</span>
                </span>
            </Link>
            
            <Link href="/quizzes" className={`px-4 py-4 font-medium text-sm sm:text-base whitespace-nowrap transition-colors duration-200 focus:outline-none ${
                currentSection === "quizzes" 
                  ? "border-b-2 border-primary text-primary dark:text-primary" 
                  : "text-gray-500 dark:text-gray-400"
              }`}>
                <span className="flex items-center space-x-1 space-x-reverse">
                  <NavIcons.quizzes className="text-base sm:text-xl" />
                  <span className="mr-1">الاختبارات التفاعلية</span>
                </span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 pb-12">
        {children}
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Admin Login Modal */}
      <AdminLogin 
        isOpen={showAdminLogin} 
        onClose={() => setShowAdminLogin(false)} 
      />
    </div>
  );
};

export default Layout;


import React from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type ThemeType = "light" | "dark" | "system";

const AppHeader = () => {
  const { toast } = useToast();
  const [theme, setTheme] = React.useState<ThemeType>("light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
    
    toast({
      title: `${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode activated`,
      duration: 2000,
    });
  };

  return (
    <header className="bg-white dark:bg-swift-dark-800 border-b border-border p-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-swift-blue-600 dark:text-swift-blue-400">Swift</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleTheme}
          className="rounded-full"
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-swift-blue-500 flex items-center justify-center text-white">
            U
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;

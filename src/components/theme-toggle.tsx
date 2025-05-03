
import { Moon, Sun, Monitor, Palette, ColorPicker, CloudSun, CloudMoon, SunDim, Contrast } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Force theme update when component mounts
  useEffect(() => {
    if (mounted && theme) {
      // Remove all theme classes first
      document.documentElement.classList.remove(
        'light', 'dark', 'dark-green', 'high-contrast', 
        'sepia', 'corporate', 'monochrome', 'winter', 'spring'
      )
      
      // Handle system preference for default themes
      if (theme === 'system') {
        document.documentElement.classList.add(
          window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        )
      } else {
        // Add the selected theme class
        document.documentElement.classList.add(theme)
      }
    }
  }, [mounted, theme])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="opacity-0">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    )
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    // Force theme change by directly manipulating the class
    document.documentElement.classList.remove(
      'light', 'dark', 'dark-green', 'high-contrast', 
      'sepia', 'corporate', 'monochrome', 'winter', 'spring'
    )
    
    if (newTheme === 'system') {
      document.documentElement.classList.add(
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      )
    } else {
      document.documentElement.classList.add(newTheme)
    }
  }

  // Define a function to get the appropriate icon based on the current theme
  const getThemeIcon = () => {
    switch(theme) {
      case "light":
        return <Sun className="h-5 w-5 text-swift-blue-600" />;
      case "dark":
        return <Moon className="h-5 w-5 text-swift-blue-600" />;
      case "dark-green":
        return <SunDim className="h-5 w-5 text-swift-blue-600" />;
      case "high-contrast":
        return <Contrast className="h-5 w-5 text-swift-blue-600" />;
      case "sepia":
        return <ColorPicker className="h-5 w-5 text-swift-blue-600" />;
      case "corporate":
        return <Palette className="h-5 w-5 text-swift-blue-600" />;
      case "monochrome":
        return <Contrast className="h-5 w-5 text-swift-blue-600" />;
      case "winter":
        return <CloudMoon className="h-5 w-5 text-swift-blue-600" />;
      case "spring":
        return <CloudSun className="h-5 w-5 text-swift-blue-600" />;
      default: // system
        return <Monitor className="h-5 w-5 text-swift-blue-600" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="border border-primary/20 bg-background shadow-sm rounded-full hover:bg-swift-blue-50"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {getThemeIcon()}
          </motion.div>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="animate-in fade-in-80 border border-primary/10 shadow-lg w-56">
        <DropdownMenuLabel>Theme Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">System</DropdownMenuLabel>
        <DropdownMenuItem 
          onClick={() => handleThemeChange("system")}
          className={`${theme === "system" ? "bg-swift-blue-50 text-swift-blue-600" : ""} hover:bg-swift-blue-50 hover:text-swift-blue-600 transition-colors`}
        >
          <Monitor className="h-4 w-4 mr-2" />
          System
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Base</DropdownMenuLabel>
        
        <DropdownMenuItem 
          onClick={() => handleThemeChange("light")}
          className={`${theme === "light" ? "bg-swift-blue-50 text-swift-blue-600" : ""} hover:bg-swift-blue-50 hover:text-swift-blue-600 transition-colors`}
        >
          <Sun className="h-4 w-4 mr-2" />
          Light
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleThemeChange("dark")}
          className={`${theme === "dark" ? "bg-swift-blue-50 text-swift-blue-600" : ""} hover:bg-swift-blue-50 hover:text-swift-blue-600 transition-colors`}
        >
          <Moon className="h-4 w-4 mr-2" />
          Dark
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Special</DropdownMenuLabel>
        
        <DropdownMenuItem 
          onClick={() => handleThemeChange("dark-green")}
          className={`${theme === "dark-green" ? "bg-swift-blue-50 text-swift-blue-600" : ""} hover:bg-swift-blue-50 hover:text-swift-blue-600 transition-colors`}
        >
          <SunDim className="h-4 w-4 mr-2" />
          Dark Green
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleThemeChange("high-contrast")}
          className={`${theme === "high-contrast" ? "bg-swift-blue-50 text-swift-blue-600" : ""} hover:bg-swift-blue-50 hover:text-swift-blue-600 transition-colors`}
        >
          <Contrast className="h-4 w-4 mr-2" />
          High Contrast
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleThemeChange("sepia")}
          className={`${theme === "sepia" ? "bg-swift-blue-50 text-swift-blue-600" : ""} hover:bg-swift-blue-50 hover:text-swift-blue-600 transition-colors`}
        >
          <ColorPicker className="h-4 w-4 mr-2" />
          Sepia
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleThemeChange("corporate")}
          className={`${theme === "corporate" ? "bg-swift-blue-50 text-swift-blue-600" : ""} hover:bg-swift-blue-50 hover:text-swift-blue-600 transition-colors`}
        >
          <Palette className="h-4 w-4 mr-2" />
          Corporate
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleThemeChange("monochrome")}
          className={`${theme === "monochrome" ? "bg-swift-blue-50 text-swift-blue-600" : ""} hover:bg-swift-blue-50 hover:text-swift-blue-600 transition-colors`}
        >
          <Contrast className="h-4 w-4 mr-2" />
          Monochrome
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Seasonal</DropdownMenuLabel>
        
        <DropdownMenuItem 
          onClick={() => handleThemeChange("winter")}
          className={`${theme === "winter" ? "bg-swift-blue-50 text-swift-blue-600" : ""} hover:bg-swift-blue-50 hover:text-swift-blue-600 transition-colors`}
        >
          <CloudMoon className="h-4 w-4 mr-2" />
          Winter
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleThemeChange("spring")}
          className={`${theme === "spring" ? "bg-swift-blue-50 text-swift-blue-600" : ""} hover:bg-swift-blue-50 hover:text-swift-blue-600 transition-colors`}
        >
          <CloudSun className="h-4 w-4 mr-2" />
          Spring
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

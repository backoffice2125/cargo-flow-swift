
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Initialize theme based on system preferences if not set in storage
  React.useEffect(() => {
    const storedTheme = localStorage.getItem('swift-ui-theme')
    if (!storedTheme) {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.add(isDark ? 'dark' : 'light')
    } else {
      // Remove all theme classes first
      document.documentElement.classList.remove(
        'light', 'dark', 'dark-green', 'high-contrast', 
        'sepia', 'corporate', 'monochrome', 'winter', 'spring'
      )
      
      // Handle system preference for default themes
      if (storedTheme === 'system') {
        document.documentElement.classList.add(
          window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        )
      } else {
        // Add the stored theme class
        document.documentElement.classList.add(storedTheme)
      }
    }
  }, [])
  
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

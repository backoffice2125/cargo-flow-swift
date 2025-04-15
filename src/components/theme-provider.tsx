
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
      document.documentElement.classList.add(
        storedTheme === 'system' 
          ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
          : storedTheme
      )
    }
  }, [])
  
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

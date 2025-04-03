
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// Create MobileNavContext to manage mobile navigation state
interface MobileNavContextType {
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
}

const MobileNavContext = React.createContext<MobileNavContextType | undefined>(undefined)

// Provider component
export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  
  return (
    <MobileNavContext.Provider value={{ mobileOpen, setMobileOpen }}>
      {children}
    </MobileNavContext.Provider>
  )
}

// Hook to use the mobile navigation context
export function useMobileNav() {
  const context = React.useContext(MobileNavContext)
  
  if (context === undefined) {
    throw new Error("useMobileNav must be used within a MobileNavProvider")
  }
  
  return context
}

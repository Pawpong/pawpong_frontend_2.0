'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface NavigationGuardContextType {
  guardNavigation?: (href: string) => void
  setGuardNavigation?: (fn: ((href: string) => void) | undefined) => void
}

const NavigationGuardContext = createContext<NavigationGuardContextType | null>(null)

const NavigationGuardProvider = ({ children }: { children: ReactNode }) => {
  const [guardNavigation, setGuardNavigation] = useState<
    ((href: string) => void) | undefined
  >(undefined)

  const updateGuardNavigation = useCallback(
    (fn: ((href: string) => void) | undefined) => {
      setGuardNavigation(() => fn)
    },
    [],
  )

  return (
    <NavigationGuardContext.Provider
      value={{ guardNavigation, setGuardNavigation: updateGuardNavigation }}
    >
      {children}
    </NavigationGuardContext.Provider>
  )
}

const useNavigationGuardContext = () => useContext(NavigationGuardContext)

export { NavigationGuardProvider, useNavigationGuardContext }

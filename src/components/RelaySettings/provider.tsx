import { createContext, useContext, useState } from 'react'

type TRelaySettingsComponentContext = {
  renamingGroup: string | null
  setRenamingGroup: React.Dispatch<React.SetStateAction<string | null>>
  expandedRelayGroup: string | null
  setExpandedRelayGroup: React.Dispatch<React.SetStateAction<string | null>>
}

export const RelaySettingsComponentContext = createContext<
  TRelaySettingsComponentContext | undefined
>(undefined)

export const useRelaySettingsComponent = () => {
  const context = useContext(RelaySettingsComponentContext)
  if (!context) {
    throw new Error(
      'useRelaySettingsComponent must be used within a RelaySettingsComponentProvider'
    )
  }
  return context
}

export function RelaySettingsComponentProvider({ children }: { children: React.ReactNode }) {
  const [renamingGroup, setRenamingGroup] = useState<string | null>(null)
  const [expandedRelayGroup, setExpandedRelayGroup] = useState<string | null>(null)

  return (
    <RelaySettingsComponentContext.Provider
      value={{
        renamingGroup,
        setRenamingGroup,
        expandedRelayGroup,
        setExpandedRelayGroup
      }}
    >
      {children}
    </RelaySettingsComponentContext.Provider>
  )
}

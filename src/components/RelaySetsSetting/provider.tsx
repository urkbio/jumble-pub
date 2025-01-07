import { createContext, useContext, useState } from 'react'

type TRelaySetsSettingComponentContext = {
  renamingRelaySetId: string | null
  setRenamingRelaySetId: React.Dispatch<React.SetStateAction<string | null>>
  expandedRelaySetId: string | null
  setExpandedRelaySetId: React.Dispatch<React.SetStateAction<string | null>>
  selectedRelaySetIds: string[]
  toggleSelectedRelaySetId: (relaySetId: string) => void
}

export const RelaySetsSettingComponentContext = createContext<
  TRelaySetsSettingComponentContext | undefined
>(undefined)

export const useRelaySetsSettingComponent = () => {
  const context = useContext(RelaySetsSettingComponentContext)
  if (!context) {
    throw new Error(
      'useRelaySetsSettingComponent must be used within a RelaySetsSettingComponentProvider'
    )
  }
  return context
}

export function RelaySetsSettingComponentProvider({ children }: { children: React.ReactNode }) {
  const [renamingRelaySetId, setRenamingRelaySetId] = useState<string | null>(null)
  const [expandedRelaySetId, setExpandedRelaySetId] = useState<string | null>(null)
  const [selectedRelaySetIds, setSelectedRelaySetIds] = useState<string[]>([])

  return (
    <RelaySetsSettingComponentContext.Provider
      value={{
        renamingRelaySetId,
        setRenamingRelaySetId,
        expandedRelaySetId,
        setExpandedRelaySetId,
        selectedRelaySetIds,
        toggleSelectedRelaySetId: (relaySetId) => {
          setSelectedRelaySetIds((pre) => {
            if (pre.includes(relaySetId)) {
              return pre.filter((id) => id !== relaySetId)
            }
            return [...pre, relaySetId]
          })
        }
      }}
    >
      {children}
    </RelaySetsSettingComponentContext.Provider>
  )
}

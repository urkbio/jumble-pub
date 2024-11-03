import { TRelayGroup } from '@common/types'
import storage from '@renderer/services/storage.service'
import { createContext, useContext, useEffect, useState } from 'react'

type TRelaySettingsContext = {
  relayGroups: TRelayGroup[]
  relayUrls: string[]
  switchRelayGroup: (groupName: string) => void
  renameRelayGroup: (oldGroupName: string, newGroupName: string) => string | null
  deleteRelayGroup: (groupName: string) => void
  addRelayGroup: (groupName: string) => string | null
  updateRelayGroupRelayUrls: (groupName: string, relayUrls: string[]) => void
}

const RelaySettingsContext = createContext<TRelaySettingsContext | undefined>(undefined)

export const useRelaySettings = () => {
  const context = useContext(RelaySettingsContext)
  if (!context) {
    throw new Error('useRelaySettings must be used within a RelaySettingsProvider')
  }
  return context
}

export function RelaySettingsProvider({ children }: { children: React.ReactNode }) {
  const [relayGroups, setRelayGroups] = useState<TRelayGroup[]>([])
  const [relayUrls, setRelayUrls] = useState<string[]>(
    relayGroups.find((group) => group.isActive)?.relayUrls ?? []
  )

  useEffect(() => {
    const init = async () => {
      const storedGroups = await storage.getRelayGroups()
      setRelayGroups(storedGroups)
    }

    init()
  }, [])

  useEffect(() => {
    setRelayUrls(relayGroups.find((group) => group.isActive)?.relayUrls ?? [])
  }, [relayGroups])

  const updateGroups = async (newGroups: TRelayGroup[]) => {
    setRelayGroups(newGroups)
    await storage.setRelayGroups(newGroups)
  }

  const switchRelayGroup = (groupName: string) => {
    updateGroups(
      relayGroups.map((group) => ({
        ...group,
        isActive: group.groupName === groupName
      }))
    )
  }

  const deleteRelayGroup = (groupName: string) => {
    updateGroups(relayGroups.filter((group) => group.groupName !== groupName || group.isActive))
  }

  const updateRelayGroupRelayUrls = (groupName: string, relayUrls: string[]) => {
    updateGroups(
      relayGroups.map((group) => ({
        ...group,
        relayUrls: group.groupName === groupName ? relayUrls : group.relayUrls
      }))
    )
  }

  const renameRelayGroup = (oldGroupName: string, newGroupName: string) => {
    if (newGroupName === '') {
      return null
    }
    if (oldGroupName === newGroupName) {
      return null
    }
    if (relayGroups.some((group) => group.groupName === newGroupName)) {
      return 'already exists'
    }
    updateGroups(
      relayGroups.map((group) => ({
        ...group,
        groupName: group.groupName === oldGroupName ? newGroupName : group.groupName
      }))
    )
    return null
  }

  const addRelayGroup = (groupName: string) => {
    if (groupName === '') {
      return null
    }
    if (relayGroups.some((group) => group.groupName === groupName)) {
      return 'already exists'
    }
    updateGroups([
      ...relayGroups,
      {
        groupName,
        relayUrls: [],
        isActive: false
      }
    ])
    return null
  }

  return (
    <RelaySettingsContext.Provider
      value={{
        relayGroups,
        relayUrls,
        switchRelayGroup,
        renameRelayGroup,
        deleteRelayGroup,
        addRelayGroup,
        updateRelayGroupRelayUrls
      }}
    >
      {children}
    </RelaySettingsContext.Provider>
  )
}

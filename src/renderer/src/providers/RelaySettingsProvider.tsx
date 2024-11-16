import { TRelayGroup } from '@common/types'
import { isWebsocketUrl, normalizeUrl } from '@renderer/lib/url'
import storage from '@renderer/services/storage.service'
import { createContext, useContext, useEffect, useState } from 'react'

type TRelaySettingsContext = {
  relayGroups: TRelayGroup[]
  temporaryRelayUrls: string[]
  relayUrls: string[]
  switchRelayGroup: (groupName: string) => void
  renameRelayGroup: (oldGroupName: string, newGroupName: string) => string | null
  deleteRelayGroup: (groupName: string) => void
  addRelayGroup: (groupName: string, relayUrls?: string[]) => string | null
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
  const [temporaryRelayUrls, setTemporaryRelayUrls] = useState<string[]>([])
  const [relayUrls, setRelayUrls] = useState<string[]>(
    temporaryRelayUrls.length
      ? temporaryRelayUrls
      : (relayGroups.find((group) => group.isActive)?.relayUrls ?? [])
  )

  useEffect(() => {
    const init = async () => {
      const searchParams = new URLSearchParams(window.location.search)
      const tempRelays = searchParams
        .getAll('r')
        .filter((url) => isWebsocketUrl(url))
        .map((url) => normalizeUrl(url))
      if (tempRelays.length) {
        setTemporaryRelayUrls(tempRelays)
        // remove relay urls from query string
        searchParams.delete('r')
        const newSearch = searchParams.toString()
        window.history.replaceState(
          {},
          '',
          `${window.location.pathname}${newSearch.length ? `?${newSearch}` : ''}`
        )
      }
      const storedGroups = await storage.getRelayGroups()
      setRelayGroups(storedGroups)
    }

    init()
  }, [])

  useEffect(() => {
    setRelayUrls(
      temporaryRelayUrls.length
        ? temporaryRelayUrls
        : (relayGroups.find((group) => group.isActive)?.relayUrls ?? [])
    )
  }, [relayGroups, temporaryRelayUrls])

  const updateGroups = async (fn: (pre: TRelayGroup[]) => TRelayGroup[]) => {
    let newGroups = relayGroups
    setRelayGroups((pre) => {
      newGroups = fn(pre)
      return newGroups
    })
    await storage.setRelayGroups(newGroups)
  }

  const switchRelayGroup = (groupName: string) => {
    updateGroups((pre) =>
      pre.map((group) => ({
        ...group,
        isActive: group.groupName === groupName
      }))
    )
    setTemporaryRelayUrls([])
  }

  const deleteRelayGroup = (groupName: string) => {
    updateGroups((pre) => pre.filter((group) => group.groupName !== groupName))
  }

  const updateRelayGroupRelayUrls = (groupName: string, relayUrls: string[]) => {
    updateGroups((pre) =>
      pre.map((group) => ({
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
    updateGroups((pre) => {
      if (pre.some((group) => group.groupName === newGroupName)) {
        return pre
      }
      return pre.map((group) => ({
        ...group,
        groupName: group.groupName === oldGroupName ? newGroupName : group.groupName
      }))
    })
    return null
  }

  const addRelayGroup = (groupName: string, relayUrls: string[] = []) => {
    if (groupName === '') {
      return null
    }
    const normalizedUrls = relayUrls
      .filter((url) => isWebsocketUrl(url))
      .map((url) => normalizeUrl(url))
    updateGroups((pre) => {
      if (pre.some((group) => group.groupName === groupName)) {
        return pre
      }
      return [
        ...pre,
        {
          groupName,
          relayUrls: normalizedUrls,
          isActive: false
        }
      ]
    })
    return null
  }

  return (
    <RelaySettingsContext.Provider
      value={{
        relayGroups,
        temporaryRelayUrls,
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

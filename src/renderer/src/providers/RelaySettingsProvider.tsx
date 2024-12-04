import { TRelayGroup } from '@common/types'
import { isWebsocketUrl, normalizeUrl } from '@renderer/lib/url'
import client from '@renderer/services/client.service'
import storage from '@renderer/services/storage.service'
import { createContext, Dispatch, useContext, useEffect, useState } from 'react'

type TRelaySettingsContext = {
  relayGroups: TRelayGroup[]
  temporaryRelayUrls: string[]
  relayUrls: string[]
  searchableRelayUrls: string[]
  switchRelayGroup: (groupName: string) => void
  renameRelayGroup: (oldGroupName: string, newGroupName: string) => string | null
  deleteRelayGroup: (groupName: string) => void
  addRelayGroup: (groupName: string, relayUrls?: string[]) => string | null
  updateRelayGroupRelayUrls: (groupName: string, relayUrls: string[]) => void
  setTemporaryRelayUrls: Dispatch<string[]>
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
  const [searchableRelayUrls, setSearchableRelayUrls] = useState<string[]>([])

  useEffect(() => {
    const init = async () => {
      const searchParams = new URLSearchParams(window.location.search)
      const tempRelays = searchParams
        .getAll('r')
        .filter((url) => isWebsocketUrl(url))
        .map((url) => normalizeUrl(url))
      if (tempRelays.length) {
        setTemporaryRelayUrls(tempRelays)
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

  useEffect(() => {
    const handler = async () => {
      setSearchableRelayUrls([])
      const relayInfos = await client.fetchRelayInfos(relayUrls)
      setSearchableRelayUrls(
        relayUrls.filter((_, index) => relayInfos[index]?.supported_nips?.includes(50))
      )
    }
    handler()
  }, [relayUrls])

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
        searchableRelayUrls,
        switchRelayGroup,
        renameRelayGroup,
        deleteRelayGroup,
        addRelayGroup,
        updateRelayGroupRelayUrls,
        setTemporaryRelayUrls
      }}
    >
      {children}
    </RelaySettingsContext.Provider>
  )
}

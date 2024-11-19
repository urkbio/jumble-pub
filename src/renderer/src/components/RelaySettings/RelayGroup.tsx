import { Button } from '@renderer/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import { Input } from '@renderer/components/ui/input'
import { useRelaySettings } from '@renderer/providers/RelaySettingsProvider'
import { Check, ChevronDown, Circle, CircleCheck, EllipsisVertical } from 'lucide-react'
import { useState } from 'react'
import RelayUrls from './RelayUrl'
import { useRelaySettingsComponent } from './provider'
import { TRelayGroup } from './types'
import { useTranslation } from 'react-i18next'

export default function RelayGroup({ group }: { group: TRelayGroup }) {
  const { t } = useTranslation()
  const { expandedRelayGroup } = useRelaySettingsComponent()
  const { temporaryRelayUrls } = useRelaySettings()
  const { groupName, relayUrls } = group
  const isActive = temporaryRelayUrls.length === 0 && group.isActive

  return (
    <div
      className={`w-full border rounded-lg p-4 ${isActive ? 'border-highlight bg-highlight/5' : ''}`}
    >
      <div className="flex justify-between items-center">
        <div className="flex space-x-2 items-center">
          <RelayGroupActiveToggle
            groupName={groupName}
            isActive={isActive}
            canActive={relayUrls.length > 0}
          />
          <RelayGroupName groupName={groupName} />
        </div>
        <div className="flex gap-1">
          <RelayUrlsExpandToggle groupName={groupName}>
            {t('n relays', { n: relayUrls.length })}
          </RelayUrlsExpandToggle>
          <RelayGroupOptions group={group} />
        </div>
      </div>
      {expandedRelayGroup === groupName && <RelayUrls groupName={groupName} />}
    </div>
  )
}

function RelayGroupActiveToggle({
  groupName,
  isActive,
  canActive
}: {
  groupName: string
  isActive: boolean
  canActive: boolean
}) {
  const { switchRelayGroup } = useRelaySettings()

  return isActive ? (
    <CircleCheck size={18} className="text-highlight shrink-0" />
  ) : (
    <Circle
      size={18}
      className={`text-muted-foreground shrink-0 ${canActive ? 'cursor-pointer hover:text-foreground ' : ''}`}
      onClick={() => {
        if (canActive) {
          switchRelayGroup(groupName)
        }
      }}
    />
  )
}

function RelayGroupName({ groupName }: { groupName: string }) {
  const { t } = useTranslation()
  const [newGroupName, setNewGroupName] = useState(groupName)
  const [newNameError, setNewNameError] = useState<string | null>(null)
  const { relayGroups, switchRelayGroup, renameRelayGroup } = useRelaySettings()
  const { renamingGroup, setRenamingGroup } = useRelaySettingsComponent()

  const hasRelayUrls = relayGroups.find((group) => group.groupName === groupName)?.relayUrls.length

  const saveNewGroupName = () => {
    if (relayGroups.find((group) => group.groupName === newGroupName)) {
      return setNewNameError(t('relay collection name already exists'))
    }
    const errMsg = renameRelayGroup(groupName, newGroupName)
    if (errMsg) {
      setNewNameError(errMsg)
      return
    }
    setRenamingGroup(null)
  }

  const handleRenameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewGroupName(e.target.value)
    setNewNameError(null)
  }

  const handleRenameInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      saveNewGroupName()
    }
  }

  return renamingGroup === groupName ? (
    <div className="flex gap-1 items-center">
      <Input
        value={newGroupName}
        onChange={handleRenameInputChange}
        onBlur={saveNewGroupName}
        onKeyDown={handleRenameInputKeyDown}
        className={`font-semibold w-28 ${newNameError ? 'border-destructive' : ''}`}
      />
      <Button variant="ghost" size="icon" onClick={saveNewGroupName}>
        <Check size={18} className="text-green-500" />
      </Button>
      {newNameError && <div className="text-xs text-destructive">{newNameError}</div>}
    </div>
  ) : (
    <div
      className={`h-8 font-semibold flex items-center ${hasRelayUrls ? 'cursor-pointer' : 'text-muted-foreground'}`}
      onClick={() => {
        if (hasRelayUrls) {
          switchRelayGroup(groupName)
        }
      }}
    >
      {groupName}
    </div>
  )
}

function RelayUrlsExpandToggle({
  groupName,
  children
}: {
  groupName: string
  children: React.ReactNode
}) {
  const { expandedRelayGroup, setExpandedRelayGroup } = useRelaySettingsComponent()
  return (
    <div
      className="text-sm text-muted-foreground flex items-center gap-1 cursor-pointer hover:text-foreground"
      onClick={() => setExpandedRelayGroup((pre) => (pre === groupName ? null : groupName))}
    >
      <div className="select-none">{children}</div>
      <ChevronDown
        size={16}
        className={`transition-transform duration-200 ${expandedRelayGroup === groupName ? 'rotate-180' : ''}`}
      />
    </div>
  )
}

function RelayGroupOptions({ group }: { group: TRelayGroup }) {
  const { t } = useTranslation()
  const { deleteRelayGroup } = useRelaySettings()
  const { setRenamingGroup } = useRelaySettingsComponent()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => setRenamingGroup(group.groupName)}>
          {t('Rename')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            navigator.clipboard.writeText(
              `https://jumble.social/?${group.relayUrls.map((url) => 'r=' + url).join('&')}`
            )
          }}
        >
          {t('Copy share link')}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => deleteRelayGroup(group.groupName)}
        >
          {t('Delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

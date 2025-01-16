import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { normalizeUrl } from '@/lib/url'
import { useRelaySets } from '@/providers/RelaySetsProvider'
import { TRelaySet } from '@/types'
import { Check, FolderPlus, Plus } from 'lucide-react'
import { ReactNode, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export default function SaveRelayDropdownMenu({
  children,
  urls,
  asChild = false
}: {
  children: ReactNode
  urls: string[]
  asChild?: boolean
}) {
  const { t } = useTranslation()
  const { relaySets } = useRelaySets()
  const normalizedUrls = useMemo(() => urls.map((url) => normalizeUrl(url)), [urls])
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={asChild}>{children}</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{t('Save to')} ...</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {relaySets.map((set) => (
          <RelaySetItem key={set.id} set={set} urls={normalizedUrls} />
        ))}
        <DropdownMenuSeparator />
        <SaveToNewSet urls={normalizedUrls} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function RelaySetItem({ set, urls }: { set: TRelaySet; urls: string[] }) {
  const { updateRelaySet } = useRelaySets()
  const saved = urls.every((url) => set.relayUrls.includes(url))

  const handleClick = () => {
    if (saved) {
      updateRelaySet({
        ...set,
        relayUrls: set.relayUrls.filter((u) => !urls.includes(u))
      })
    } else {
      updateRelaySet({
        ...set,
        relayUrls: Array.from(new Set([...set.relayUrls, ...urls]))
      })
    }
  }

  return (
    <DropdownMenuItem key={set.id} className="flex gap-2" onClick={handleClick}>
      {saved ? <Check /> : <Plus />}
      {set.name}
    </DropdownMenuItem>
  )
}

function SaveToNewSet({ urls }: { urls: string[] }) {
  const { t } = useTranslation()
  const { addRelaySet } = useRelaySets()

  const handleSave = () => {
    const newSetName = prompt(t('Enter a name for the new relay set'))
    if (newSetName) {
      addRelaySet(newSetName, urls)
    }
  }

  return (
    <DropdownMenuItem onClick={handleSave}>
      <FolderPlus />
      {t('Save to a new relay set')}
    </DropdownMenuItem>
  )
}

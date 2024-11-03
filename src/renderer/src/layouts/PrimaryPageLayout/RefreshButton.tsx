import { TitlebarButton } from '@renderer/components/Titlebar'
import { usePrimaryPage } from '@renderer/PageManager'
import { RefreshCcw } from 'lucide-react'

export default function RefreshButton() {
  const { refresh } = usePrimaryPage()
  return (
    <TitlebarButton onClick={refresh} title="reload">
      <RefreshCcw />
    </TitlebarButton>
  )
}

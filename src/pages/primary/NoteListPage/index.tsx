import NoteList from '@/components/NoteList'
import PostEditor from '@/components/PostEditor'
import { Button } from '@/components/ui/button'
import PrimaryPageLayout from '@/layouts/PrimaryPageLayout'
import { useNostr } from '@/providers/NostrProvider'
import { useScreenSize } from '@/providers/ScreenSizeProvider'
import { TPageRef } from '@/types'
import { PencilLine, Server } from 'lucide-react'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import SearchButton from './SearchButton'

const NoteListPage = forwardRef((_, ref) => {
  const layoutRef = useRef<TPageRef>(null)
  useImperativeHandle(ref, () => layoutRef.current)

  return (
    <PrimaryPageLayout
      pageName="home"
      ref={layoutRef}
      titlebar={<NoteListPageTitlebar />}
      displayScrollToTopButton
    >
      <NoteList relayUrls={['wss://relay.nostr.moe/', 'wss://relay.cxplay.org/']} />
    </PrimaryPageLayout>
  )
})
NoteListPage.displayName = 'NoteListPage'
export default NoteListPage

function NoteListPageTitlebar() {
  const { isSmallScreen } = useScreenSize()

  return (
    <div className="flex gap-1 items-center h-full justify-between">
      <div className="flex gap-2 items-center h-full pl-3">
        <Server />
        <div className="text-lg font-semibold">Nostr.moe</div>
      </div>
      <div className="shrink-0 flex gap-1 items-center">
        <SearchButton />
        {isSmallScreen && <PostButton />}
      </div>
    </div>
  )
}

function PostButton() {
  const { checkLogin } = useNostr()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="titlebar-icon"
        onClick={(e) => {
          e.stopPropagation()
          checkLogin(() => {
            setOpen(true)
          })
        }}
      >
        <PencilLine />
      </Button>
      <PostEditor open={open} setOpen={setOpen} />
    </>
  )
}

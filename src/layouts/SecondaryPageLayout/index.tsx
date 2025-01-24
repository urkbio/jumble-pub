import BackButton from '@/components/BackButton'
import BottomNavigationBar from '@/components/BottomNavigationBar'
import ScrollToTopButton from '@/components/ScrollToTopButton'
import { Titlebar } from '@/components/Titlebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSecondaryPage } from '@/PageManager'
import { DeepBrowsingProvider } from '@/providers/DeepBrowsingProvider'
import { useScreenSize } from '@/providers/ScreenSizeProvider'
import { useEffect, useRef } from 'react'

export default function SecondaryPageLayout({
  children,
  index,
  title,
  controls,
  hideBackButton = false,
  displayScrollToTopButton = false
}: {
  children?: React.ReactNode
  index?: number
  title?: React.ReactNode
  controls?: React.ReactNode
  hideBackButton?: boolean
  displayScrollToTopButton?: boolean
}): JSX.Element {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { isSmallScreen } = useScreenSize()
  const { currentIndex } = useSecondaryPage()

  useEffect(() => {
    if (isSmallScreen) {
      window.scrollTo({ top: 0 })
      return
    }
  }, [])

  if (isSmallScreen) {
    return (
      <DeepBrowsingProvider active={currentIndex === index}>
        <div
          style={{
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 3rem)'
          }}
        >
          <SecondaryPageTitlebar
            title={title}
            controls={controls}
            hideBackButton={hideBackButton}
          />
          <div className="pb-4 mt-2">{children}</div>
          {displayScrollToTopButton && <ScrollToTopButton />}
          <BottomNavigationBar />
        </div>
      </DeepBrowsingProvider>
    )
  }

  return (
    <DeepBrowsingProvider active={currentIndex === index} scrollAreaRef={scrollAreaRef}>
      <ScrollArea
        className="h-screen overflow-auto"
        scrollBarClassName="sm:z-50"
        ref={scrollAreaRef}
      >
        <SecondaryPageTitlebar title={title} controls={controls} hideBackButton={hideBackButton} />
        <div className="pb-4 mt-2">{children}</div>
      </ScrollArea>
      {displayScrollToTopButton && <ScrollToTopButton scrollAreaRef={scrollAreaRef} />}
    </DeepBrowsingProvider>
  )
}

export function SecondaryPageTitlebar({
  title,
  controls,
  hideBackButton = false
}: {
  title?: React.ReactNode
  controls?: React.ReactNode
  hideBackButton?: boolean
}): JSX.Element {
  return (
    <Titlebar className="h-12 flex gap-1 p-1 items-center justify-between font-semibold">
      <BackButton hide={hideBackButton}>{title}</BackButton>
      <div className="flex-shrink-0">{controls}</div>
    </Titlebar>
  )
}

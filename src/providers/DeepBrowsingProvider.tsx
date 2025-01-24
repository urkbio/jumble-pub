import { createContext, useContext, useEffect, useState } from 'react'

type TDeepBrowsingContext = {
  deepBrowsing: boolean
  lastScrollTop: number
}

const DeepBrowsingContext = createContext<TDeepBrowsingContext | undefined>(undefined)

export const useDeepBrowsing = () => {
  const context = useContext(DeepBrowsingContext)
  if (!context) {
    throw new Error('useDeepBrowsing must be used within a DeepBrowsingProvider')
  }
  return context
}

export function DeepBrowsingProvider({
  children,
  active,
  scrollAreaRef
}: {
  children: React.ReactNode
  active: boolean
  scrollAreaRef?: React.RefObject<HTMLDivElement>
}) {
  const [deepBrowsing, setDeepBrowsing] = useState(false)
  const [lastScrollTop, setLastScrollTop] = useState(0)

  useEffect(() => {
    if (!active) return

    const handleScroll = () => {
      const atBottom = !scrollAreaRef
        ? window.innerHeight + window.scrollY >= document.body.offsetHeight - 20
        : scrollAreaRef.current
          ? scrollAreaRef.current?.clientHeight + scrollAreaRef.current?.scrollTop >=
            scrollAreaRef.current?.scrollHeight - 20
          : false
      if (atBottom) {
        setDeepBrowsing(false)
        return
      }

      const scrollTop = (!scrollAreaRef ? window.scrollY : scrollAreaRef.current?.scrollTop) || 0
      const diff = scrollTop - lastScrollTop
      if (scrollTop <= 800) {
        setDeepBrowsing(false)
        setLastScrollTop(scrollTop)
        return
      }

      if (diff > 20) {
        setDeepBrowsing(true)
        setLastScrollTop(scrollTop)
      } else if (diff < -20) {
        setDeepBrowsing(false)
        setLastScrollTop(scrollTop)
      }
    }

    if (!scrollAreaRef) {
      window.addEventListener('scroll', handleScroll)
      return () => {
        window.removeEventListener('scroll', handleScroll)
      }
    }

    scrollAreaRef.current?.addEventListener('scroll', handleScroll)
    return () => {
      scrollAreaRef.current?.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollTop, active])

  return (
    <DeepBrowsingContext.Provider value={{ deepBrowsing, lastScrollTop }}>
      {children}
    </DeepBrowsingContext.Provider>
  )
}

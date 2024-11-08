import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@renderer/components/ui/resizable'
import { cloneElement, createContext, isValidElement, useContext, useState } from 'react'
import BlankPage from './pages/secondary/BlankPage'
import { cn } from '@renderer/lib/utils'

type TRoute = {
  pageName: string
  element: React.ReactNode
}

type TPushParams = {
  pageName: string
  props: any
}

type TPrimaryPageContext = {
  refresh: () => void
}

type TSecondaryPageContext = {
  push: (params: TPushParams) => void
  pop: () => void
}

type TStackItem = {
  index: number
  pageName: string
  props: any
  component: React.ReactNode
}

const PrimaryPageContext = createContext<TPrimaryPageContext | undefined>(undefined)

const SecondaryPageContext = createContext<TSecondaryPageContext | undefined>(undefined)

export function usePrimaryPage() {
  const context = useContext(PrimaryPageContext)
  if (!context) {
    throw new Error('usePrimaryPage must be used within a PrimaryPageContext.Provider')
  }
  return context
}

export function useSecondaryPage() {
  const context = useContext(SecondaryPageContext)
  if (!context) {
    throw new Error('usePrimaryPage must be used within a SecondaryPageContext.Provider')
  }
  return context
}

export function PageManager({
  routes,
  children,
  maxStackSize = 5
}: {
  routes: TRoute[]
  children: React.ReactNode
  maxStackSize?: number
}) {
  const [primaryPageKey, setPrimaryPageKey] = useState<number>(0)
  const [secondaryStack, setSecondaryStack] = useState<TStackItem[]>([])

  const routeMap = routes.reduce((acc, route) => {
    acc[route.pageName] = route.element
    return acc
  }, {}) as Record<string, React.ReactNode>

  const isCurrentPage = (stack: TStackItem[], { pageName, props }: TPushParams) => {
    const currentPage = stack[stack.length - 1]
    if (!currentPage) return false

    return (
      currentPage.pageName === pageName &&
      JSON.stringify(currentPage.props) === JSON.stringify(props) // TODO: deep compare
    )
  }

  const refreshPrimary = () => setPrimaryPageKey((prevKey) => prevKey + 1)

  const pushSecondary = ({ pageName, props }: TPushParams) => {
    if (isCurrentPage(secondaryStack, { pageName, props })) return

    const element = routeMap[pageName]
    if (!element) return
    if (!isValidElement(element)) return

    setSecondaryStack((prevStack) => {
      const currentStack = prevStack[prevStack.length - 1]
      const index = currentStack ? currentStack.index + 1 : 0
      const component = cloneElement(element, props)
      const newStack = [...prevStack, { index, pageName, props, component }]
      if (newStack.length > maxStackSize) newStack.shift()
      return newStack
    })
  }

  const popSecondary = () => setSecondaryStack((prevStack) => prevStack.slice(0, -1))

  return (
    <PrimaryPageContext.Provider value={{ refresh: refreshPrimary }}>
      <SecondaryPageContext.Provider value={{ push: pushSecondary, pop: popSecondary }}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={60} minSize={30}>
            <div key={primaryPageKey} className="h-full">
              {children}
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={40} minSize={30} className="relative">
            {secondaryStack.length ? (
              secondaryStack.map((item, index) => (
                <div
                  key={item.index}
                  className="absolute top-0 left-0 w-full h-full bg-background"
                  style={{ zIndex: index }}
                >
                  {item.component}
                </div>
              ))
            ) : (
              <BlankPage />
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </SecondaryPageContext.Provider>
    </PrimaryPageContext.Provider>
  )
}

export function SecondaryPageLink({
  to,
  children,
  className,
  onClick
}: {
  to: TPushParams
  children: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent) => void
}) {
  const { push } = useSecondaryPage()

  return (
    <span
      className={cn('cursor-pointer', className)}
      onClick={(e) => {
        onClick && onClick(e)
        push(to)
      }}
    >
      {children}
    </span>
  )
}

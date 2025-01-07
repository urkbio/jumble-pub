import { cn } from '@/lib/utils'
import { useMemo, ReactNode } from 'react'

export default function SimpleMasonryGrid({
  items,
  columnCount,
  className
}: {
  items: ReactNode[]
  columnCount: 2 | 3
  className?: string
}) {
  const columns = useMemo(() => {
    const newColumns: ReactNode[][] = Array.from({ length: columnCount }, () => [])
    items.forEach((item, i) => {
      newColumns[i % columnCount].push(item)
    })
    return newColumns
  }, [items])

  return (
    <div
      className={cn(
        'grid',
        columnCount === 2 ? 'grid-cols-2 gap-2' : 'grid-cols-3 gap-4',
        className
      )}
    >
      {columns.map((column, i) => (
        <div key={i} className={columnCount === 2 ? 'space-y-2' : 'space-y-4'}>
          {column}
        </div>
      ))}
    </div>
  )
}

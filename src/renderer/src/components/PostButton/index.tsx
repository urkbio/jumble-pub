import PostDialog from '@renderer/components/PostDialog'
import { Button } from '@renderer/components/ui/button'
import { PencilLine } from 'lucide-react'
import { useState } from 'react'

export default function PostButton({ variant = 'titlebar' }: { variant?: 'titlebar' | 'sidebar' }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant={variant}
        size={variant}
        title="new post"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
      >
        <PencilLine />
        {variant === 'sidebar' && <div>Post</div>}
      </Button>
      <PostDialog open={open} setOpen={setOpen} />
    </>
  )
}

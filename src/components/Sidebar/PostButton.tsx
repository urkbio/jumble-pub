import PostEditor from '@/components/PostEditor'
import { PencilLine } from 'lucide-react'
import { useState } from 'react'
import SidebarItem from './SidebarItem'

export default function PostButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <SidebarItem
        title="New post"
        description="Post"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
        variant="default"
        className="bg-primary"
      >
        <PencilLine strokeWidth={3} />
      </SidebarItem>
      <PostEditor open={open} setOpen={setOpen} />
    </>
  )
}

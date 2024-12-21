import PostDialog from '@/components/PostDialog'
import { Button } from '@/components/ui/button'
import { PencilLine } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function PostButton({
  variant = 'titlebar'
}: {
  variant?: 'titlebar' | 'sidebar' | 'small-screen-titlebar'
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant={variant}
        size={variant}
        title={t('New post')}
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
      >
        <PencilLine />
        {variant === 'sidebar' && <div>{t('Post')}</div>}
      </Button>
      <PostDialog open={open} setOpen={setOpen} />
    </>
  )
}

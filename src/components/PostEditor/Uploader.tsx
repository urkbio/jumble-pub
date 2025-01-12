import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { useNostr } from '@/providers/NostrProvider'
import { ImageUp, Loader, LoaderCircle, Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import { z } from 'zod'

export default function Uploader({
  onUploadSuccess,
  variant = 'button'
}: {
  onUploadSuccess: ({ url, tags }: { url: string; tags: string[][] }) => void
  variant?: 'button' | 'big'
}) {
  const [uploading, setUploading] = useState(false)
  const { signHttpAuth } = useNostr()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploading(true)
      const url = 'https://nostr.build/api/v2/nip96/upload'
      const auth = await signHttpAuth(url, 'POST')
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: auth
        }
      })

      if (!response.ok) {
        throw new Error(response.status.toString())
      }

      const data = await response.json()
      const tags = z.array(z.array(z.string())).parse(data.nip94_event?.tags ?? [])
      const imageUrl = tags.find(([tagName]) => tagName === 'url')?.[1]
      if (imageUrl) {
        onUploadSuccess({ url: imageUrl, tags })
      } else {
        throw new Error('No image url found')
      }
    } catch (error) {
      console.error('Error uploading file', error)
      toast({
        variant: 'destructive',
        title: 'Failed to upload file',
        description: (error as Error).message
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } finally {
      setUploading(false)
    }
  }

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '' // clear the value so that the same file can be uploaded again
      fileInputRef.current.click()
    }
  }

  if (variant === 'button') {
    return (
      <>
        <Button variant="secondary" onClick={handleUploadClick} disabled={uploading}>
          {uploading ? <LoaderCircle className="animate-spin" /> : <ImageUp />}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept="image/*,video/*,audio/*"
        />
      </>
    )
  }

  return (
    <>
      <div
        className={cn(
          'flex flex-col gap-2 items-center justify-center aspect-square w-full rounded-lg border border-dashed',
          uploading ? 'cursor-not-allowed text-muted-foreground' : 'clickable'
        )}
        onClick={handleUploadClick}
      >
        {uploading ? <Loader size={36} className="animate-spin" /> : <Plus size={36} />}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept="image/*"
      />
    </>
  )
}

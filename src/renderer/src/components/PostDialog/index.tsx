import { Button } from '@renderer/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { Textarea } from '@renderer/components/ui/textarea'
import { useToast } from '@renderer/hooks/use-toast'
import { createShortTextNoteDraftEvent } from '@renderer/lib/draft-event'
import { useNostr } from '@renderer/providers/NostrProvider'
import client from '@renderer/services/client.service'
import { LoaderCircle } from 'lucide-react'
import { Event } from 'nostr-tools'
import { Dispatch, useState } from 'react'
import UserAvatar from '../UserAvatar'
import Mentions from './Metions'
import Preview from './Preview'
import Uploader from './Uploader'
import { useTranslation } from 'react-i18next'

export default function PostDialog({
  defaultContent = '',
  parentEvent,
  open,
  setOpen
}: {
  defaultContent?: string
  parentEvent?: Event
  open: boolean
  setOpen: Dispatch<boolean>
}) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { publish, checkLogin } = useNostr()
  const [content, setContent] = useState(defaultContent)
  const [posting, setPosting] = useState(false)
  const canPost = !!content && !posting

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
  }

  const post = async (e: React.MouseEvent) => {
    e.stopPropagation()
    checkLogin(async () => {
      if (!canPost) {
        setOpen(false)
        return
      }

      setPosting(true)
      try {
        const additionalRelayUrls: string[] = []
        if (parentEvent) {
          const relayList = await client.fetchRelayList(parentEvent.pubkey)
          additionalRelayUrls.push(...relayList.read.slice(0, 5))
        }
        const draftEvent = await createShortTextNoteDraftEvent(content, parentEvent)
        await publish(draftEvent, additionalRelayUrls)
        setContent('')
        setOpen(false)
      } catch (error) {
        if (error instanceof AggregateError) {
          error.errors.forEach((e) =>
            toast({
              variant: 'destructive',
              title: t('Failed to post'),
              description: e.message
            })
          )
        } else if (error instanceof Error) {
          toast({
            variant: 'destructive',
            title: t('Failed to post'),
            description: error.message
          })
        }
        console.error(error)
        return
      } finally {
        setPosting(false)
      }
      toast({
        title: t('Post successful'),
        description: t('Your post has been published')
      })
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0" withoutClose>
        <ScrollArea className="px-4 h-full max-h-screen">
          <div className="space-y-4 px-2 py-6">
            <DialogHeader>
              <DialogTitle>
                {parentEvent ? (
                  <div className="flex gap-2 items-center max-w-full">
                    <div className="shrink-0">Reply to</div>
                    <UserAvatar userId={parentEvent.pubkey} size="tiny" />
                    <div className="truncate">{parentEvent.content}</div>
                  </div>
                ) : (
                  t('New post')
                )}
              </DialogTitle>
              <DialogDescription />
            </DialogHeader>
            <Textarea
              className="h-32"
              onChange={handleTextareaChange}
              value={content}
              placeholder={t('Write something...')}
            />
            {content && <Preview content={content} />}
            <div className="flex items-center justify-between">
              <Uploader setContent={setContent} />
              <div className="flex gap-2">
                <Mentions content={content} parentEvent={parentEvent} />
                <Button
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpen(false)
                  }}
                >
                  {t('Cancel')}
                </Button>
                <Button type="submit" disabled={!canPost} onClick={post}>
                  {posting && <LoaderCircle className="animate-spin" />}
                  {t('Post')}
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

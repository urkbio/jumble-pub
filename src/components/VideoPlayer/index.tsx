import { cn } from '@/lib/utils'
import videoManager from '@/services/video-manager.service'
import { useEffect, useRef } from 'react'
import NsfwOverlay from '../NsfwOverlay'

export default function VideoPlayer({
  src,
  className,
  isNsfw = false,
  size = 'normal'
}: {
  src: string
  className?: string
  isNsfw?: boolean
  size?: 'normal' | 'small'
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const video = videoRef.current
    const container = containerRef.current

    if (!video || !container) return

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting && !video.paused) {
          await videoManager.enterPiP(video)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(container)

    return () => {
      observer.unobserve(container)
    }
  }, [])

  const handlePlay = async () => {
    const video = videoRef.current
    if (!video) return

    await videoManager.playVideo(video)
  }

  return (
    <div ref={containerRef} className="relative">
      <video
        ref={videoRef}
        controls
        className={cn('rounded-lg', size === 'small' ? 'h-[15vh]' : 'h-[30vh]', className)}
        src={src}
        onClick={(e) => e.stopPropagation()}
        onPlay={handlePlay}
      />
      {isNsfw && <NsfwOverlay className="rounded-lg" />}
    </div>
  )
}

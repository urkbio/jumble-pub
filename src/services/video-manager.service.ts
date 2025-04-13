class VideoManagerService {
  static instance: VideoManagerService

  private currentVideo: HTMLVideoElement | null = null

  constructor() {
    if (!VideoManagerService.instance) {
      VideoManagerService.instance = this
      document.addEventListener('leavepictureinpicture', (e) => {
        ;(e.target as HTMLVideoElement).pause()
      })
    }
    return VideoManagerService.instance
  }

  enterPiP(video: HTMLVideoElement) {
    if (this.currentVideo && this.currentVideo !== video) {
      this.exitPiP(this.currentVideo)
    }

    if (
      (video as any).webkitSupportsPresentationMode &&
      typeof (video as any).webkitSetPresentationMode === 'function'
    ) {
      ;(video as any).webkitSetPresentationMode('picture-in-picture')
      setTimeout(() => {
        if ((video as any).webkitPresentationMode !== 'picture-in-picture') {
          video.pause()
        }
      }, 10)
    } else {
      video.requestPictureInPicture().catch(() => {
        video.pause()
      })
    }
  }

  private exitPiP(video: HTMLVideoElement) {
    video.pause()
    if (
      (video as any).webkitSupportsPresentationMode &&
      typeof (video as any).webkitSetPresentationMode === 'function'
    ) {
      ;(video as any).webkitSetPresentationMode('inline')
    } else {
      document.exitPictureInPicture()
    }

    if (this.currentVideo === video) {
      this.currentVideo = null
    }
  }

  async playVideo(video: HTMLVideoElement) {
    if (this.currentVideo && this.currentVideo !== video) {
      this.exitPiP(this.currentVideo)
    }
    this.currentVideo = video
    video.play()
  }
}

const instance = new VideoManagerService()
export default instance

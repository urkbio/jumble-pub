class VideoManagerService {
  static instance: VideoManagerService

  private currentVideo: HTMLVideoElement | null = null

  constructor() {
    if (!VideoManagerService.instance) {
      VideoManagerService.instance = this
    }
    return VideoManagerService.instance
  }

  async enterPiP(video: HTMLVideoElement) {
    if (this.currentVideo && this.currentVideo !== video) {
      await this.exitPiP(this.currentVideo)
    }

    if ('requestPictureInPicture' in video) {
      await video.requestPictureInPicture()
    } else if ('webkitSetPresentationMode' in video) {
      ;(video as any).webkitSetPresentationMode('picture-in-picture')
    }
  }

  async exitPiP(video: HTMLVideoElement) {
    video.pause()
    if (document.pictureInPictureElement === video) {
      await document.exitPictureInPicture()
    } else if ('webkitSetPresentationMode' in video) {
      ;(video as any).webkitSetPresentationMode('inline')
    }

    if (this.currentVideo === video) {
      this.currentVideo = null
    }
  }

  async playVideo(video: HTMLVideoElement) {
    if (this.currentVideo && this.currentVideo !== video) {
      await this.exitPiP(this.currentVideo)
    }
    this.currentVideo = video
    video.play()
  }
}

const instance = new VideoManagerService()
export default instance

declare module 'gif.js' {
  interface GifOptions {
    workers?: number
    quality?: number
    width?: number
    height?: number
    workerScript?: string
    repeat?: number
    background?: string
    transparent?: number
  }

  interface AddFrameOptions {
    copy?: boolean
    delay?: number
  }

  export default class GIF {
    constructor(options?: GifOptions)
    addFrame(element: CanvasImageSource, options?: AddFrameOptions): void
    on(event: 'progress', callback: (progress: number) => void): void
    on(event: 'finished', callback: (blob: Blob) => void): void
    on(event: 'abort', callback: () => void): void
    render(): void
  }
}

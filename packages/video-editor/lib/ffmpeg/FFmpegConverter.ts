import { FFmpeg } from "@ffmpeg/ffmpeg";

export class FFmpegConverter {
  file: File | undefined;

  private ffmpeg: FFmpeg | undefined;

  async init(): Promise<void> {
    this.ffmpeg = new FFmpeg();

    await this.ffmpeg.load({
      coreURL: import.meta.env.VITE_FFMPEG_CORE_PATH,
      wasmURL: import.meta.env.VITE_FFMPEG_WASM_PATH,
    });
  }

  isLoaded(): boolean {
    return this.ffmpeg?.loaded ?? false;
  }

  async cancel(): Promise<void> {
    if (!this.isLoaded()) {
      console.warn("Cancel: FFmpeg is not loaded. Run init() first.");
      return;
    } else {
      this.ffmpeg?.terminate();
      return this.init();
    }
  }

  async destroy(): Promise<void> {
    if (!this.isLoaded()) {
      console.warn("Destroy: FFmpeg is not loaded. Run init() first.");
    } else {
      this.ffmpeg?.terminate();
    }
  }
}

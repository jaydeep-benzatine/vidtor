import type { FFmpeg } from "@ffmpeg/ffmpeg";
import { toast } from "sonner";

const ffmpegCoreBaseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";

export const loadFFmpeg = async (ffmpeg: FFmpeg) => {
  try {
    await ffmpeg.load({
      coreURL: `${ffmpegCoreBaseURL}/ffmpeg-core.js`,
      wasmURL: `${ffmpegCoreBaseURL}/ffmpeg-core.wasm`,
    });

    return 'loaded';
  } catch (error) {
    toast("Unable to load ffmpeg");
    return 'error';
  }

}

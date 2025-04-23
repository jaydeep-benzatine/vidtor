import type { FFmpeg } from "@ffmpeg/ffmpeg";
import { useEffect, useState } from "react"

export const FFmpegConversionProgress = ({ ffmpeg }: { ffmpeg: FFmpeg }) => {
  const [progress, setProgress] = useState<string>("0");

  useEffect(() => {
    registerFFmpegProgress();

    return () => {
      unregisterFFmpegProgress();
    }
  }, []);

  const registerFFmpegProgress = () => {
    ffmpeg.on('progress', ({ progress, time }) => {
      const progressPer = (progress * 100).toFixed(0)
      setProgress(progressPer);
    });
  }

  const unregisterFFmpegProgress = () => {
    // ffmpeg.off('progress', () => { });
  }

  return <p>Progress: {progress}%</p>
}
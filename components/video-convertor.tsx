'use client'

import { useEffect, useRef, useState } from 'react'
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { toBlobURL, fetchFile } from '@ffmpeg/util'

export const VideoConvertor = async () => {
  const [loaded, setLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const ffmpegRef = useRef(new FFmpeg());

  useEffect(() => {
    load()
  }, []);

  const load = async () => {
    setIsLoading(true);
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";

    const ffmpeg = ffmpegRef.current;
    // ffmpeg.on("log", ({ message }) => {
    //   if (messageRef.current) messageRef.current.innerHTML = message;
    // });

    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
    setLoaded(true);
    setIsLoading(false);
  }

  if (isLoading) return <p>FFmpeg is loading</p>
}
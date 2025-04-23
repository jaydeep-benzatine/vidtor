'use client';

import { Dropzone } from "@/components/dropzone";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile } from '@ffmpeg/util'
import { loadFFmpeg } from "@/utils/load-ffmpeg";
import { FFmpegConversionProgress } from "@/components/prgress";

type FFmpegStatusType = 'idle' | 'loading' | 'loaded' | 'error';
type FFmpegResultStatusType = 'idle' | 'generating' | 'generated' | 'error';

export default function HomePage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [file, setFile] = useState<File>();
  const [resolutionInfo, setResolutionInfo] = useState("0 x 0");

  const [ffmpegStatus, setFFmpegStatus] = useState<FFmpegStatusType>('idle')
  const [ffmpegResultStatus, setFFmpegResultStatus] = useState<FFmpegResultStatusType>('idle')
  const [ffmpegResultURL, setFFmpegResultURL] = useState<string>("");
  const ffmpegRef = useRef(new FFmpeg());

  useEffect(() => {
    setFFmpegStatus('loading');

    loadFFmpeg(ffmpegRef.current).then(status => setFFmpegStatus(status))
  }, []);

  useEffect(() => {
    if (!file || videoRef.current === null) return;

    const video = videoRef.current;

    const fileURL = URL.createObjectURL(file);
    video.src = fileURL;

    video.onloadeddata = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;

      setResolutionInfo(`${width} x ${height}`);
    }
  }, [file]);

  const handleConvert = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    toast('Converting...');

    const ffmpeg = ffmpegRef.current;
    const formData = new FormData(evt.currentTarget);

    const file = formData.get('video-file') as File;
    const resolution = formData.get('resolution') as string;
    console.log("file", file);
    console.log("resolution", resolution);

    const filename = file.name;
    const fileExt = filename.split(".")[1] || 'mp4';
    const outputFile = `output.${fileExt}`;

    ffmpeg.on('progress', ({ progress, time }) => {
      console.log("ffmpeg progress:", progress, time);
    });
    // ffmpeg.on('log', ({ message, type }) => {
    //   console.log("ffmpeg log:", message, type);
    // });

    console.log("writing file to ffmpeg filesystem");
    await ffmpeg.writeFile(filename, await fetchFile(file));
    console.log("file writing complete");

    console.log("executing ffmpeg command");
    setFFmpegResultStatus('generating');
    await ffmpeg.exec(['-i', file.name, '-vf', 'scale=-2:144', '-c:a', 'copy', outputFile]);
    console.log("command ran successfully");

    console.log("reading file to ffmpeg filesystem");
    const data = await ffmpeg.readFile(outputFile);
    console.log("file reading complete");

    // @ts-expect-error
    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));

    setFFmpegResultStatus('generated');
    setFFmpegResultURL(url);

    console.log("Download url:", url)

    setResolutionInfo("");
    evt?.currentTarget?.reset();
  }

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = ffmpegResultURL;
    a.download = `output.${file?.name?.split('.')[1]}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(ffmpegResultURL);
  };


  return (
    <>
      <div className="flex flex-col gap-10 justify-center items-center h-screen w-full font-mono">
        <h1 className="text-4xl font-semibold">Vidtor - AI powered video convertor</h1>
        <p>FFmpeg status: {ffmpegStatus}</p>
        {/* TODO: Complete Dropzone implementation */}
        <Dropzone />

        <form onSubmit={handleConvert} className="flex flex-col gap-4 items-center">
          <input
            type="file"
            name="video-file"
            id="video-file"
            accept="video/*"
            className="cursor-pointer block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            onChange={evt => {
              if (evt.target.files && evt.target.files?.length > 0) setFile(evt.target.files[0]);
            }}
          />

          {/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
          <video ref={videoRef} id="videoPreview" style={{ display: 'none' }} />
          <p>Current Resolutions: {resolutionInfo}</p>
          <FFmpegConversionProgress ffmpeg={ffmpegRef.current} />

          <div className="flex items-center gap-2">
            <p>Convert to:</p>
            <select name="resolution" id="resolution-selector" className="border rounded-2xl px-3 py-1">
              <option value="144p">144p</option>
              <option value="240p">240p</option>
              <option value="360p">360p</option>
              <option value="720p">720p</option>
              <option value="1080p">1080p</option>
            </select>

            <button type="submit" disabled={!ffmpegRef.current.loaded} className="bg-black hover:bg-black/90 text-white font-bold py-2 px-4 rounded-md">{ffmpegRef.current.loaded ? 'Convert' : 'Loading ffmpeg'}</button>
            {
              ffmpegResultStatus !== 'idle' ?
                <button type="button" disabled={ffmpegResultStatus !== 'generated'} onClick={handleDownload} className="bg-black hover:bg-black/90 text-white font-bold py-2 px-4 rounded-md">Download</button>
                : null
            }
          </div>
        </form>
      </div>
    </>
  );
}

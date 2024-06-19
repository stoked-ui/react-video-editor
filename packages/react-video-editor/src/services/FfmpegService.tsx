import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { useEffect, useRef, useState } from 'react';

type CreateScreenshot = (videoName: string, videoBuffer: ArrayBuffer, timestamp: string) => Promise<string | undefined>
type Transcode = (videoUrl: string) => Promise<string>;

const getUrlExtension = (url: string): string | null => {
  const urlParts = url.split('?')[0]?.split('.');
  if (!urlParts || urlParts.length  === 1) {
    return null; // No extension found
  }
  return urlParts.at(-1) ?? null;
};

let once: boolean = false;
const FfmpegService = (): { createScreenshot: CreateScreenshot, transcode: Transcode, loaded: boolean, loading: boolean} => {
  const ffmpegRef = useRef(new FFmpeg());
  const messageRef = useRef<HTMLParagraphElement | null>(null);
  const [state, setState] = useState({ loaded: false, loading: false });

  const load = async (): Promise<void> => {
    if (once || state.loading || !crossOriginIsolated) return;
    once = true;
    setState({ loading: true, loaded: false });
    //const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";
    const baseURL = `${window.location.href}assets/ffmpeg`;
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => {
      if (messageRef.current) messageRef.current.innerHTML = message;
    });
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    const loadOpts = {
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
      workerURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.worker.js`,
        "text/javascript"
      ),
    };
    console.log('loadOpts', loadOpts);
    await ffmpeg.load(loadOpts);
    setState({ loading: false, loaded: true });
  };

  useEffect(() => {
    // React advises to declare the async function directly inside useEffect
    if (!state.loading && !state.loaded) {
      load()
        .then(() => {
          setState({ loading: false, loaded: true });
        })
        .catch((error) => {
          console.log('load err', error);
        });
    }
  }, []);

  const transcode = async (videoUrl: string): Promise<string> => {
    const ffmpeg = ffmpegRef.current;
    const extension = getUrlExtension(videoUrl);
    const inputName = `input.${extension}`;
    await ffmpeg.writeFile(inputName, await fetchFile(videoUrl));
    await ffmpeg.exec(['-i', inputName, 'output.mp4']);
    const fileData = await ffmpeg.readFile('output.mp4');
    const data = new Uint8Array(fileData as ArrayBuffer);
    return URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
  };

  const createScreenshot = async (videoName: string, videoBuffer: ArrayBuffer, timestamp: string): Promise<string | undefined> => {
    if (!state.loaded) {
      await load()
    }
    try {
      if (!videoBuffer) return;
      const extension = videoName?.split('.').pop()?.toLocaleLowerCase();
      const ffmpeg = ffmpegRef.current;
      const inputName = `input.${extension}`;
      const uintArray = new Uint8Array(videoBuffer);
      await ffmpeg.writeFile(inputName, uintArray);
      await ffmpeg.exec([
        '-i',
        inputName,
        '-ss',
        `${timestamp}`,
        '-vframes',
        '1',
        'screenshot.jpg',
      ]);
      const fileData = await ffmpeg.readFile('screenshot.jpg');
      return URL.createObjectURL(new Blob([fileData], { type: 'image/jpeg' }));
    } catch (error) {
      console.log('createScreenshot', error);
      return;
    }
  };
  return { transcode, createScreenshot, ...state };
};

export default FfmpegService;

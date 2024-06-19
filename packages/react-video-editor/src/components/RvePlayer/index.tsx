import ReactPlayer from 'react-player';
import { VideoFile, type IVideoFile } from '@store/VideoFile';
import type { ReactNode } from "react";
import { useEffect, useState, type CSSProperties } from "react";
import type { IRveFile } from '@store/RveFile';

const RvePlayer = ({
  video,
  update,
  showing,
}: {
  video: VideoFile;
  update: (vid: IVideoFile) => void;
  showing?: IRveFile | null;
}): ReactNode => {
  const handleDuration = (duration: number, video: VideoFile): void => {
    const newVid = new VideoFile({ ...video } as IVideoFile);
    newVid.duration = duration;
    const vid: HTMLVideoElement | null = document.querySelector(
      `#${video.id} video`
    );
    newVid.width = vid?.videoWidth;
    newVid.height = vid?.videoHeight;
    newVid.element = vid;
    console.log(`${newVid.id} duration: ${newVid.duration}`);
    update(newVid);
  };

  const styleInit: CSSProperties = {
    position: 'absolute',
    left: '-9999px',
    opacity: '0',
  };

  const [visible, setVisible] = useState(showing?.id === video.id);
  const [style, setStyle] = useState(styleInit);

  /*useEffect(() => {
    const currentVis = showing?.id === video.id;
    if (currentVis !== visible) {
      setVisible(currentVis);
      if (currentVis) {
        setStyle({ width: '100%' });
      } else {
        setStyle(styleInit);
      }
    }
  }, [showing]);*/

  return (
    <ReactPlayer
      key={video.id}
      id={video.id}
      url={video.src}
      width={'100%'}
      height={'100%'}
      playing={video.playing}
      style={style}
      onDuration={(duration: number) => {
        handleDuration(duration, video)
      }}
    />
  );
};

export default RvePlayer;

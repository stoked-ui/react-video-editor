import { styled } from '@mui/material/styles';
import './RveTimeline.scss';
import type { PlyrProps } from 'plyr-react';
import { useRveContext } from '@components/Rve/RveProvider';
import RveTimelineTracks from './RveTimelineTracks';
import RveScreenShotEditor from '../RveScreenShotEditor';
import RvePlayer from '@components/RvePlayer';
import { useState } from 'react';
import type { IVideoFile, VideoFile } from '@store/VideoFile';
import type { IRveFile } from '@store/RveFile';
import type { EditData } from "@stokedconsulting/react-timeline-editor/dist/interface/timeline";
import type {TimelineEffect, TimelineRow} from "@stokedconsulting/react-timeline-editor";

export interface IRveTimelineVideoProps {
  variant?: 'padded' | 'minimized';
  padding?: string | undefined;
  className?: string | undefined;
}

interface RveTimelineVideoOwnerState extends IRveTimelineVideoProps {
  // …key value pairs for the internal state that you want to style the slot
  // but don't want to expose to the users
}

export interface IRveEmptyScreenProps {
  aspectRatio?: number;
}

interface RveEmptyScreenOwnerState extends IRveEmptyScreenProps {
  // …key value pairs for the internal state that you want to style the slot
  // but don't want to expose to the users
}

const RveEmptyScreen = styled('div', {
  name: 'MuiRveEmptyScreen',
})<{ ownerState: RveEmptyScreenOwnerState }>(({ ownerState }) => ({
  ...(ownerState.aspectRatio && {
    aspectRatio: ownerState.aspectRatio,
  }),
}));

const RveVideoRoot = styled('div', {
  name: 'MuiRveVideo',
  slot: 'root',
})<{ ownerState: RveTimelineVideoOwnerState }>(({ ownerState }) => ({
  ...(ownerState.variant === 'padded' && {
    padding: ownerState.padding,
  }),
}));

export default function RveTimeline(
  props: IRveTimelineVideoProps & PlyrProps & RveTimelineVideoOwnerState
): JSX.Element {
  const editorCtx = useRveContext();
  const { first, current } = editorCtx;
  const [files, setVideos] = useState(editorCtx.originals || []);
  const [nowShowing, setNowShowing] = useState(current());

  const screenShotVid = first() as IVideoFile;
  const updateFile = (updatedFile: IRveFile): void => {
    const newVideos: IRveFile[] = files.map((file) => {
      if (file.id === updatedFile.id) {
        return updatedFile;
      }
      return file;
    });
    editorCtx.updateFile(updatedFile);
    setVideos(newVideos);
  };
  const screenShotEditor = screenShotVid ? (
    <RveScreenShotEditor video={screenShotVid} />
  ) : (
    <></>
  );

  const emptyVid = nowShowing ? (
    <></>
  ) : (
    <RveEmptyScreen
      ownerState={{ aspectRatio: editorCtx.aspectRatio() }}
      className={'empty-video'}
    />
  );
  const data: TimelineRow[] = [];
  const effects: Record<string, TimelineEffect> = {};
  const [timelineData, setTimelineData] = useState<EditData>({
    editorData: data,
    effects: effects,
  });

  return (
    <RveVideoRoot
      ownerState={{ ...props }}
      className={`rve-video ${props.className ? props.className : ''}`}
    >
      {screenShotEditor}
      {emptyVid}
      {files.map((file) => {
        if (file as VideoFile) {
          return (
            <RvePlayer
              video={file as IVideoFile}
              key={file.id}
              update={updateFile}
              showing={nowShowing}
            />
          );
        }
        return <></>
      })}
      {/*<RveTimelineTracks
        files={files}
        setShowing={setNowShowing}
        timelineData={timelineData}
        setTimelineData={setTimelineData}
      />*/}
    </RveVideoRoot>
  );
}

import { styled } from '@mui/material/styles';
import './RveTimeline.scss';
import { useRveContext, type VisibleFile } from '../Rve/RveProvider';
import RveScreenShotEditor from '../RveScreenShotEditor';
import RvePlayer from '../RvePlayer';
import {useRef, useState } from 'react';
import type { IVideoFile, VideoFile } from '../../models/VideoFile';
import type RveFile from '../../models/RveFile';
import type { IRveFile } from '../../models/RveFile';
import type { EditData, EffectSourceParam, TimelineAction, TimelineEffect, TimelineState, TimelineRow } from '@stokedui/timeline';
import IdGenerator from '../../services/IdGenerator.tsx';
import RveTimelineTracks from '../RveTimeline/RveTimelineTracks.tsx';

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

export interface RveTimelineAction extends TimelineAction {
  file: IRveFile;
}

export interface RveTimelineRow extends TimelineRow {
  actions: RveTimelineAction[];
}

export interface RveTimelineEffect extends TimelineEffect {
  updateVisible: (data: TimelineRow[], state: TimelineState) => void;
}

export default function RveTimeline(
  props: IRveTimelineVideoProps & RveTimelineVideoOwnerState
): JSX.Element {
  const editorCtx = useRveContext();
  const { first, current } = editorCtx;
  const [files, setVideos] = useState(editorCtx.originals || []);
  const [nowShowing, setNowShowing] = useState(current());

  console.log('editorCtx originals length', editorCtx.originals?.length);
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


  const emptyVid = nowShowing ? (
    <></>
  ) : (
    <RveEmptyScreen
      ownerState={{ aspectRatio: editorCtx.aspectRatio() }}
      className={'empty-video'}
    />
  );
  const data: TimelineRow[] = [];

  const [initializedFiles, setInitializedFiles] = useState<IRveFile[]>([]);
  const timelineState = useRef<TimelineState>(null);
  const autoScrollWhenPlay = useRef<boolean>(true);

  const getVideo = (param: EffectSourceParam): VideoFile | null => {
    const actionFile = (param.action as RveTimelineAction).file;
    if (!actionFile) return null;
    if (actionFile as VideoFile) {
      return actionFile as VideoFile;
    }
    return null;
  };

  const stopVideo = (param: EffectSourceParam): void => {
    const video = getVideo(param);
    if (!video) return;
    const videoElement: HTMLVideoElement = video.element as HTMLVideoElement;
    videoElement?.pause();
  };

  const seekVideo = (param: EffectSourceParam): VideoFile | null => {
    const video = getVideo(param);
    if (!video) return null;
    const videoElement: HTMLVideoElement = video.element as HTMLVideoElement;
    videoElement.currentTime = param.time;
    return video;
  };

  const playVideoFrom = (param: EffectSourceParam): void => {
    const { isPlaying } = param;
    if (isPlaying) {
      const video = seekVideo(param);
      const videoElement: HTMLVideoElement = video?.element as HTMLVideoElement;
      void videoElement?.play().then(() => {
        console.log(`playing ${video?.name}: ${param.time}`);
      });
    }
  };

  const start = (param: EffectSourceParam): void => {
    playVideoFrom(param);
    const rveEffect = param.effect as RveTimelineEffect;
    if (!timelineState?.current) return;
    rveEffect.updateVisible(data, timelineState.current);
  };

  const stop = (param: EffectSourceParam): void => {
    const plyrAction: RveTimelineAction = param.action as RveTimelineAction;
    const videoFile: VideoFile = plyrAction.file as VideoFile;

    console.log('stop videoFile', videoFile.name);
    const rveEffect = param.effect as RveTimelineEffect;
    if (!timelineState?.current) return;
    rveEffect.updateVisible(data, timelineState.current);
    stopVideo(param);
  };

  const enter = (param: EffectSourceParam): void => {
    const plyrAction: RveTimelineAction = param.action as RveTimelineAction;
    const videoFile: VideoFile = plyrAction.file as VideoFile;

    console.log('stop videoFile', videoFile.name);
    const rveEffect = param.effect as RveTimelineEffect;
    if (!timelineState?.current) return;
    rveEffect.updateVisible(data, timelineState.current);
    seekVideo(param);
  };

  const leave = (param: EffectSourceParam): void => {
    const plyrAction: RveTimelineAction = param.action as RveTimelineAction;
    const videoFile: VideoFile = plyrAction.file as VideoFile;

    console.log('stop videoFile', videoFile.name);
    const rveEffect = param.effect as RveTimelineEffect;
    if (!timelineState?.current) return;
    rveEffect.updateVisible(data, timelineState.current);
  };

  const updateVisible = (data: TimelineRow[], state: TimelineState): void => {
    console.log('timelineState', state?.getTime());
    const time = state?.getTime();
    let visible: VisibleFile = {
      file: null,
      index: -1,
    };
    if (data.length) {
      data.forEach((row, index) => {
        row.actions.forEach((action: TimelineAction) => {
          if (!visible.file && action.effectId === 'video' && action.start <= time && action.end > time) {
            visible = {
              file: (action as RveTimelineAction).file as VideoFile,
              index: index,
            };
          }
        });
      });
      setNowShowing(visible?.file || null);
    }
  };

  const update = (param: EffectSourceParam): void => {
    const rveEffect = param.effect as RveTimelineEffect;
    if (!timelineState?.current) return;
    rveEffect.updateVisible(data, timelineState.current);
    const { isPlaying } = param;
    if (!isPlaying) {
      seekVideo(param);
    }
  };

  const effects: Record<string, RveTimelineEffect> = {
    video: {
      id: 'video',
      name: 'grain',
      source: {
        start,
        enter,
        update,
        leave,
        stop,
      },
      updateVisible,
    },
    effect1: {
      id: 'effect1',
      name: 'ambient noise',
      updateVisible,
    },
  };

  const [timelineData, setTimelineData] = useState<EditData>({
    editorData: data,
    effects: effects,
  });
  const [videoDimensions, setVideoDimensions] = useState<{ height: string, aspectRatio: string }>({ height: '100%', aspectRatio: '16/9' });

  const { newActionId } = IdGenerator();

  const initialTracks = [
    <div className="timeline-list-item" key={0}>
      <div className="text" contentEditable={true}>
        Track 1
      </div>
    </div>,
    <div className="timeline-list-item" key={1}>
      <div className="text" contentEditable={true}>
        Track 2
      </div>
    </div>,
  ];

  const getNextStart = (file: RveFile): number => {
    let start = 0;

    timelineData.editorData.forEach((row: TimelineRow) => {
      row.actions.forEach((action: TimelineAction) => {
        let sameFile = false;
        if (action.effectId === 'video') {
          const fileAction = action as RveTimelineAction;
          if (fileAction.file === file) {
            sameFile = true;
          }
        }
        if (!sameFile && action.end > start) {
          start = action.end;
        }
      });
    });
    return start;
  };

  /*useEffect(() => {
   const state = timelineState.current;
   if (state && timelineData) {
   updateVisible(timelineData.editorData, state);
   }
   }, [data, timelineState.current?.getTime()]);
   */
  const uninitializedFiles = files?.filter((file: IRveFile) => {
    const uninitialized = initializedFiles.indexOf(file) === -1;
    if (file as VideoFile) {
      return uninitialized && (file as VideoFile).duration !== -1;
    }
    return uninitialized;
  });

  const initializedActions: RveTimelineAction[] | undefined = uninitializedFiles.map((file: IRveFile) => {
    const start = getNextStart(file);
    let end = start + 1;
    if (file as VideoFile) {
      const video = file as VideoFile;
      end = start + video.duration;
    }
    return {
      id: newActionId(),
      start,
      end,
      effectId: 'video',
      file: file,
    };
  });

  if (!timelineData) {
    return <></>;
  }
  const firstRow = timelineData?.editorData.findIndex((row: TimelineRow) => row?.id === '0') ?? 0;
  if (initializedActions && (initializedActions?.length ?? 0) > 0 && uninitializedFiles && timelineData && timelineState.current) {
    if (firstRow === -1) {
      timelineData.editorData = [
        {
          id: '0',
          actions: initializedActions,
        },
      ];
    } else {
      timelineData.editorData[firstRow]?.actions.concat(initializedActions);
      setTimelineData({ ...timelineData });
    }
    setInitializedFiles([...uninitializedFiles]);
    updateVisible(timelineData.editorData, timelineState.current);
  }

  const setRows = (rows: TimelineRow[]): void => {
    setTimelineData({
      ...timelineData,
      editorData: rows as RveTimelineRow[],
      effects,
    });
  };

  //TODO: mutation observer to detect video player size change
  if ((nowShowing as VideoFile)?.duration !== -1) {
    const showingPlayer: HTMLVideoElement | null = document.querySelector(`#${nowShowing?.id} video`);
    if (showingPlayer) {
      setTimeout(() => {
        setVideoDimensions({
          height: `${showingPlayer.clientHeight}px`,
          aspectRatio: `${showingPlayer.videoWidth}/${showingPlayer.videoHeight}`,
        });
      }, 2000);
    }
  }
  const screenShotEditor = screenShotVid ? (
    <RveScreenShotEditor video={screenShotVid} {...videoDimensions} />
  ) : (
    <></>
  );

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
      <RveTimelineTracks
        autoScrollWhenPlay={autoScrollWhenPlay}
        initialTracks={initialTracks}
        setRows={setRows}
        effects={effects}
        timelineData={timelineData}
        timelineState={timelineState}
      />
    </RveVideoRoot>
  );
}

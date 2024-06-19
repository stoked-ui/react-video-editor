import type {
  EffectSourceParam,
  TimelineAction,
  TimelineEffect,
  EditData,
  TimelineRow,
  TimelineState} from '@stokedconsulting/react-timeline-editor';
import {
  Timeline,
  TimelineEngine,
} from '@stokedconsulting/react-timeline-editor';
import type { ReactElement} from 'react';
import { useEffect, useRef, useState } from 'react';
import type { VideoFile } from '@store/VideoFile';
import type { VisibleFile } from '@components/Rve/RveProvider';
import type { IRveFile } from '@store/RveFile';
import type RveFile from '@store/RveFile';
import IdGeneratorService from '@services/IdGeneratorService';
import RveTimelineControls from './RveTimelineControls';
import { data } from "autoprefixer";

/*

export const effects: Record<string, TimelineEffect> = {
  video: {
    id: 'video',
    name: 'video',
  },
  image: {
    id: 'image',
    name: 'image',
  },
  audio: {
    id: 'audio',
    name: 'audio',
  },
};
*/

export interface RveTimelineAction extends TimelineAction {
  file: IRveFile;
}

export interface RveTimelineRow extends TimelineRow {
  actions: RveTimelineAction[];
}

export interface RveTimelineEffect extends TimelineEffect {
  updateVisible: (data: TimelineRow[], state: TimelineState) => void;
}

const engine = new TimelineEngine();
const RveTimelineTracks = ({
  files,
  setShowing,
  timelineData,
  setTimelineData,
}: {
  files: IRveFile[];
  setShowing: (vid: IRveFile | null) => void;
  timelineData: EditData;
  setTimelineData: (data: EditData) => void;
}): JSX.Element => {
  const { newActionId } = IdGeneratorService();

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

  const [tracks, setTracks] = useState<ReactElement[]>(initialTracks);

  const addTrack = (existingTracks: ReactElement[]): void => {
    const newTracks = [...existingTracks];
    newTracks.push(
      <div className="timeline-list-item" key={existingTracks.length}>
        <div className="text" contentEditable={true}>
          Track {existingTracks.length + 1}
        </div>
      </div>
    );
    setTracks(newTracks);
  };

  const addTrackButton = (
    <button
      aria-label={'Add Track'}
      onClick={() => { addTrack(tracks); }}
      key={'add track'}
    />
  );

  const [initializedFiles, setInitializedFiles] = useState<IRveFile[]>([]);
  const domRef = useRef<HTMLDivElement>(null);
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
    if (!timelineData || !timelineState?.current) return;
    rveEffect.updateVisible(timelineData.editorData, timelineState.current);
  };

  const stop = (param: EffectSourceParam): void => {
    const plyrAction: RveTimelineAction = param.action as RveTimelineAction;
    const videoFile: VideoFile = plyrAction.file as VideoFile;

    console.log('stop videoFile', videoFile.name);
    const rveEffect = param.effect as RveTimelineEffect;
    if (!timelineData || !timelineState?.current) return;
    rveEffect.updateVisible(timelineData.editorData, timelineState.current);
    stopVideo(param);
  };

  const enter = (param: EffectSourceParam): void => {
    const plyrAction: RveTimelineAction = param.action as RveTimelineAction;
    const videoFile: VideoFile = plyrAction.file as VideoFile;

    console.log('stop videoFile', videoFile.name);
    const rveEffect = param.effect as RveTimelineEffect;
    if (!timelineData || !timelineState?.current) return;
    rveEffect.updateVisible(timelineData.editorData, timelineState.current);
    seekVideo(param);
  };

  const leave = (param: EffectSourceParam): void => {
    const plyrAction: RveTimelineAction = param.action as RveTimelineAction;
    const videoFile: VideoFile = plyrAction.file as VideoFile;

    console.log('stop videoFile', videoFile.name);
    const rveEffect = param.effect as RveTimelineEffect;
    if (!timelineData || !timelineState?.current) return;
    rveEffect.updateVisible(timelineData.editorData, timelineState.current);
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
          if (
            !visible.file &&
            action.effectId === 'video' &&
            action.start <= time &&
            action.end > time
          ) {
            visible = {
              file: (action as RveTimelineAction).file as VideoFile,
              index: index,
            };
          }
        });
      });
      setShowing(visible?.file || null);
    }
  };

  const update =   (param: EffectSourceParam): void => {
    const rveEffect = param.effect as RveTimelineEffect;
    if (!timelineData || !timelineState?.current) return;
    rveEffect.updateVisible(
      timelineData.editorData,
      timelineState.current
    );
    const { isPlaying } = param;
    if (!isPlaying) {
      seekVideo(param);
    }
  }

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

  const initializedActions: RveTimelineAction[] | undefined =
    uninitializedFiles.map((file: IRveFile) => {
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
    return <></>
  }
  const firstRow = timelineData?.editorData.findIndex((row: TimelineRow) => row?.id === '0') ?? 0;
  if (
    initializedActions &&
    (initializedActions?.length ?? 0) > 0 &&
    uninitializedFiles &&
    timelineData
  ) {
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
  }

  const setRows = (rows: TimelineRow[]): void => {
    setTimelineData({
      ...timelineData,
      editorData: rows,
      effects,
    });
  };

  return (
    <>
      <RveTimelineControls
        timelineState={timelineState}
        autoScrollWhenPlay={autoScrollWhenPlay}
        engine={engine}
      />
      {/* <TransformWrapper
        initialScale={1}
        initialPositionX={200}
        initialPositionY={100}
      >
        {({zoomIn, zoomOut, resetTransform, ...rest}) => (
          <>
            <TransformComponent>*/}
      <div className={`rve-timeline`}>
        <div
          ref={domRef}
          style={{ overflow: 'overlay' }}
          onScroll={(e) => {
            const target = e.target as HTMLDivElement;
            timelineState.current?.setScrollTop(target.scrollTop);
          }}
          className={'timeline-list'}
        >
          {tracks.map((track) => track)}
          {addTrackButton}
        </div>
        <Timeline
          ref={timelineState}
          onChange={setRows}
          startLeft={5}
          editorData={timelineData.editorData}
          effects={effects}
          autoScroll={true}
          onScroll={({ scrollTop }) => {
            if (!domRef.current) return;
            domRef.current.scrollTop = scrollTop;
          }}
          getActionRender={(action: TimelineAction) => {
            if (action.effectId === 'video') {
              return (
                <div className="video">
                  {(action as RveTimelineAction).file.name}
                </div>
              );
            } else  if (action.effectId === 'image') {
              return (
                <div className="image">
                  {(action as RveTimelineAction).file.name}
                </div>
              );
            }
            return (
              <div className="file">
                {(action as RveTimelineAction).file.name}
              </div>
            );
          }}
          engine={engine}
          onClickTimeArea={(time) => {
            console.log('onClickTimeArea time:', time);
            return true;
          }}
          onCursorDragEnd={(time) => {
            console.log('onCursorDragEnd time:', time);
          }}
          onActionResizing={({ dir, action, start, end }) => {
            console.log('onActionResizing dir:', dir);
            console.log('onActionResizing action:', action);
            console.log('onActionResizing start:', start);
            console.log('onActionResizing end:', end);
          }}
          onActionMoveEnd={({ action }) => {
            console.log('onActionMoveEnd', action);
          }}
          onClickAction={(_, { action }) => {
            console.log('onClickAction', action);
          }}
        />
      </div>
      {/*</TransformComponent>
          </>
        )}
      </TransformWrapper>*/}
    </>
  );
};

export default RveTimelineTracks;

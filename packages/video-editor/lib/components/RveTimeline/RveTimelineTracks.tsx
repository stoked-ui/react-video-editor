import { Timeline, TimelineEngine, TimelineAction, TimelineRow, EditData, TimelineState } from '@stokedui/timeline';
import React, { ReactNode } from 'react';
import { useRef, useState } from 'react';
import type { RveTimelineEffect, RveTimelineAction } from './';
import RveTimelineControls from './RveTimelineControls';

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

const engine = new TimelineEngine();
const RveTimelineTracks = ({
  timelineData,
  timelineState,
  autoScrollWhenPlay,
  initialTracks,
  setRows,
  effects,
}: {
  timelineData: EditData;
  timelineState: React.RefObject<TimelineState>;
  autoScrollWhenPlay: React.MutableRefObject<boolean>;
  initialTracks: JSX.Element[],
  setRows: (rows: TimelineRow[]) => void;
  effects: Record<string, RveTimelineEffect>;
}): JSX.Element => {
  const domRef = useRef<HTMLDivElement>(null);


  const [tracks, setTracks] = useState<ReactNode[]>(initialTracks);

  const addTrack = (existingTracks: ReactNode[]): void => {
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
      onClick={() => {
        addTrack(tracks);
      }}
      key={'add track'}
    />
  );


  return (
    <>
      <RveTimelineControls timelineState={timelineState} autoScrollWhenPlay={autoScrollWhenPlay} engine={engine} />
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
          onScroll={e => {
            const target = e.target as HTMLDivElement;
            timelineState.current?.setScrollTop(target.scrollTop);
          }}
          className={'timeline-list'}
        >
          {tracks.map(track => track)}
          {addTrackButton}
        </div>
        <Timeline
          ref={timelineState}
          onChange={setRows}
          startLeft={5}
          editorData={timelineData.editorData}
          effects={effects}
          autoScroll={true}
          onScroll={(props: { scrollTop: number }) => {
            if (!domRef.current) return;
            domRef.current.scrollTop = props.scrollTop;
          }}
          getActionRender={(action: TimelineAction) => {
            if (action.effectId === 'video') {
              return <div className="video">{(action as RveTimelineAction).file.name}</div>;
            } else if (action.effectId === 'image') {
              return <div className="image">{(action as RveTimelineAction).file.name}</div>;
            }
            return <div className="file">{(action as RveTimelineAction).file.name}</div>;
          }}
          engine={engine}
          onClickTimeArea={(time: number) => {
            console.log('onClickTimeArea time:', time);
            return true;
          }}
          onCursorDragEnd={(time: number) => {
            console.log('onCursorDragEnd time:', time);
          }}
          onActionResizing={({ dir, action, start, end }: { dir: string, action: TimelineAction, start: number, end: number }) => {
            console.log('onActionResizing dir:', dir);
            console.log('onActionResizing action:', action);
            console.log('onActionResizing start:', start);
            console.log('onActionResizing end:', end);
          }}
          onActionMoveEnd={(props: { action: TimelineAction }) => {
            console.log('onActionMoveEnd', props.action);
          }}
          onClickAction={(_, { action }: { action: TimelineAction }): void => {
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

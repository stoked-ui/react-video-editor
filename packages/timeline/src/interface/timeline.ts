import React, { ReactNode } from 'react';
import { OnScrollParams } from 'react-virtualized';
import { ITimelineEngine } from '..';
import { Emitter } from '../engine/emitter';
import { EventTypes } from '../engine/events';
import { TimelineAction, TimelineRow } from './action';
import { TimelineEffect } from './effect';
export * from './action';
export * from './effect';

export interface EditData {
  /**
   * @description Timeline editing data
   */
  editorData: TimelineRow[];
  /**
   * @description timeline action effect map
   */
  effects: Record<string, TimelineEffect>;
  /**
   * @description Single tick mark category (>0)
   * @default 1
   */
  scale?: number;
  /**
   * @description Minimum number of ticks (>=1)
   * @default 20
   */
  minScaleCount?: number;
  /**
   * @description Maximum number of scales (>=minScaleCount)
   * @default Infinity
   */
  maxScaleCount?: number;
  /**
   * @description Number of single scale subdivision units (>0 integer)
   * @default 10
   */
  scaleSplitCount?: number;
  /**
   * @description Display width of a single scale (>0, unit: px)
   * @default 160
   */
  scaleWidth?: number;
  /**
   * @description The distance from the start of the scale to the left (>=0, unit: px)
   * @default 20
   */
  startLeft?: number;
  /**
   * @description Default height of each edit line (>0, unit: px)
   * @default 32
   */
  rowHeight?: number;
  /**
   * @description Whether to enable grid movement adsorption
   * @default false
   */
  gridSnap?: boolean;
  /**
   * @description Start dragging auxiliary line adsorption
   * @default false
   */
  dragLine?: boolean;
  /**
   * @description whether to hide the cursor
   * @default false
   */
  hideCursor?: boolean;
  /**
   * @description Disable dragging of all action areas
   * @default false
   */
  disableDrag?: boolean;
  /**
   * @description timeline runner, if not passed, the built-in runner will be used
   */
  engine?: ITimelineEngine;
  /**
   * @description Custom action area rendering
   */
  getActionRender?: (action: TimelineAction, row: TimelineRow) => ReactNode;
  /**
   * @description Custom scale rendering
   */
  getScaleRender?: (scale: number) => ReactNode;
  /**
   * @description Start moving callback
   */
  onActionMoveStart?: (params: { action: TimelineAction; row: TimelineRow }) => void;
  /**
   * @description Move callback (return false to prevent movement)
   */
  onActionMoving?: (params: { action: TimelineAction; row: TimelineRow; start: number; end: number }) => void | boolean;
  /**
   * @description Move end callback (return false to prevent onChange from triggering)
   */
  onActionMoveEnd?: (params: { action: TimelineAction; row: TimelineRow; start: number; end: number }) => void;
  /**
   * @description Start changing the size callback
   */
  onActionResizeStart?: (params: { action: TimelineAction; row: TimelineRow; dir: 'right' | 'left' }) => void;
  /**
   * @description Start size callback (return false to prevent changes)
   */
  onActionResizing?: (params: { action: TimelineAction; row: TimelineRow; start: number; end: number; dir: 'right' | 'left' }) => void | boolean;
  /**
   * @description size change end callback (return false to prevent onChange from triggering)
   */
  onActionResizeEnd?: (params: { action: TimelineAction; row: TimelineRow; start: number; end: number; dir: 'right' | 'left' }) => void;
  /**
   * @description Click row callback
   */
  onClickRow?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      row: TimelineRow;
      time: number;
    },
  ) => void;
  /**
   * @description click action callback
   */
  onClickAction?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      action: TimelineAction;
      row: TimelineRow;
      time: number;
    },
  ) => void;
  /**
   * @description Click action callback (not executed when drag is triggered)
   */
  onClickActionOnly?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      action: TimelineAction;
      row: TimelineRow;
      time: number;
    },
  ) => void;
  /**
   * @description Double-click row callback
   */
  onDoubleClickRow?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      row: TimelineRow;
      time: number;
    },
  ) => void;
  /**
   * @description Double-click action callback
   */
  onDoubleClickAction?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      action: TimelineAction;
      row: TimelineRow;
      time: number;
    },
  ) => void;
  /**
   * @description Right-click row callback
   */
  onContextMenuRow?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      row: TimelineRow;
      time: number;
    },
  ) => void;
  /**
   * @description Right-click action callback
   */
  onContextMenuAction?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      action: TimelineAction;
      row: TimelineRow;
      time: number;
    },
  ) => void;
  /**
   * @description Get the action id list to prompt the auxiliary line. Calculate it when move/resize start. By default, get all the action ids except the current move action.
   */
  getAssistDragLineActionIds?: (params: { action: TimelineAction; editorData: TimelineRow[]; row: TimelineRow }) => string[];
  /**
   * @description cursor starts drag event
   */
  onCursorDragStart?: (time: number) => void;
  /**
   * @description cursor ends drag event
   */
  onCursorDragEnd?: (time: number) => void;
  /**
   * @description cursor drag event
   */
  onCursorDrag?: (time: number) => void;
  /**
   * @description Click time area event, prevent setting time when returning false
   */
  onClickTimeArea?: (time: number, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => boolean | undefined;
}

export interface TimelineState {
  /** dom node */
  target: HTMLElement;
  /** Run the listener */
  listener: Emitter<EventTypes>;
  /** Whether it is playing */
  isPlaying: boolean;
  /** Whether it is paused */
  isPaused: boolean;
  /** Set the current playback time */
  setTime: (time: number) => void;
  /** Get the current playback time */
  getTime: () => number;
  /** Set playback rate */
  setPlayRate: (rate: number) => void;
  /** Set playback rate */
  getPlayRate: () => number;
  /** Re-render the current time */
  reRender: () => void;
  /** Play */
  play: (param: {
    /** By default, it runs from beginning to end, with a priority greater than autoEnd */
    toTime?: number;
    /** Whether to automatically end after playing */
    autoEnd?: boolean;
    /** List of actionIds to run, all run by default */
    runActionIds?: string[];
  }) => boolean;
  /** pause */
  pause: () => void;
  /** Set scroll left */
  setScrollLeft: (val: number) => void;
  /** Set scroll top */
  setScrollTop: (val: number) => void;
}

/**
 * Animation editor parameters
 * @export
 * @interface TimelineProp
 */
export interface TimelineEditor extends EditData {
  /**
   * @description The scroll distance from the top of the editing area (please use ref.setScrollTop instead)
   * @deprecated
   */
  scrollTop?: number;
  /**
   * @description Edit area scrolling callback (used to control synchronization with editing row scrolling)
   */
  onScroll?: (params: OnScrollParams) => void;
  /**
   * @description Whether to start automatic scrolling when dragging
   * @default false
   */
  autoScroll?: boolean;
  /**
   * @description Custom timeline style
   */
  style?: React.CSSProperties;
  /**
   * @description Whether to automatically re-render (update tick when data changes or cursor time changes)
   * @default true
   */
  autoReRender?: boolean;
  /**
   * @description Data change callback, which will be triggered after the operation action end changes the data (returning false will prevent automatic engine synchronization to reduce performance overhead)
   */
  onChange?: (editorData: TimelineRow[]) => void | boolean;
}

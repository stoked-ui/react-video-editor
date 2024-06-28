import {
  PlayArrow,
  PauseOutlined,
  FastRewind,
  FastForward,
  FirstPage,
  LastPage,
} from '@mui/icons-material';
import { TimelineEngine, TimelineState } from '@stoked-ui/timeline';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React, { FC, useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
// import { useControls } from 'react-zoom-pan-pinch';
// const { Option } = Select;
export const Rates = [0.2, 0.5, 1.0, 1.5, 2.0];

export const scaleWidth = 160;
export const startLeft = 20;
export const scale = 5;

const RveTimelineControlsBarRoot = styled('div', {
  name: 'MuiRveTimelineControlsRoot',
})(({ theme }) => {
  const light = theme.palette.mode === 'light';
  const bottomLineColor = light
    ? 'rgba(0, 0, 0, 0.42)'
    : 'rgba(255, 255, 255, 0.7)';
  return {
    borderLeft: `1px solid ${bottomLineColor}`,
    borderRight: `1px solid ${bottomLineColor}`,
    background: light ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.09)',
  };
});

const RveTimelineControlsBar = styled('div', {
  name: 'MuiRveTimelineControlsBar',
})(({ theme }) => {
  const light = theme.palette.mode === 'light';
  const bottomLineColor = light
    ? 'rgba(0, 0, 0, 0.42)'
    : 'rgba(255, 255, 255, 0.7)';
  return {
    borderBottom: `1px solid ${bottomLineColor}`,
    background: light ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.09)',
  };
});

const RveButton = styled(IconButton, {
  name: 'MuiRveButton',
})(() => ({}));

const RveTime = styled('div', {
  name: 'MuiRveTime',
})(() => ({}));

const RveTimelineControls: FC<{
  timelineState: React.RefObject<TimelineState>;
  autoScrollWhenPlay: React.MutableRefObject<boolean>;
  engine: TimelineEngine;
}> = ({ timelineState, autoScrollWhenPlay}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!timelineState.current) {
      return;
    }
    const engine = timelineState.current;
    engine.listener.on('play', () => setIsPlaying(true));
    engine.listener.on('paused', () => setIsPlaying(false));
    engine.listener.on('afterSetTime', ({ time }) => setTime(time));
    engine.listener.on('setTimeByTick', ({ time }) => {
      setTime(time);

      if (autoScrollWhenPlay.current) {
        const autoScrollFrom = 500;
        const left = time * (scaleWidth / scale) + startLeft - autoScrollFrom;
        timelineState.current?.setScrollLeft(left);
      }
    });

    return () => {
      if (!engine) return;
      engine.pause();
      engine.listener.offAll();
      //lottieControl.destroy();
    };
  }, []);

  // 开始或暂停
  const handlePlayOrPause = () => {
    if (!timelineState.current) return;
    if (timelineState.current.isPlaying) {
      timelineState.current.pause();
    } else {
      timelineState.current.play({ autoEnd: true });
    }
  };

  /*const handleRateChange = (rate: number) => {
    if (!timelineState.current) return;
    timelineState.current.setPlayRate(rate);
  };*/

  const timeRender = (time: number) => {
    const float = (parseInt((time % 1) * 100 + '') + '').padStart(2, '0');
    const min = (parseInt(time / 60 + '') + '').padStart(2, '0');
    const second = (parseInt((time % 60) + '') + '').padStart(2, '0');
    return <>{`${min}:${second}.${float.replace('0.', '')}`}</>;
  };

  const handleFirstPage = () => {
    if (!timelineState.current) return;
    if (timelineState.current.isPlaying) {
      timelineState.current.pause();
    }
    timelineState.current.setTime(0);
  };

  const handleLastPage = () => {
    if (!timelineState.current) return;
    if (timelineState.current.isPlaying) {
      timelineState.current.pause();
    }
    //timelineState.current.setTime(timelineState.current.target.s);
  };

  const handleRewind = () => {
    if (!timelineState.current) return;
    if (timelineState.current.isPlaying) {
      timelineState.current.pause();
    }
    timelineState.current.setPlayRate(-1.75);
    timelineState.current.play({ autoEnd: true });
  };

  const handleFastForward = () => {
    if (!timelineState.current) return;
    if (timelineState.current.isPlaying) {
      timelineState.current.pause();
    }
    timelineState.current.setPlayRate(1.75);
    timelineState.current.play({ autoEnd: true });
  };

  return (
    <RveTimelineControlsBarRoot className={'timeline-bar-root'}>
      <RveTimelineControlsBar className={'timeline-bar'}>
        <RveButton className="play-control" onClick={handleFirstPage}>
          <FirstPage />
        </RveButton>
        <RveButton className="play-control" onClick={handleRewind}>
          <FastRewind />
        </RveButton>
        <RveButton className="play-control" onClick={handlePlayOrPause}>
          {isPlaying ? <PauseOutlined /> : <PlayArrow />}
        </RveButton>
        <RveButton className="play-control" onClick={handleFastForward}>
          <FastForward />
        </RveButton>
        <RveButton className="play-control" onClick={handleLastPage}>
          <LastPage />
        </RveButton>
        <RveTime className="time">{timeRender(time)}</RveTime>
      </RveTimelineControlsBar>
      <FormControl className="rate-control" variant="filled">
        <InputLabel id="speed-label">Speed</InputLabel>
        <Select
          size={'small'}
          defaultValue={1}
          variant={'filled'}
          labelId="demo-simple-select-standard-label"
          label="Speed"
        >
          {Rates.map((rate) => (
            <MenuItem key={rate} value={rate}>{`${rate.toFixed(1)}x`}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </RveTimelineControlsBarRoot>
  );
};

export default RveTimelineControls;

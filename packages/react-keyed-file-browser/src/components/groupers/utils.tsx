import {
  startOfToday,
  endOfToday,
  startOfYesterday,
  endOfYesterday,
  startOfWeek,
  endOfWeek,
  addWeeks,
  startOfMonth,
  endOfMonth,
  getMonth,
} from 'date-fns';

interface TimeWindow {
  name: string;
  begins: Date;
  ends: Date;
  items: any[];
}

const relativeTimeWindows = (): TimeWindow[] => {
  const windows: TimeWindow[] = [];
  const now = new Date();

  windows.push({
    name: 'Today',
    begins: startOfToday(),
    ends: endOfToday(),
    items: [],
  });

  windows.push({
    name: 'Yesterday',
    begins: startOfYesterday(),
    ends: endOfYesterday(),
    items: [],
  });

  windows.push({
    name: 'Earlier this Week',
    begins: startOfWeek(now),
    ends: endOfWeek(now),
    items: [],
  });

  windows.push({
    name: 'Last Week',
    begins: startOfWeek(addWeeks(now, -1)),
    ends: endOfWeek(addWeeks(now, -1)),
    items: [],
  });

  const window = windows[windows.length - 1];
  if (window && getMonth(window.begins) === getMonth(now)) {
    windows.push({
      name: 'Earlier this Month',
      begins: startOfMonth(now),
      ends: endOfMonth(now),
      items: [],
    });
  }

  return windows;
};

export { relativeTimeWindows };

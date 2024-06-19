import { format, startOfMonth, endOfMonth } from 'date-fns';
import { relativeTimeWindows } from './utils';
import { isFolder } from '../../utils';
import { KeyedFile } from "../../browser.tsx";

interface TimeWindow {
  name: string;
  begins: Date | number;
  ends: Date | number;
  items: KeyedFile[];
}

// @ts-ignore
export default function GroupByModifiedRelative(files: KeyedFile[], root: string): KeyedFile[] {
  const timeWindows: TimeWindow[] = relativeTimeWindows();

  files.forEach((file) => {
    if (isFolder(file)) {
      return;
    }
    const newFile = new KeyedFile({
      ...file,
      keyDerived: true,
    });

    let allocated = false;
    const fileModified = +(newFile?.modified || 0);
    for (let windex = 0; windex < timeWindows.length; windex++) {
      const timeWindow = timeWindows[windex];
      if (timeWindow && fileModified > +timeWindow.begins && fileModified <= +timeWindow.ends) {
        timeWindow.items.push(newFile);
        allocated = true;
        break;
      }
    }
    if (!allocated) {
      const newWindow: TimeWindow = {
        name: format(fileModified, 'MMMM yyyy'),
        begins: startOfMonth(fileModified),
        ends: endOfMonth(fileModified),
        items: [newFile],
      };
      timeWindows.push(newWindow);
    }
  });

  const groupedFiles= timeWindows
  .filter((timeWindow) => timeWindow.items.length > 0)
  .map((timeWindow) => new KeyedFile({
    key: `${timeWindow.name.toLowerCase().replace(' ', '_')}/`,
    name: timeWindow.name,
    children: timeWindow.items,
    size: 0,
  }));
  return groupedFiles;
};


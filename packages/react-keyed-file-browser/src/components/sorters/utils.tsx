const NUMBER_GROUPS = /(-?\d*\.?\d+)/g;

interface SortableItem {
  name: string;
}

const naturalSortComparer = (a: SortableItem, b: SortableItem): number => {
  const aa = String(a.name).split(NUMBER_GROUPS);
  const bb = String(b.name).split(NUMBER_GROUPS);
  const min = Math.min(aa.length, bb.length);

  for (let i = 0; i < min; i++) {
    if (!aa || !aa[i]) continue;
    if (!bb || !bb[i]) continue;
    const aString = aa[i];
    const bString = bb[i];
    if (aString && bString) {
      const x = parseFloat(aString) || aString.toLowerCase();
      const y = parseFloat(bString) || bString.toLowerCase();
      if (x < y) return -1; else if (x > y) return 1;
    }
  }

  return 0;
};

export { naturalSortComparer };

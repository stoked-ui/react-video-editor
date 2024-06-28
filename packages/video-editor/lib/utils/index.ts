/*

function getResourceDimensions(source: HTMLVideoElement | HTMLImageElement) {
  const vid = source as HTMLVideoElement;
  if (vid?.videoWidth) {
    return { width: vid.videoWidth, height: vid.videoHeight };
  }
  const img = source as HTMLImageElement;
  if (img.naturalWidth) {
    return { width: img.naturalWidth, height: img.naturalHeight };
  }
  if (source.width) {
    return { width: source.width, height: source.height };
  }
  return null;
}

function isRelative(length: string) {
  return length?.match?.(/%$/);
}
/!**
 * Parses the component values of "object-position"
 * Returns the position in px
 *!/
function parsePositionAsPx(str: string, bboxSize: number, objectSize: number) {
  const num = parseFloat(str);
  if (isRelative(str)) {
    const ratio = num / 100;
    return (bboxSize * ratio) - (objectSize * ratio);
  }
  return num;
}

function parseObjectPosition( position: string, bbox: {width: number, height: number}, object: {width: number, height: number}) {
  const [left, top] = position.split(" ");
  return {
    left: parsePositionAsPx(left, bbox.width, object.width),
    top:  parsePositionAsPx(top, bbox.height, object.height)
  };
}

/!**
 * Returns the BBox of the rendered object content
 * relative to the element's box.
 *!/
function getRenderedBox(elem:  HTMLVideoElement | HTMLImageElement): { width?: number, height?: number, top: number, left: number } {
  let {objectFit, objectPosition} = getComputedStyle(elem);
  const bbox = elem.getBoundingClientRect();
  const object: {width: number, height: number } | null = getResourceDimensions(elem);

  if (objectFit === "scale-down") {
    objectFit = (bbox.width < object!.width || bbox.height < object!.height) ? "contain" : "none";
  }
  if (objectFit === "none") {
    const {left, top} = parseObjectPosition(objectPosition, bbox, object);
    return {left, top, ...object}
  }
  if (objectFit === "contain") {
    const objectRatio = object.height / object.width;
    const bboxRatio = bbox.height / bbox.width;
    const width = bboxRatio > objectRatio ? bbox.width : bbox.height / objectRatio;
    const height = bboxRatio > objectRatio ? bbox.width * objectRatio : bbox.height;
    const {left, top} = parseObjectPosition(objectPosition, bbox, {width, height});
    return {left, top, width, height};
  }
  if (objectFit === "fill") {
    // Relative positioning is discarded with `object-fit: fill`,
    // so we need to check here if it's relative or not.
    const [posLeft, posTop] = objectPosition.split(" ");
    const {left, top} = parseObjectPosition(objectPosition, bbox, object);
    return {
      left: isRelative(posLeft) ? 0 : left, top: isRelative(posTop) ? 0 : top, width: bbox.width, height: bbox.height,
    };
  }
  if (objectFit === "cover") {
    const minRatio = Math.min(bbox.width / object.width, bbox.height / object.height);
    let width = object.width * minRatio;
    let height = object.height * minRatio;
    let outRatio = 1;
    if (width < bbox.width) {
      outRatio = bbox.width / width;
    }
    if (Math.abs(outRatio - 1) < 1e-14 && height < bbox.height) {
      outRatio = bbox.height / height;
    }
    width *= outRatio;
    height *= outRatio;

    const {left, top} = parseObjectPosition(objectPosition, bbox, {width, height});
    return {left, top, width, height};
  }
}
*/

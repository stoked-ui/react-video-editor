import { IMarkerFile } from './MarkerFile';
import IVideoWrap from './VideoWrap';
import RveFile, { IRveFile } from './RveFile';
import { IPosterFile } from './PosterFile';

export interface IRveData {
  originals?: IRveFile[];
  finals?: IRveFile[];
  poster?: IPosterFile;
  markers?: IMarkerFile[];
  files?: IRveFile[];
  wraps?: IVideoWrap[];
  title?: string;
  description?: string;
  height?: number;
  width?: number;
  loaded?: boolean;
}

export default class RveData implements IRveData {
  originals?: IRveFile[] = new Array<IRveFile>();
  finals?: IRveFile[] = new Array<IRveFile>();
  poster?: IPosterFile;
  markers?: IMarkerFile[] = new Array<IMarkerFile>();
  files?: IRveFile[] = new Array<RveFile>();
  wraps?: IVideoWrap[] = new Array<IVideoWrap>();
  title?: string = '';
  description?: string;
  height?: number;
  width?: number;
  loaded?: boolean = false;

  constructor(props?: IRveData) {
    if (!props) return;
    this.originals = props.originals || this.originals;
    this.finals = props.finals || this.finals;
    this.poster = props.poster || this.poster;
    this.markers = props.markers || this.markers;
    this.files = props.files || this.files;
    this.wraps = props.wraps || this.wraps;
    this.title = props.title || this.title;
    this.description = props.description || this.description;
    this.height = props.height || this.height;
    this.width = props.width || this.width;
    this.loaded = false;
  }
}

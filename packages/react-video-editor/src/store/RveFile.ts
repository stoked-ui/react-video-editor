import IdGeneratorService from "@services/IdGeneratorService.tsx";
const { newFileId } = IdGeneratorService();

/**
 * @description Base interface for an editor file
 * @interface
 * @property {File | String} src - The src of the file
 */
export interface IRveFile {
  id: string;
  file?: File;
  src?: string;
  name?: string;
  path?: string;
  size?: number;
  type?: string;
  modified?: number;
  buffer?: ArrayBuffer;
  blob?: Blob;
  visible: boolean;
}

/**
 * @description Base interface for an editor file
 * @interface
 * @property {RveFileSource} src - The src of the file
 * @property {String?} name - The filename of the file including extension
 * @property {String?} path - Path of the file if located on disk
 * @property {Number?} size - Size in bytes of the file
 * @property {String?} type - ContentType of the file
 */
export default class RveFile implements IRveFile {
  id: string;
  file?: File;
  src?: string;
  name?: string;
  path?: string;
  size?: number;
  type?: string;
  modified?: number;
  buffer?: ArrayBuffer;
  blob?: Blob;
  visible = false;

  constructor(params: IRveFile) {
    this.id = params.id || newFileId();
    this.file = params.file;
    this.src = params.src;
    this.name = params.name;
    this.path = params.path;
    this.size = params.size;
    this.type = params.type;
    this.modified = params.modified;
    this.buffer = params.buffer;
    this.blob = params.blob;
    this.visible = params.visible;
  }
}
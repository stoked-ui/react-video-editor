import type { IRveFile } from './RveFile';
import RveFile from './RveFile';
import type { IResolution } from './Resolution';

export interface IImageFile extends IRveFile {
  resolution?: IResolution;
}

export class ImageFile extends RveFile implements IImageFile {
  resolution?: IResolution;

  constructor(params: IImageFile) {
    super(params);
    this.resolution = params.resolution;
  }
}

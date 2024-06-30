import { useState, useContext, createContext, type ReactNode } from 'react';
import RveData, { type IRveData } from '../../models/RveData';
import { type IVideoFile, VideoFile } from '../../models/VideoFile';
import PosterFile, { type IPosterFile } from '../../models/PosterFile';
import MarkerFile, { type IMarkerFile } from '../../models/MarkerFile';
import RveFile, { type IRveFile } from '../../models/RveFile';
// import { FfmpegService } from '../../services/Ffmpeg.tsx';
import mime from 'mime';
import IdGenerator from '../../services/IdGenerator.tsx';
import type { FileWithPath } from '@stokedui/media-selector';
import { FfmpegService } from '../../services/Ffmpeg.tsx';
const { newFileId } = IdGenerator();

export type VisibleFile = {
  file?: IRveFile | null;
  index: number;
};

export interface IRveContextType extends IRveData {
  current: (visibleVideo?: VisibleFile | null) => IRveFile | null;
  first: () => IRveFile | null;
  addFiles: (files: FileWithPath[]) => Promise<void>;
  removeFile: (file: IRveFile) => void;
  removeFiles: (files: IRveFile[]) => void;
  updateFile: (file: IRveFile) => void;
  aspectRatio: () => number | undefined;
}

class RveContextType extends RveData {
  visible: VisibleFile | null = null;
  constructor(props?: RveContextType) {
    super(props);
  }
}

const RveContext = createContext<IRveContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useRveContext = (): IRveContextType => {
  const context = useContext(RveContext);
  if (!context) {
    throw new Error('useEditorFiles must be used within an EditorFileProvider');
  }
  return context;
};

interface RveProviderProps {
  children: ReactNode;
}

type AddPromiseFunc = {
  promise: (file: RveFile) => Promise<RveFile>;
  array: RveFile[];
  file: RveFile;
};

/**
 * RveProvider is a React component that provides the context for the Index.
 * It manages the state of the editor data and provides functions to manipulate that data.
 *
 * @component
 * @example
 * <RveProvider>
 *   <ChildComponent />
 * </RveProvider>
 */
export const RveProvider: React.FC<RveProviderProps> = (props: RveProviderProps) => {
  const { ffmpegTools, loaded } = FfmpegService();
  const [editorData, setEditorData] = useState<RveContextType | null>(new RveContextType());

  if (!loaded) {
    return <p>loading ffmpeg</p>;
  }
  /**
   * Returns the first video file in the editor data.
   *
   * @returns {IVideoFile | null} The first video file or null if none exist.
   */
  const first = (): IRveFile | null => {
    if (editorData?.originals?.length) {
      return editorData.originals[0] || null;
    } else if (editorData?.finals?.length) {
      return editorData.finals[0] || null;
    }
    return null;
  };

  /**
   * Removes a file from the editor data.
   *
   * @param {IRveFile} file The file to remove.
   */
  const removeFile = (file: IRveFile): void => {
    //const newData = justData(editorData);
    if (file instanceof VideoFile) {
      if (editorData?.originals) {
        editorData.originals = editorData.originals.filter(f => f !== file);
      }
      if (editorData?.finals) {
        editorData.finals = editorData.finals.filter(f => f !== file);
      }
    } else if (file instanceof PosterFile && editorData?.poster === file) {
      editorData.poster = undefined;
    } else if (file instanceof MarkerFile) {
      if (editorData?.markers) {
        editorData.markers = editorData.markers.filter(f => f !== file);
      }
    } else {
      if (editorData?.files) {
        editorData.files = editorData.files.filter(f => f !== file);
      }
    }
    setEditorData({ visible: null, ...editorData });
  };

  const aspectRatio: () => number | undefined = () => {
    return editorData?.width && editorData?.height ? editorData.width / editorData.height : undefined;
  };
  /**
   * Removes multiple files from the editor data.
   *
   * @param {Array<RveFile>} files The files to remove.
   */
  const removeFiles = (files: Array<RveFile>): void => {
    files.forEach(f => {
      removeFile(f);
    });
  };

  const updateSpecificType = (file: IRveFile): RveContextType | null => {
    const updatedFile = file;
    let index = -1;
    if (file instanceof VideoFile) {
      if (editorData?.originals) {
        index = editorData.originals.findIndex(f => f.id === file.id);
        if (index !== -1) {
          editorData.originals[index] = updatedFile as IVideoFile;
          if (file?.width && file?.height) {
            if (editorData?.width && editorData?.height) {
              if (file.width * file.height > editorData.width * editorData.height) {
                editorData.width = file.width;
                editorData.height = file.height;
              }
            } else {
              editorData.width = file.width;
              editorData.height = file.height;
            }
          }
          return editorData;
        }
      }
      if (editorData?.finals) {
        index = editorData.finals.findIndex(f => f.id === file.id);
        if (index !== -1) {
          editorData.finals[index] = updatedFile as IVideoFile;
          return editorData;
        }
      }
    } else if (file instanceof PosterFile && editorData?.poster?.id === file.id) {
      editorData.poster = updatedFile as IPosterFile;
    } else if (file instanceof MarkerFile) {
      if (editorData?.markers) {
        index = editorData.markers.findIndex(f => f.id === file.id);
        if (index !== -1) {
          editorData.markers[index] = updatedFile as IMarkerFile;
          return editorData;
        }
      }
    } else {
      if (editorData?.files) {
        index = editorData.files.findIndex(f => f.id === file.id);
        if (index !== -1) {
          editorData.files[index] = updatedFile;
          return editorData;
        }
      }
    }
    return editorData;
  };

  /**
   * Updates a file in the editor data.
   *
   * @param {IRveFile} file The file to update.
   */
  const updateFile = (file: IRveFile): void => {
    const newData = updateSpecificType(file);
    setEditorData({ visible: null, ...newData });
  };

  /**
   * Sets the current video file in the editor data.
   *
   * @param {IVideoFile | null} inputVideo The video file to set as current.
   * @returns {IVideoFile | null} The current video file.
   */
  const current = (inputVis: VisibleFile | null = null): IRveFile | null => {
    const videoVis = inputVis;
    if (videoVis && editorData) {
      const curr = videoVis?.file || null;
      if (curr) {
        curr.visible = true;
        updateFile(curr);
      }
      const prev = editorData.visible?.file || null;
      if (prev && curr && prev.id !== curr.id) {
        prev.visible = false;
        updateFile(prev);
      }
      editorData.visible = videoVis;
      setEditorData({ ...editorData });
    }
    return editorData?.visible?.file || null;
  };

  async function initFiles(files: Array<File>, updateFile: (file: IRveFile) => void, posterExists: boolean): Promise<Array<RveFile>> {
    let rveFiles = new Array<RveFile>();
    const rveVideoPromises = new Array<Promise<VideoFile>>();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;
      let type: string | null = file.type;
      if (type === '') {
        type = mime.getType(file.name);
      }
      if (!type || type === '') {
        type = '';
        console.log('could not determine file type: ', file.name);
      }
      const primaryType: string | null = type.substring(0, type.indexOf('/'));
      if (primaryType === 'video') {
        const vidPromise = VideoFile.fromFile(file, (vid: IVideoFile) => {
          updateFile(vid);
        });
        rveVideoPromises.push(vidPromise);
      } else if (primaryType === 'image' && !posterExists) {
        const src = URL.createObjectURL(file);
        const poster = new PosterFile({
          src,
          ...file,
          id: newFileId(),
          visible: false,
        });
        rveFiles.push(poster);
      } else {
        const newFile = new RveFile({
          id: newFileId(),
          file: file,
          src: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
          type: file.type,
          modified: file.lastModified,
          visible: false,
        });
        rveFiles.push(newFile);
      }
    }
    await Promise.all(rveVideoPromises).then(videos => {
      rveFiles = rveFiles.concat(videos);
    });
    return rveFiles;
  }

  /**
   * Adds a file to the editor data.
   *
   * @param {RveFile} file The file to add.
   * @returns {Promise<RveData>} The updated editor data.
   */
  async function addFile(file: RveFile): Promise<RveFile> {
    if (file instanceof VideoFile && file.file && ffmpegTools) {
      const video = file;
      // Generate a screenshot for the video file
      const timestamp = '00:00:01'; // Example timestamp, change as needed
      if (file.name && file.buffer) {
        video.poster = await ffmpegTools.createScreenshot(file, timestamp);
      }
    }
    return file;
  }

  const createPromise = (file: RveFile, newData: RveData): AddPromiseFunc => {
    if (file instanceof VideoFile) {
      if (newData.originals) {
        return { promise: addFile, array: newData.originals, file };
      } else if (newData.finals) {
        return { promise: addFile, array: newData.finals, file };
      }
    } else if (file instanceof MarkerFile && newData.markers) {
      return { promise: addFile, array: newData.markers, file };
    }
    return { promise: addFile, array: newData.files || [], file };
  };

  /**
   * Adds files to the editor data.
   *
   * @param {FileList} files The files to add.
   * @returns {Promise<void>}
   */
  const addFiles = async (files: File[]): Promise<void> => {
    if (!editorData) {
      return;
    }
    const rveFiles = await initFiles(files, updateFile, editorData.poster !== undefined);
    const newData = new RveData();
    const promiseArray = new Array<AddPromiseFunc>();
    for (const f of rveFiles) {
      if (f instanceof PosterFile) {
        newData.poster = f;
      } else {
        promiseArray.push(createPromise(f, newData));
      }
    }
    const results = await Promise.allSettled(promiseArray.map( async (prom) =>  {
      return prom?.promise(prom.file)
    } ));
    results.map((result, index) => {
      if (result.status === 'fulfilled') {
        promiseArray[index]?.array.push(result.value);
      }
    });

    newData.originals = editorData.originals ? newData.originals?.concat(editorData.originals) : newData.originals;
    newData.finals = editorData.finals ? newData.finals?.concat(editorData.finals) : editorData.finals;
    newData.markers = editorData.markers ? newData.markers?.concat(editorData.markers) : editorData.markers;
    newData.files = editorData.files ? newData.files?.concat(editorData.files) : editorData.files;

    setEditorData({ ...editorData, ...newData });
  };

  const outVal = {
    ...editorData,
    current,
    first,
    addFiles,
    removeFile,
    removeFiles,
    updateFile,
    aspectRatio,
  };

  return <RveContext.Provider value={outVal}>{props.children}</RveContext.Provider>;
};

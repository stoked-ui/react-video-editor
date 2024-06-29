import { FileWithPath, toFileWithPath } from './file';

const FILES_TO_IGNORE = [
  // Thumbnail cache files for macOS and Windows
  '.DS_Store', // macOs
  'Thumbs.db', // Windows
];

/**
 * Convert a DragEvent's DataTrasfer object to a list of File objects
 * NOTE: If some of the items are folders,
 * everything will be flattened and placed in the same list but the paths will be kept as a {path} property.
 *
 * EXPERIMENTAL: A list of https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle objects can also be passed as an arg
 * and a list of File objects will be returned.
 *
 * @param evt
 */
export async function fromEvent(evt: Event | any): Promise<{ data: (FileWithPath | DataTransferItem)[]; type: string }> {
  if (isObject<DragEvent>(evt) && isDataTransfer(evt.dataTransfer)) {
    const data = await getDataTransferFiles(evt.dataTransfer, evt.type);
    return { data, type: 'dataTransfer' };
  } else if (isChangeEvt(evt)) {
    const data = await getInputFiles(evt);
    return { data, type: 'changeEvent' };
  } else if (Array.isArray(evt) && evt.every(item => 'getFile' in item && typeof item.getFile === 'function')) {
    const data = await getFsHandleFiles(evt);
    return { data, type: 'fileHandles' };
  } else if (isDropzoneEvt(evt)) {
    return getDropzoneFiles(evt);
  }

  // TODO: handle s3 urls.. create signed url and fetch the file

  return { data: [], type: 'invalid' };
}

function isDropzoneEvt(value: any) {
  return value && value?.source && value.source?.items && value.source?.types.includes('Files') && value.self?.dropEffect !== null;
}

async function getDropzoneFiles(event: any) {
  const items = fromList<DataTransferItem>(event.source.items).filter(item => item.kind === 'file');
  const files = await Promise.all(items.map(toFilePromises));
  return { data: noIgnoredFiles(flatten<FileWithPath>(files)), type: event.self.dropEffect };
  //  return noIgnoredFiles(fromList<FileWithPath>(dt.files).map(file => toFileWithPath(file)));
}

/**
 * Checks whether the given value is of type DataTransfer.
 * @param {any} value - The value to be checked.
 * @return {boolean} - True if the value is of type DataTransfer, false otherwise.
 */
function isDataTransfer(value: any): value is DataTransfer {
  return isObject(value);
}

/**
 * Checks if the given value is an event change event.
 *
 * @param {any} value - The value to check if it is a change event.
 *
 * @return {boolean} - Returns true if the value is a change event, otherwise returns false.
 */
function isChangeEvt(value: any): value is Event {
  return isObject<Event>(value) && isObject(value.target);
}

/**
 * Checks if a given value is an object.
 *
 * @param {any} v - The value to be checked.
 * @returns {boolean} - True if the given value is an object, false otherwise.
 */
function isObject<T>(v: any): v is T {
  return typeof v === 'object' && v !== null;
}

/**
 * Retrieves the input files from the specified event.
 *
 * @param {Event} evt - The event containing the input files.
 * @returns {Array<FileWithPath>} - An array of files with their path information.
 */
function getInputFiles(evt: Event) {
  return fromList<FileWithPath>((evt.target as HTMLInputElement).files).map(file => toFileWithPath(file));
}

// Ee expect each handle to be https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle
/**
 * Retrieves the files associated with the provided handles from the file system.
 *
 * @param {any[]} handles - An array of file handles.
 * @return {Promise<File[]>} - A promise that resolves to an array of File objects representing the retrieved files.
 */
async function getFsHandleFiles(handles: any[]) {
  const files = await Promise.all(handles.map(h => h.getFile()));
  return files.map(file => toFileWithPath(file));
}

/**
 * Retrieves a list of files from the given DataTransfer object
 *
 * @param {DataTransfer} dt - The DataTransfer object from which to retrieve files
 * @param {string} type - The type of drag event ('dragstart', 'drop', etc.)
 * @returns {Promise<FileWithPath[]>} - A promise that resolves to an array of FileWithPath objects that represent the transferred files
 */
async function getDataTransferFiles(dt: DataTransfer, type: string) {
  // IE11 does not support dataTransfer.items
  // See https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/items#Browser_compatibility
  if (dt.items) {
    const items = fromList<DataTransferItem>(dt.items).filter(item => item.kind === 'file');
    // According to https://html.spec.whatwg.org/multipage/dnd.html#dndevents,
    // only 'dragstart' and 'drop' has access to the data (source node)
    if (type !== 'drop') {
      return items;
    }
    const files = await Promise.all(items.map(toFilePromises));
    return noIgnoredFiles(flatten<FileWithPath>(files));
  }

  return noIgnoredFiles(fromList<FileWithPath>(dt.files).map(file => toFileWithPath(file)));
}

/**
 * Filters out files that are in the list of ignored files.
 *
 * @param {Array<Object>} files - The array of files to filter.
 * @return {Array<Object>} - The filtered array of files.
 */
function noIgnoredFiles(files: FileWithPath[]) {
  return files.filter(file => FILES_TO_IGNORE.indexOf(file.name) === -1);
}

// IE11 does not support Array.from()
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#Browser_compatibility
// https://developer.mozilla.org/en-US/docs/Web/API/FileList
// https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItemList
/**
 * Creates an array from the given list of items.
 *
 * @param {DataTransferItemList | FileList | null} items - The list of items to create the array from.
 * @return {T[]} - The array created from the given list of items.
 */
export function fromList<T>(items: DataTransferItemList | FileList | null): T[] {
  if (items === null) {
    return [];
  }

  const files = [];

  // tslint:disable: prefer-for-of
  for (let i = 0; i < items.length; i++) {
    const file = items[i];
    files.push(file);
  }

  return files as any;
}

// https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem
/**
 * Converts a DataTransfer item to a promise that resolves to a File or DirectoryEntry object.
 *
 * @param {DataTransferItem} item - The DataTransferItem to convert.
 * @return {Promise<File|DirectoryEntry>} - A promise that resolves to a File or DirectoryEntry object.
 */
function toFilePromises(item: DataTransferItem) {
  if (typeof item.webkitGetAsEntry !== 'function') {
    return fromDataTransferItem(item);
  }

  const entry = item.webkitGetAsEntry();

  // Safari supports dropping an image node from a different window and can be retrieved using
  // the DataTransferItem.getAsFile() API
  // NOTE: FileSystemEntry.file() throws if trying to get the file
  if (entry && entry.isDirectory) {
    return fromDirEntry(entry) as any;
  }

  return fromDataTransferItem(item);
}

/**
 * Flattens a nested array of items into a single-level array.
 *
 * @param {any[]} items - The array to flatten.
 * @return {T[]} The flattened array.
 */
function flatten<T>(items: any[]): T[] {
  return items.reduce((acc, files) => [...acc, ...(Array.isArray(files) ? flatten(files) : [files])], []);
}

/**
 * Converts a DataTransferItem to a FileWithPath object.
 *
 * @param {DataTransferItem} item - The DataTransferItem to convert.
 * @return {Promise<FileWithPath>} - A promise that resolves to a FileWithPath object.
 * @throws {Error} - Throws an error if the item is not a File.
 */
function fromDataTransferItem(item: DataTransferItem) {
  const file = item.getAsFile();
  if (!file) {
    return Promise.reject(`${item} is not a File`);
  }
  const fwp = toFileWithPath(file);
  return Promise.resolve(fwp);
}

// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemEntry
/**
 * Converts the given entry into either a directory or file entry.
 * If the entry is a directory, it calls the fromDirEntry method.
 * If the entry is a file, it calls the fromFileEntry method.
 *
 * @param {any} entry - The entry to be converted into a directory or file entry.
 * @return {Promise<any>} - A promise that returns the converted directory or file entry.
 */
async function fromEntry(entry: any) {
  return entry.isDirectory ? fromDirEntry(entry) : fromFileEntry(entry);
}

// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryEntry
/**
 * Converts a directory entry into an array of files and directories.
 *
 * @param {any} entry - The directory entry to convert.
 * @return {Promise<FileArray[]>} A promise that resolves with an array of files and directories.
 * @throws {any} - If an error occurs while reading directory.
 */
function fromDirEntry(entry: any) {
  const reader = entry.createReader();

  return new Promise<FileArray[]>((resolve, reject) => {
    const entries: Promise<FileValue[]>[] = [];

    function readEntries() {
      // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryEntry/createReader
      // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryReader/readEntries
      reader.readEntries(
        async (batch: any[]) => {
          if (!batch.length) {
            // Done reading directory
            try {
              const files = await Promise.all(entries);
              resolve(files);
            } catch (err) {
              reject(err);
            }
          } else {
            const items = Promise.all(batch.map(fromEntry));
            entries.push(items);

            // Continue reading
            readEntries();
          }
        },
        (err: any) => {
          reject(err);
        }
      );
    }

    readEntries();
  });
}

// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileEntry
/**
 * Converts a file entry to a FileWithPath object.
 *
 * @async
 * @param {any} entry - The file entry to convert.
 * @return {Promise<FileWithPath>} - A promise resolving to the converted FileWithPath object.
 * @throws {any} - An error object if the file conversion fails.
 */
async function fromFileEntry(entry: any) {
  return new Promise<FileWithPath>((resolve, reject) => {
    entry.file(
      (file: FileWithPath) => {
        const fwp = toFileWithPath(file, entry.fullPath);
        resolve(fwp);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

// Infinite type recursion
// https://github.com/Microsoft/TypeScript/issues/3496#issuecomment-128553540
/**
 * Represents an array of FileValues.
 * @interface
 * @extends Array<FileValue>
 */
interface FileArray extends Array<FileValue> {}
/**
 * Represents a value that can be either a single file with its path or an array of file arrays.
 * @typedef {FileWithPath | FileArray[]} FileValue
 */
type FileValue = FileWithPath | FileArray[];

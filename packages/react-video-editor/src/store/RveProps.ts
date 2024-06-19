import { PlyrProps, PlyrSource, PlyrOptions } from 'plyr-react';
import { IVideoFile, VideoFile } from './VideoFile';

const defaultOptions = {
  /**
   * Completely disable Index. This would allow you to do a User Agent check or similar to programmatically enable or disable Plyr for a certain UA. Example below.
   */
  enabled: true,

  /**
   * Display debugging information in the console
   */
  debug: true,

  /**
   * If a function is passed, it is assumed your method will return either an element or HTML string for the controls. Three arguments will be passed to your function;
   * id (the unique id for the player), seektime (the seektime step in seconds), and title (the media title). See CONTROLS.md for more info on how the html needs to be structured.
   * Defaults to ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen']
   */
  controls: [
    'play-large',
    'download',
    'play',
    'progress',
    'current-time',
    'mute',
    'volume',
    'captions',
    'settings',
    'pip',
    'airplay',
    'fullscreen',
  ],

  /**
   * If you're using the default controls are used then you can specify which settings to show in the menu
   * Defaults to ['captions', 'quality', 'speed', 'loop']
   */
  settings: ['captions', 'quality', 'speed', 'loop'],

  /**
   * Used for internationalization (i18n) of the text within the UI.
   i18n?: any;
   */

  /**
   * Load the SVG sprite specified as the iconUrl option (if a URL). If false, it is assumed you are handling sprite loading yourself.
   loadSprite?: boolean;
   */

  /**
   * Specify a URL or path to the SVG sprite. See the SVG section for more info.
   iconUrl?: string;
   */

  /**
   * Specify the id prefix for the icons used in the default controls (e.g. rve-play would be plyr).
   * This is to prevent clashes if you're using your own SVG sprite but with the default controls.
   * Most people can ignore this option.
   iconPrefix?: string;
   */

  /**
   * Specify a URL or path to a blank video file used to properly cancel network requests.
   */
  blankVideo: '/assets/plyr/blank.mp4',

  /**
   * Autoplay the media on load. This is generally advised against on UX grounds. It is also disabled by default in some browsers.
   * If the autoplay attribute is present on a <video> or <audio> element, this will be automatically set to true.
   */

  /**
   * Only allow one player playing at once.
   */
  autopause: true,

  /**
   * Click (or tap) of the video container will toggle play/pause.
   */
  clickToPlay: true,

  /**
   * Disable right click menu on video to help as very primitive obfuscation to prevent downloads of content.
   */
  disableContextMenu: false,

  /**
   * Hide video controls automatically after 2s of no mouse or focus movement, on control element blur (tab out), on playback start or entering fullscreen.
   * As soon as the mouse is moved, a control element is focused or playback is paused, the controls reappear instantly.
   */
  hideControls: true,

  /**
   * Reset the playback to the start once playback is complete.
   */
  resetOnEnd: true,

  /**
   * Enable keyboard shortcuts for focused players only or globally
   */
  keyboard: {
    focused: true,
    global: true,
  },

  /**
   * controls: Display control labels as tooltips on :hover & :focus (by default, the labels are screen reader only).
   * seek: Display a seek tooltip to indicate on click where the media would seek to.
   */
  tooltips: {
    controls: true,
    seek: true,
  },

  /**
   * enabled: Allow use of local storage to store user settings. key: The key name to use.
   */
  storage: {
    enabled: true,
    key: 'user-settings-plyr',
  },
};

export default class RveReactProps implements PlyrProps {
  source: PlyrSource | null = null;
  options?: PlyrOptions | null = defaultOptions;

  constructor(sourceParams?: PlyrSource | VideoFile, options?: PlyrOptions) {
    if (sourceParams instanceof VideoFile) {
      this.setPlyrSource(sourceParams);
    } else {
      this.source = sourceParams ?? null;
    }
    this.setPlyrOptions(options);
  }

  setPlyrSource(videoProps: IVideoFile): void {
    this.source = { type: 'video', sources: [], poster: undefined };
    if (videoProps.src) {
      const sourceInfo: Plyr.Source = {
        src: videoProps.src,
        provider: 'html5',
      };
      if (videoProps.type) {
        sourceInfo.type = videoProps.type;
      }
      this.source?.sources.push(sourceInfo);
    }
    this.source.poster = videoProps.poster;
  }

  setPlyrOptions(options?: PlyrOptions): void {
    if (options === undefined) return;
    this.options = options;
  }
}

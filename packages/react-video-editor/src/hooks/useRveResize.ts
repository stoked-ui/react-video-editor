export default function useRveResize() {
  const screenShotEditorResize = () => {
    const screenshotEditor = document.querySelector('.rve-screenshot-editor');
    if (screenshotEditor === null) return;
    const vid = document.querySelector('.plyr');
    if (!vid) return;
    console.log(`plyr ${vid.clientWidth} x ${vid.clientHeight}`);
    screenshotEditor.setAttribute(
      'style',
      `width: ${vid.clientWidth * 0.33}px; height: ${vid.clientHeight * 0.33}px; `
    );
  };

  if (!window.screenShotEditorResize) {
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.id = 'screenshotSize';
    s.innerHTML = `
      addEventListener('resize', () => {
        window.screenShotEditorResize();
      });
    `;
    document.body.appendChild(s);
    window.screenShotEditorResize = screenShotEditorResize;
  }

  return { screenShotEditorResize };
}

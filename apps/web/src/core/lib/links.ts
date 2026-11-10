// External links surfaced in Settings/Profile. Hosted on GitHub Pages from the repo's
// /docs folder (enable: GitHub repo → Settings → Pages → Source: main, /docs).
export const LINKS = {
  privacy: 'https://kutluhangil.github.io/SubSenseMobileApp/privacy.html',
  help: 'https://kutluhangil.github.io/SubSenseMobileApp/help.html',
  community: 'https://kutluhangil.github.io/SubSenseMobileApp/',
};

/** Open a URL in the system browser (Safari View Controller on iOS via WKWebView). */
export function openExternal(url: string): void {
  try {
    window.open(url, '_blank', 'noopener,noreferrer');
  } catch {
    /* no-op */
  }
}

/** Share the app via the native share sheet, with a clipboard fallback. */
export async function shareApp(text: string, url = 'https://kutluhangil.github.io/SubSenseMobileApp/'): Promise<void> {
  if (typeof navigator === 'undefined') return;
  const nav = navigator;
  try {
    if (typeof nav.share === 'function') {
      await nav.share({ title: 'SubSense', text, url });
      return;
    }
    if (nav.clipboard?.writeText) {
      await nav.clipboard.writeText(url);
    }
  } catch {
    /* user cancelled or unsupported */
  }
}

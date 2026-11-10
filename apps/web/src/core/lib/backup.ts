// JSON backup export/import for the local-only data store. There is no cloud, so
// this is the user's only way to move data between devices or survive a reinstall.
import type { Subscription, AppSettings } from '../types';

const BACKUP_APP = 'subsense';
const BACKUP_SCHEMA = 2; // mirrors the persisted store version in store/app.ts

export interface BackupFile {
  app: string;
  schema: number;
  exportedAt: string;
  subscriptions: Subscription[];
  settings: AppSettings;
}

export interface ParsedBackup {
  subscriptions: Subscription[];
  settings?: Partial<AppSettings>;
}

export function buildBackup(subscriptions: Subscription[], settings: AppSettings): string {
  const payload: BackupFile = {
    app: BACKUP_APP,
    schema: BACKUP_SCHEMA,
    exportedAt: new Date().toISOString(),
    subscriptions,
    settings,
  };
  return JSON.stringify(payload, null, 2);
}

function defaultFilename(): string {
  return `subsense-backup-${new Date().toISOString().slice(0, 10)}.json`;
}

/**
 * Save/share the backup JSON. Tries the native share sheet with a file attachment
 * (best on mobile — lets the user save to Files/Drive), then falls back to a
 * browser download, then the clipboard.
 */
export async function exportBackup(json: string): Promise<void> {
  const filename = defaultFilename();

  // Native share sheet with a file (iOS/Android WebView, modern browsers).
  try {
    const file = new File([json], filename, { type: 'application/json' });
    const navAny = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function' &&
      navAny.canShare?.({ files: [file] })
    ) {
      await navigator.share({ files: [file], title: filename });
      return;
    }
  } catch {
    /* user cancelled or unsupported — fall through to download */
  }

  // Browser download.
  try {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return;
  } catch {
    /* fall through to clipboard */
  }

  // Last resort.
  try {
    await navigator.clipboard?.writeText(json);
  } catch {
    /* give up silently */
  }
}

/**
 * Validate + normalize an imported backup. Throws on anything that isn't a
 * SubSense backup carrying a subscriptions array.
 */
export function parseBackup(text: string): ParsedBackup {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('invalid-json');
  }
  if (!raw || typeof raw !== 'object') throw new Error('invalid-format');
  const obj = raw as Record<string, unknown>;
  if (obj.app !== BACKUP_APP) throw new Error('not-subsense');
  if (!Array.isArray(obj.subscriptions)) throw new Error('no-subscriptions');

  // Keep only entries with the minimum fields the app reads.
  const subscriptions = obj.subscriptions.filter(
    (s): s is Subscription =>
      !!s &&
      typeof s === 'object' &&
      typeof (s as Subscription).id === 'string' &&
      typeof (s as Subscription).name === 'string',
  );

  const settings =
    obj.settings && typeof obj.settings === 'object'
      ? (obj.settings as Partial<AppSettings>)
      : undefined;

  return { subscriptions, settings };
}

/**
 * Open the system file picker and resolve with the chosen file's text, or null
 * if the user cancels / the read fails.
 */
export function pickBackupFile(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsText(file);
    };
    // Some WebViews need the input attached for the dialog to open.
    input.style.display = 'none';
    document.body.appendChild(input);
    input.click();
    setTimeout(() => input.remove(), 60_000);
  });
}

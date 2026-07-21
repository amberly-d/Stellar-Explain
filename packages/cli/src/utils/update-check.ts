let notice: string | null = null;

function parseVersion(v: string): number[] {
  return v.replace(/^v/, '').split('.').map(Number);
}

function isNewer(latest: string, current: string): boolean {
  const l = parseVersion(latest);
  const c = parseVersion(current);
  for (let i = 0; i < Math.max(l.length, c.length); i++) {
    const lv = l[i] ?? 0;
    const cv = c[i] ?? 0;
    if (lv > cv) return true;
    if (lv < cv) return false;
  }
  return false;
}

export async function checkForUpdate(currentVersion: string): Promise<void> {
  try {
    const res = await fetch('https://registry.npmjs.org/@stellar-explain/cli/latest');
    if (!res.ok) return;
    const pkg = await res.json() as { version: string };
    if (isNewer(pkg.version, currentVersion)) {
      notice = `Update available: ${currentVersion} → ${pkg.version}`;
    }
  } catch {
    // silently ignore network errors
  }
}

export function getUpdateNotice(): string | null {
  return notice;
}

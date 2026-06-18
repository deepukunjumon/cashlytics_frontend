import { useEffect, useState } from 'react';
import { getPublicSettings } from '@/api/settings';

export function Footer() {
  const [version, setVersion]   = useState('');
  const [appName, setAppName]   = useState('Finance Tracker');
  const [footerText, setFooterText] = useState('');

  useEffect(() => {
    void getPublicSettings().then((s) => {
      setVersion(s.app_version ?? '');
      setAppName(s.app_name   ?? 'Finance Tracker');
      setFooterText(s.footer_text ?? '');
    }).catch(() => {});
  }, []);

  return (
    <footer className="border-t bg-background/60 backdrop-blur-sm text-muted-foreground text-xs px-6 py-3 flex items-center justify-between gap-4 shrink-0">
      <span>
        &copy; {new Date().getFullYear()} {appName}
        {footerText && <> &mdash; {footerText}</>}
      </span>
      {version && <span className="font-mono">v{version}</span>}
    </footer>
  );
}

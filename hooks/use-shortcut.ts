import { useEffect } from 'react';

// Fires callback on Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
// Skips when an input, textarea or contenteditable element is focused
export function useShortcut(callback: () => void, disabled = false) {
  useEffect(() => {
    if (disabled) return;

    const handler = (e: KeyboardEvent) => {
      if (!((e.metaKey || e.ctrlKey) && e.key === 'Enter')) return;
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) return;
      e.preventDefault();
      callback();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [callback, disabled]);
}

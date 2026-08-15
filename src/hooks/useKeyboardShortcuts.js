import { useEffect } from 'react';

export function useKeyboardShortcuts({
  onCopy,
  onRefresh,
  onNew,
  onCustomize,
  onQr,
  onSearch,
  onEscape
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        if (e.key === 'Escape' && onEscape) {
          onEscape();
        }
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      const key = e.key.toLowerCase();

      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
      } else if (key === 'c' && onCopy) {
        e.preventDefault();
        onCopy();
      } else if (key === 'u' && onCustomize) {
        e.preventDefault();
        onCustomize();
      } else if (key === 'q' && onQr) {
        e.preventDefault();
        onQr();
      } else if (key === 'n' && onNew) {
        e.preventDefault();
        onNew();
      } else if (key === 'r' && onRefresh) {
        e.preventDefault();
        onRefresh();
      } else if (key === '/' && onSearch) {
        e.preventDefault();
        onSearch();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCopy, onRefresh, onNew, onCustomize, onQr, onSearch, onEscape]);
}

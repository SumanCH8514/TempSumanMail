import { useEffect } from 'react';

export function useKeyboardShortcuts({ onCopy, onRefresh, onNew, onEscape }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        if (e.key === 'Escape' && onEscape) {
          onEscape();
        }
        return;
      }

      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
      } else if ((e.key === 'c' || e.key === 'C') && !e.metaKey && !e.ctrlKey && onCopy) {
        e.preventDefault();
        onCopy();
      } else if ((e.key === 'r' || e.key === 'R') && !e.metaKey && !e.ctrlKey && onRefresh) {
        e.preventDefault();
        onRefresh();
      } else if ((e.key === 'n' || e.key === 'N') && !e.metaKey && !e.ctrlKey && onNew) {
        e.preventDefault();
        onNew();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCopy, onRefresh, onNew, onEscape]);
}

import { useState, useCallback } from 'react';

export function useBrowserHistory(initialUrl: string) {
  const [history, setHistory] = useState<string[]>([initialUrl]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentUrl = history[currentIndex];

  const navigate = useCallback((url: string) => {
    setHistory((prev) => [...prev.slice(0, currentIndex + 1), url]);
    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex]);

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const goForward = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, history.length]);

  const refresh = useCallback(() => {
    setHistory((prev) => [...prev]);
  }, []);

  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < history.length - 1;

  return {
    currentUrl,
    navigate,
    goBack,
    goForward,
    refresh,
    canGoBack,
    canGoForward
  };
}

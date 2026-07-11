import { useEffect, useState } from 'react';

export function useDelayedLoadingMessage(
  active: boolean,
  message = 'Waking your BetterMe coach...',
  delayMs = 3_500,
): string | null {
  const [visibleMessage, setVisibleMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!active) {
      setVisibleMessage(null);
      return;
    }

    const timeout = setTimeout(() => setVisibleMessage(message), delayMs);
    return () => clearTimeout(timeout);
  }, [active, delayMs, message]);

  return visibleMessage;
}

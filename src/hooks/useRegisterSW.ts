import { useEffect, useState } from 'react';

interface UpdateServiceWorkerReturn {
  needRefresh: boolean;
  updateServiceWorker: () => Promise<void>;
  offlineReady: boolean;
}

export function useRegisterSW(): UpdateServiceWorkerReturn {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    let updateInterval: NodeJS.Timeout | null = null;

    import('workbox-window').then(({ Workbox }) => {
      const wb = new Workbox('/sw.js', { type: 'module' });

      wb.addEventListener('waiting', () => {
        setNeedRefresh(true);
      });

      wb.addEventListener('controlling', () => {
        window.location.reload();
      });

      wb.addEventListener('activated', () => {
        setOfflineReady(true);
      });

      wb.register().then(() => {
        // Check for updates immediately
        wb.update();

        // In development, check for updates more frequently (every 30 seconds)
        // In production, check every hour
        const updateIntervalMs =
          import.meta.env.MODE === 'development' ? 30 * 1000 : 60 * 60 * 1000;

        updateInterval = setInterval(() => {
          wb.update();
        }, updateIntervalMs);
      });
    });

    return () => {
      if (updateInterval) {
        clearInterval(updateInterval);
      }
    };
  }, []);

  const updateServiceWorker = async (): Promise<void> => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        setNeedRefresh(false);
        window.location.reload();
      }
    }
  };

  return {
    needRefresh,
    updateServiceWorker,
    offlineReady,
  };
}

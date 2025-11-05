import { useCallback, useEffect, useRef, useState } from 'react';

import { UPDATE_INTERVAL } from '@/config';
import { determineLocation } from '@/lib/location';

import { Status } from '@/types';

interface Coordinates {
  lat: number;
  lon: number;
}

export function useLocation() {
  const [status, setStatus] = useState<Status>('pending');
  const [error, setError] = useState<string>('');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCheckingPermission, setIsCheckingPermission] = useState<boolean>(true);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Debounced loading state - only show loading if location hasn't been retrieved within 1 second
  const setLoadingDebounced = useCallback((): void => {
    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    // Set loading state after 1 second delay
    loadingTimeoutRef.current = setTimeout(() => {
      setStatus('loading');
      setIsCheckingPermission(false); // Stop hiding pending state when loading shows
    }, 1000);
  }, []);

  const clearLoadingDebounce = useCallback((): void => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  }, []);

  // Debounced pending state - hide "East or West?" and button for 1 second when permission is already granted
  const setPendingDebounced = useCallback((): void => {
    // Clear any existing timeout
    if (pendingTimeoutRef.current) {
      clearTimeout(pendingTimeoutRef.current);
    }
    // Set pending state after 1 second delay only if we haven't gotten location yet
    pendingTimeoutRef.current = setTimeout(() => {
      // Only set to pending if we still don't have a location result
      if (hasPermission === false || hasPermission === null) {
        setStatus('pending');
      }
    }, 1000);
  }, [hasPermission]);

  const clearPendingDebounce = useCallback((): void => {
    if (pendingTimeoutRef.current) {
      clearTimeout(pendingTimeoutRef.current);
      pendingTimeoutRef.current = null;
    }
  }, []);

  const updateLocation = useCallback((): void => {
    if (!navigator.geolocation) {
      setStatus('error');
      setError('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Successfully got location, permission is granted
        clearLoadingDebounce(); // Clear debounce since we got the location
        clearPendingDebounce(); // Clear pending debounce since we got the location
        setIsCheckingPermission(false); // Stop hiding pending state since we have a result
        setHasPermission(true);
        const { latitude, longitude } = position.coords;
        const location = determineLocation(latitude, longitude);
        setStatus(location.status);
        setDistrict(location.district);
        setError('');
        setCoordinates({ lat: latitude, lon: longitude });
      },
      (err) => {
        clearLoadingDebounce(); // Clear debounce on error
        clearPendingDebounce(); // Clear pending debounce on error
        if (err.code === 1) {
          // Permission denied
          setHasPermission(false);
          setStatus('error');
          setError('Geolocation permission denied');
        } else {
          setStatus('error');
          setError(err.message);
        }
        setCoordinates(null);
        setDistrict(null);
      },
      {
        enableHighAccuracy: false, // Use false to save battery
        timeout: 10000,
        maximumAge: UPDATE_INTERVAL, // Allow cached positions up to UPDATE_INTERVAL old
      }
    );
  }, [clearLoadingDebounce, clearPendingDebounce]);

  const requestPermission = (): void => {
    if (!navigator.geolocation) {
      setStatus('error');
      setError('Geolocation not supported');
      return;
    }

    setStatus('loading');
    updateLocation();
  };

  // Check geolocation permission status on mount
  useEffect(() => {
    const checkPermission = async (): Promise<void> => {
      if (!navigator.geolocation) {
        setStatus('error');
        setError('Geolocation not supported');
        setHasPermission(false);
        setIsCheckingPermission(false);
        return;
      }

      // Check permission status using Permissions API
      if ('permissions' in navigator) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });

          if (permissionStatus.state === 'granted') {
            // Permission already granted - keep isCheckingPermission true to hide pending state
            // until we get a result or show loading (after debounce)
            clearPendingDebounce(); // Clear any pending debounce
            setHasPermission(true);
            setLoadingDebounced(); // Use debounced loading to avoid flash
            updateLocation();
          } else if (permissionStatus.state === 'denied') {
            setHasPermission(false);
            setStatus('error');
            setError('Geolocation permission denied');
            setIsCheckingPermission(false);
          } else {
            // 'prompt' state - permission not yet requested
            setHasPermission(false);
            setIsCheckingPermission(false);
          }

          // Listen for permission changes
          permissionStatus.onchange = () => {
            if (permissionStatus.state === 'granted') {
              // Permission granted - keep isCheckingPermission true to hide pending state
              // until we get a result or show loading (after debounce)
              clearPendingDebounce(); // Clear any pending debounce
              setHasPermission(true);
              setLoadingDebounced(); // Use debounced loading to avoid flash
              updateLocation();
            } else if (permissionStatus.state === 'denied') {
              setHasPermission(false);
              setStatus('error');
              setError('Geolocation permission denied');
            }
          };
        } catch {
          // Permissions API not supported, try to get location directly
          // This will trigger the browser prompt if needed
          setHasPermission(null);
          setIsCheckingPermission(false);
        }
      } else {
        // Permissions API not available, permission check will happen when requesting
        setHasPermission(null);
        setIsCheckingPermission(false);
      }
    };

    checkPermission();
  }, [updateLocation, setLoadingDebounced, setPendingDebounced, clearPendingDebounce]);

  useEffect(() => {
    if (hasPermission !== true) {
      return;
    }

    if (!navigator.geolocation) {
      return;
    }

    // Use watchPosition for continuous updates instead of setInterval
    // This is more mobile-friendly and less likely to trigger permission prompts
    // watchPosition will fire immediately with the current position, then on subsequent changes
    const geoOptions = {
      enableHighAccuracy: false, // Use false to save battery
      timeout: 10000,
      maximumAge: UPDATE_INTERVAL, // Allow cached positions up to UPDATE_INTERVAL old
    };

    // Start watching position changes (will also get initial position)
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        // Successfully got location update
        clearLoadingDebounce(); // Clear debounce since we got the location
        clearPendingDebounce(); // Clear pending debounce since we got the location
        setIsCheckingPermission(false); // Stop hiding pending state since we have a result
        setHasPermission(true);
        const { latitude, longitude } = position.coords;
        const location = determineLocation(latitude, longitude);
        setStatus(location.status);
        setDistrict(location.district);
        setError('');
        setCoordinates({ lat: latitude, lon: longitude });
      },
      (err) => {
        clearLoadingDebounce(); // Clear debounce on error
        clearPendingDebounce(); // Clear pending debounce on error
        if (err.code === 1) {
          // Permission denied
          setHasPermission(false);
          setStatus('error');
          setError('Geolocation permission denied');
        } else {
          setStatus('error');
          setError(err.message);
        }
        setCoordinates(null);
        setDistrict(null);
      },
      geoOptions
    );

    return () => {
      // Clean up watchPosition
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      clearLoadingDebounce(); // Clean up timeout on unmount
      clearPendingDebounce(); // Clean up pending timeout on unmount
    };
  }, [hasPermission, clearLoadingDebounce, clearPendingDebounce]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      clearLoadingDebounce();
      clearPendingDebounce();
    };
  }, [clearLoadingDebounce, clearPendingDebounce]);

  return { status, error, coordinates, district, requestPermission, isCheckingPermission };
}

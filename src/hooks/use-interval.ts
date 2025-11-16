
"use client";

import { useEffect, useRef } from 'react';

/**
 * A custom React hook that sets up an interval to call a function repeatedly.
 * It's smarter than a plain `setInterval` inside `useEffect` because it handles
 * changes to the callback function without resetting the interval.
 * @param callback The function to be called at each interval.
 * @param delay The interval delay in milliseconds. Can be `null` to pause the interval.
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

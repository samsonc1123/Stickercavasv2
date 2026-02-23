import { useRef, useCallback } from 'react';
import { useLocation } from 'wouter';

interface UseSecretTripleTapOptions {
  targetPath: string;
  tapWindow?: number;
  requiredTaps?: number;
}

export function useSecretTripleTap({
  targetPath,
  tapWindow = 800,
  requiredTaps = 3,
}: UseSecretTripleTapOptions) {
  const [, setLocation] = useLocation();
  const tapTimestamps = useRef<number[]>([]);

  const handleTap = useCallback(() => {
    const now = Date.now();
    
    tapTimestamps.current = tapTimestamps.current.filter(
      (timestamp) => now - timestamp < tapWindow
    );
    
    tapTimestamps.current.push(now);
    
    if (tapTimestamps.current.length >= requiredTaps) {
      tapTimestamps.current = [];
      setLocation(targetPath);
    }
  }, [targetPath, tapWindow, requiredTaps, setLocation]);

  const tripleTapProps = {
    onClick: handleTap,
  };

  return { tripleTapProps, handleTap };
}

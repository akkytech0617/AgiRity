import { Button } from '@heroui/react/button';
import { Spinner } from '@heroui/react/spinner';
import { Check, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface LaunchButtonProps {
  onLaunch: () => void;
  isLaunching: boolean;
  disabled?: boolean;
}

const COMPLETED_DISPLAY_MS = 2000;

export function LaunchButton({ onLaunch, isLaunching, disabled }: Readonly<LaunchButtonProps>) {
  const [isCompleted, setIsCompleted] = useState(false);
  const wasLaunching = useRef(isLaunching);

  // Only the isLaunching true -> false transition starts the completed display; the timer
  // belongs to that transition so state updates inside the effect cannot cancel it.
  useEffect(() => {
    const finishedLaunching = wasLaunching.current && !isLaunching;
    wasLaunching.current = isLaunching;

    if (isLaunching) {
      setIsCompleted(false);
      return;
    }
    if (!finishedLaunching) return;

    setIsCompleted(true);
    const timer = setTimeout(() => setIsCompleted(false), COMPLETED_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [isLaunching]);

  const showCompleted = !isLaunching && isCompleted;

  return (
    <Button
      variant={showCompleted ? 'outline' : 'primary'}
      size="sm"
      isDisabled={disabled || isLaunching || showCompleted}
      onPress={onLaunch}
      className="gap-1.5 font-medium"
    >
      {isLaunching && (
        <>
          <Spinner size="sm" />
          <span>Launching</span>
        </>
      )}
      {!isLaunching && !showCompleted && (
        <>
          <Play className="w-3.5 h-3.5" />
          <span>Launch →</span>
        </>
      )}
      {showCompleted && (
        <>
          <Check className="w-3.5 h-3.5 text-success" />
          <span>Done</span>
        </>
      )}
    </Button>
  );
}

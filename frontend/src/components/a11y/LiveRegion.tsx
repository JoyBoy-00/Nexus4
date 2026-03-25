/**
 * LiveRegion Component
 * Wrapper for dynamic content that should be announced to screen readers
 * WCAG 2.1 Level AA - 4.1.3 Status Messages
 */

import { FC, ReactNode, useRef } from 'react';

interface LiveRegionProps {
  children: ReactNode;
  /**
   * 'polite' - announces changes at a convenient time (default)
   * 'assertive' - interrupts current screen reader speech
   */
  priority?: 'polite' | 'assertive';
  /**
   * When true, announces entire region (default)
   * When false, only announces changed text
   */
  atomic?: boolean;
  /**
   * Optional aria-label for the region
   */
  label?: string;
  /**
   * Optional CSS class for styling
   */
  className?: string;
  /**
   * If true, element becomes a screen-reader-only live region
   */
  srOnly?: boolean;
}

/**
 * LiveRegion component for announcing dynamic content to screen readers
 * Use this to wrap content that updates (feed, chat, notifications)
 */
const LiveRegion: FC<LiveRegionProps> = ({
  children,
  priority = 'polite',
  atomic = true,
  label,
  className = '',
  srOnly = false,
}) => {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic={atomic}
      aria-label={label}
      className={`${srOnly ? 'sr-only' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * Hook to manage live region announcements
 * Usage: const { announce } = useLiveRegion();
 */
export const useLiveRegion = () => {
  const regionRef = useRef<HTMLDivElement>(null);

  const announce = (
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    if (regionRef.current) {
      regionRef.current.setAttribute('aria-live', priority);
      regionRef.current.textContent = message;

      // Clear after announcement to avoid clutter
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = '';
        }
      }, 3000);
    }
  };

  return { regionRef, announce };
};

export default LiveRegion;

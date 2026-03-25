/**
 * useFocusManagement Hook
 * Handles focus management on various events for better keyboard navigation
 * Follows WCAG 2.1 Level AA - 2.4.3 Focus Order
 */

import { useEffect, useRef, useCallback } from 'react';

interface UseFocusManagementOptions {
  /**
   * If true, log focus changes for debugging
   */
  debug?: boolean;
}

/**
 * Hook to manage focus on modals/dialogs
 * Ensures focus returns to trigger element when modal closes
 * triggerRef can be used as alternative to document.activeElement
 */
export const useModalFocus = (
  isOpen: boolean,
  triggerRef: React.RefObject<HTMLElement>
) => {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the element that triggered the modal
      previousActiveElement.current = document.activeElement as HTMLElement;
    } else {
      // Return focus when modal closes.
      if (triggerRef.current) {
        triggerRef.current.focus();
      } else if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen, triggerRef]);
};

/**
 * Hook to manage focus on dropdown menus
 * Ensures keyboard navigation works properly
 */
export const useMenuFocus = (
  isOpen: boolean,
  triggerRef: React.RefObject<HTMLElement>,
  menuRef?: React.RefObject<HTMLElement>
) => {
  useEffect(() => {
    if (isOpen && menuRef?.current) {
      // Focus the first menu item
      const firstMenuItem = menuRef.current.querySelector('[role="menuitem"]');
      if (firstMenuItem instanceof HTMLElement) {
        firstMenuItem.focus();
      }
    } else if (!isOpen && triggerRef.current) {
      // Return focus to trigger
      triggerRef.current.focus();
    }
  }, [isOpen, triggerRef, menuRef]);
};

/**
 * Hook to announce changes in dynamic content regions
 * Used for feed updates, chat messages, etc.
 */
export const useLiveRegionAnnouncement = (
  message: string,
  options: { polite?: boolean; atomic?: boolean } = {}
) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const announce = useCallback(
    (text: string) => {
      if (containerRef.current) {
        containerRef.current.setAttribute(
          'aria-live',
          options.polite !== false ? 'polite' : 'assertive'
        );
        containerRef.current.setAttribute(
          'aria-atomic',
          options.atomic !== false ? 'true' : 'false'
        );
        containerRef.current.textContent = text;
      }
    },
    [options]
  );

  useEffect(() => {
    if (message) {
      announce(message);
    }
  }, [message, announce]);

  return containerRef;
};

/**
 * Hook for general focus management utilities
 */
export const useFocusManagement = (options: UseFocusManagementOptions = {}) => {
  const { debug = false } = options;

  /**
   * Move focus to an element
   */
  const focusElement = useCallback(
    (element: HTMLElement | null) => {
      if (element) {
        element.focus();
        if (debug) {
          console.log('Focus moved to:', element);
        }
      }
    },
    [debug]
  );

  /**
   * Move focus to main content area (after page load/route change)
   */
  const focusMainContent = useCallback(() => {
    const mainElement = document.querySelector('main');
    if (mainElement instanceof HTMLElement) {
      mainElement.setAttribute('tabIndex', '-1');
      mainElement.focus();
      if (debug) {
        console.log('Focus moved to main content');
      }
    }
  }, [debug]);

  /**
   * Move focus back to trigger element (useful for modals, dropdowns)
   */
  const focusTrigger = useCallback(
    (triggerElement: HTMLElement) => {
      triggerElement.focus();
      if (debug) {
        console.log('Focus returned to trigger:', triggerElement);
      }
    },
    [debug]
  );

  /**
   * Trap focus within a container (useful for modals)
   */
  const trapFocus = useCallback(
    (containerRef: React.RefObject<HTMLElement>) => {
      const container = containerRef.current;
      if (!container) return () => {};

      const focusableElements = container.querySelectorAll<HTMLElement>(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return () => {};

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    },
    []
  );

  return {
    focusElement,
    focusMainContent,
    focusTrigger,
    trapFocus,
  };
};

export type { UseFocusManagementOptions };

/**
 * SkipLink Component
 * First focusable element for keyboard navigation
 * Allows users to skip past navigation directly to main content
 * WCAG 2.1 Level AA - 2.4.1 Bypass Blocks
 */

import { FC } from 'react';

const SkipLink: FC = () => {
  const handleSkip = () => {
    // Focus the main content area
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.focus();
      mainElement.scrollIntoView();
    } else {
      // Fallback: focus first heading or content area
      const appScrollContainer = document.getElementById(
        'app-scroll-container'
      );
      if (appScrollContainer) {
        appScrollContainer.focus();
        appScrollContainer.scrollIntoView();
      }
    }
  };

  return (
    <a
      href="#main-content"
      onClick={(e) => {
        e.preventDefault();
        handleSkip();
      }}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      tabIndex={0}
    >
      Skip to main content
    </a>
  );
};

export default SkipLink;

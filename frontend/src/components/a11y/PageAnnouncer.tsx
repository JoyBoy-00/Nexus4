/**
 * PageAnnouncer Component
 * Announces page title changes for screen readers on route navigation
 * WCAG 2.1 Level AA - 2.4.3 Focus Order & 3.2.2 On Input
 * Uses aria-live="polite" to announce page changes without interrupting
 */

import { FC, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface PageAnnouncerProps {
  /**
   * Custom mapping of routes to page titles for announcements
   * If a route is not found, the browser title will be used
   */
  routeTitleMap?: Record<string, string>;
}

const PageAnnouncer: FC<PageAnnouncerProps> = ({ routeTitleMap = {} }) => {
  const location = useLocation();
  const announceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get page title from multiple sources
    const getPageTitle = (): string => {
      const path = location.pathname;

      // Check custom route map first
      if (routeTitleMap[path]) {
        return routeTitleMap[path];
      }

      // Check for dynamic routes
      for (const [routePattern, title] of Object.entries(routeTitleMap)) {
        if (
          routePattern.includes(':') &&
          new RegExp(`^${routePattern.replace(/:\w+/g, '[^/]+')}$`).test(path)
        ) {
          return title;
        }
      }

      // Fallback to document title
      const docTitle = document.title;
      if (docTitle && docTitle !== 'Nexus') {
        return docTitle;
      }

      // Last resort: derive from path
      const pathName = path.split('/').filter(Boolean)[0] || 'Home';
      return `${pathName.charAt(0).toUpperCase()}${pathName.slice(1)} page loaded`;
    };

    const pageTitle = getPageTitle();

    // Announce after a brief delay to ensure page content is rendered
    // This prevents the announcement from being interrupted by other content
    const timer = setTimeout(() => {
      if (announceRef.current) {
        announceRef.current.textContent = `Page navigated to: ${pageTitle}`;
        // Clear announcement after 1 second to avoid clutter
        setTimeout(() => {
          if (announceRef.current) {
            announceRef.current.textContent = '';
          }
        }, 1000);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname, routeTitleMap]);

  return (
    <div
      ref={announceRef}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      aria-label="Page announcements"
    />
  );
};

export default PageAnnouncer;

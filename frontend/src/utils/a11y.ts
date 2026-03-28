/**
 * A11y Utilities
 * Common accessibility utilities for keyboard navigation, focus management, and ARIA updates
 * WCAG 2.1 Level AA compliance
 */

/**
 * Handle keyboard navigation for menu/dropdown
 * Supports Arrow Up/Down, Home, End, and Escape
 */
export const handleMenuKeyDown = (
  event: React.KeyboardEvent,
  options: {
    currentIndex: number;
    itemsLength: number;
    onNavigate: (index: number) => void;
    onClose?: () => void;
  }
) => {
  const { currentIndex, itemsLength, onNavigate, onClose } = options;

  switch (event.key) {
    case 'ArrowDown': {
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % itemsLength;
      onNavigate(nextIndex);
      break;
    }
    case 'ArrowUp': {
      event.preventDefault();
      const prevIndex = (currentIndex - 1 + itemsLength) % itemsLength;
      onNavigate(prevIndex);
      break;
    }
    case 'Home': {
      event.preventDefault();
      onNavigate(0);
      break;
    }
    case 'End': {
      event.preventDefault();
      onNavigate(itemsLength - 1);
      break;
    }
    case 'Escape': {
      event.preventDefault();
      onClose?.();
      break;
    }
  }
};

/**
 * Handle keyboard navigation for tabs
 * Supports Arrow Left/Right, Home, End
 */
export const handleTabKeyDown = (
  event: React.KeyboardEvent,
  options: {
    currentIndex: number;
    tabsLength: number;
    isVertical?: boolean;
    onNavigate: (index: number) => void;
  }
) => {
  const { currentIndex, tabsLength, isVertical = false, onNavigate } = options;
  const arrowToMove = isVertical ? 'ArrowDown' : 'ArrowRight';
  const arrowToPrev = isVertical ? 'ArrowUp' : 'ArrowLeft';

  switch (event.key) {
    case arrowToMove: {
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % tabsLength;
      onNavigate(nextIndex);
      break;
    }
    case arrowToPrev: {
      event.preventDefault();
      const prevIndex = (currentIndex - 1 + tabsLength) % tabsLength;
      onNavigate(prevIndex);
      break;
    }
    case 'Home': {
      event.preventDefault();
      onNavigate(0);
      break;
    }
    case 'End': {
      event.preventDefault();
      onNavigate(tabsLength - 1);
      break;
    }
  }
};

/**
 * Handle keyboard navigation for listbox (combobox, select)
 */
export const handleListBoxKeyDown = (
  event: React.KeyboardEvent,
  options: {
    currentIndex: number;
    itemsLength: number;
    onNavigate: (index: number) => void;
    onSelect?: (index: number) => void;
    onClose?: () => void;
  }
) => {
  const { currentIndex, itemsLength, onNavigate, onSelect, onClose } = options;

  switch (event.key) {
    case 'ArrowDown': {
      event.preventDefault();
      const nextIndex = Math.min(currentIndex + 1, itemsLength - 1);
      onNavigate(nextIndex);
      break;
    }
    case 'ArrowUp': {
      event.preventDefault();
      const prevIndex = Math.max(currentIndex - 1, 0);
      onNavigate(prevIndex);
      break;
    }
    case 'Home': {
      event.preventDefault();
      onNavigate(0);
      break;
    }
    case 'End': {
      event.preventDefault();
      onNavigate(itemsLength - 1);
      break;
    }
    case 'Enter':
    case ' ': {
      event.preventDefault();
      onSelect?.(currentIndex);
      break;
    }
    case 'Escape': {
      event.preventDefault();
      onClose?.();
      break;
    }
  }
};

/**
 * Check if a key is a printable character (for type-ahead functionality)
 */
export const isPrintableCharacter = (event: React.KeyboardEvent): boolean => {
  const { key } = event;
  return key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
};

/**
 * Type-ahead search for menu items
 * Returns the index of the first item starting with the typed character
 */
export const getTypeAheadIndex = (
  items: { label: string }[],
  typedChar: string,
  currentIndex: number
): number => {
  const char = typedChar.toLowerCase();
  const startIndex = (currentIndex + 1) % items.length;

  for (let i = 0; i < items.length; i++) {
    const idx = (startIndex + i) % items.length;
    if (items[idx].label.toLowerCase().startsWith(char)) {
      return idx;
    }
  }

  return currentIndex;
};

/**
 * Update ARIA attributes on parent element
 * Used for communicating state changes to screen readers
 */
export const updateAriaAttributes = (
  element: HTMLElement | null,
  attributes: Record<string, string | boolean | null>
): void => {
  if (!element) return;

  Object.entries(attributes).forEach(([key, value]) => {
    if (value === null) {
      element.removeAttribute(`aria-${key}`);
    } else {
      element.setAttribute(`aria-${key}`, String(value));
    }
  });
};

/**
 * Announce message to screen readers immediately
 * For urgent/assertive announcements
 */
export const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'alert');
  announcement.setAttribute('aria-live', 'assertive');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    announcement.remove();
  }, 1000);
};

/**
 * Get all focusable elements within a container
 */
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a, button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  );
};

/**
 * Check if an element is keyboard accessible
 */
export const isKeyboardAccessible = (element: HTMLElement): boolean => {
  const tag = element.tagName.toLowerCase();
  const tabIndex = element.getAttribute('tabindex');

  // Native keyboard accessible elements
  if (['a', 'button', 'input', 'select', 'textarea'].includes(tag)) {
    return !element.hasAttribute('disabled');
  }

  // Custom elements with explicit tab index
  if (tabIndex !== null && tabIndex !== '-1') {
    return true;
  }

  // Custom button/link elements with role
  const role = element.getAttribute('role');
  if (role && ['button', 'link', 'menuitem', 'tab'].includes(role)) {
    return true;
  }

  return false;
};

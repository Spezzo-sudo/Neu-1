/**
 * Shared minimum height tokens for steampunk cards across the interface.
 */
export const CARD_MIN_HEIGHT = {
  sm: '16rem',
  md: '20rem',
  lg: '24rem',
} as const;

/**
 * Standard spacing scale for section headers to maintain consistent rhythm.
 */
export const SECTION_SPACING = {
  headingTop: '0.5rem',
  headingBottom: '0.85rem',
  subHeadingBottom: '1.2rem',
} as const;

/**
 * Universal outline styles for focusable elements to ensure visible focus management.
 */
export const FOCUS_OUTLINE = {
  className: 'focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-yellow-400',
} as const;

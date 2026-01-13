/**
 * Utility functions for the application
 */

/**
 * Merge class names with proper handling of falsy values
 * Simple implementation without external dependencies
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

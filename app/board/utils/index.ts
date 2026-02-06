/**
 * Board Utilities
 * 
 * Re-exports all utility functions for clean imports:
 * import { getInitials, isDueSoon, ... } from './utils';
 */

export {
  getInitials,
  getAvatarColor,
  isDueThisWeek,
  isDueSoon,
  getDueBadge,
  isAsap,
  formatDate,
  getCardStyle,
  getFullName,
} from './projectHelpers';

export type { DueBadge } from './projectHelpers';

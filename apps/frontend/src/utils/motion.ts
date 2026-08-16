/**
 * PURPOSE: Single source of truth for Framer Motion variants/transitions
 * used across the app (page transitions, modals, dropdowns, toasts, cards,
 * skeletons, dashboard entrances). Centralizing these keeps animation
 * "language" consistent and subtle instead of every component inventing
 * its own timing/easing.
 * DEPENDENCIES: framer-motion
 */

import type { Transition, Variants } from 'framer-motion';

/** Shared easing/duration presets. Keep durations short — this is a
 * developer tool, not a marketing site. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export const TRANSITION_MICRO: Transition = { duration: 0.15, ease: EASE_OUT };
export const TRANSITION_NORMAL: Transition = { duration: 0.22, ease: EASE_OUT };
export const TRANSITION_LARGE: Transition = { duration: 0.35, ease: EASE_OUT };

/** Route-level page transition — fade + tiny rise, used by PageTransition. */
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: TRANSITION_NORMAL },
  exit: { opacity: 0, y: -4, transition: TRANSITION_MICRO }
};

/** Modal dialog surface (paired with a separate backdrop fade). */
export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0, transition: TRANSITION_NORMAL },
  exit: { opacity: 0, scale: 0.98, y: 4, transition: TRANSITION_MICRO }
};

export const backdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: TRANSITION_MICRO },
  exit: { opacity: 0, transition: TRANSITION_MICRO }
};

/** Dropdown / popover menus (Dropdown, Select). */
export const dropdownVariants: Variants = {
  initial: { opacity: 0, scale: 0.97, y: -4 },
  animate: { opacity: 1, scale: 1, y: 0, transition: TRANSITION_MICRO },
  exit: { opacity: 0, scale: 0.98, y: -2, transition: { duration: 0.1, ease: EASE_OUT } }
};

/** Toast entrance/exit — slide in from the right, collapse height on exit. */
export const toastVariants: Variants = {
  initial: { opacity: 0, x: 24, scale: 0.98 },
  animate: { opacity: 1, x: 0, scale: 1, transition: TRANSITION_NORMAL },
  exit: { opacity: 0, scale: 0.96, transition: TRANSITION_MICRO }
};

/** Tooltip fade. */
export const tooltipVariants: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.12, ease: EASE_OUT } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.08 } }
};

/** Card hover lift — used with `whileHover` directly on motion.div. */
export const cardHover = {
  y: -2,
  transition: TRANSITION_MICRO
};

/** Dashboard / list entrance stagger. Wrap a list in `staggerContainer`
 * and each child in `staggerItem`. */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 }
  }
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: TRANSITION_NORMAL }
};

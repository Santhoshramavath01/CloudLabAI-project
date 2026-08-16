/**
 * PURPOSE: Wraps routed page content so navigating between routes fades/
 * rises instead of hard-cutting. Mounted once around <Outlet /> in each
 * layout (DashboardLayout, AuthLayout) — individual pages never import
 * framer-motion themselves for this.
 * DEPENDENCIES: react, react-router-dom, framer-motion, ../../utils/motion
 */

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { pageVariants } from '../../utils/motion';

export interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}

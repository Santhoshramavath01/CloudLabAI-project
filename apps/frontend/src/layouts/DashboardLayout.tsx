/**
 * PURPOSE: Shell for every authenticated page — combines Sidebar, Navbar,
 * and a scrollable main content area, and owns the mobile drawer
 * open/close state that Sidebar/Navbar are controlled by. Wraps the routed
 * page in Suspense for lazy-loaded routes added in later phases, and in
 * AnimatePresence + PageTransition so navigating between sidebar
 * destinations fades/rises instead of hard-cutting (Phase 2.3).
 * DEPENDENCIES: react, react-router-dom, framer-motion,
 * ../components/layout/Sidebar, ../components/layout/Navbar,
 * ../components/motion/PageTransition, ../components/ui
 */

import { Suspense, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { PageTransition } from '../components/motion/PageTransition';
import { Spinner } from '../components/ui';

export function DashboardLayout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-base">
      <Sidebar isMobileOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setIsMobileNavOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center">
                <Spinner size="lg" />
              </div>
            }
          >
            <AnimatePresence mode="wait" initial={false}>
              <PageTransition key={location.pathname}>
                <Outlet />
              </PageTransition>
            </AnimatePresence>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

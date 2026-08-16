/**
 * PURPOSE: Shell for unauthenticated pages (login, register). Centers a
 * branded card on a subtle gradient background — no sidebar/navbar. Swaps
 * between login/register with the same fade/rise PageTransition used by
 * the dashboard shell (Phase 2.3).
 * DEPENDENCIES: react-router-dom, framer-motion,
 * ../components/motion/PageTransition
 */

import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from '../components/motion/PageTransition';

export function AuthLayout() {
  const location = useLocation();

  return (
    <div className="relative flex min-h-screen w-screen items-center justify-center bg-surface-base px-4">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.12),transparent_60%)]" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-base font-bold text-white">
            C
          </div>
          <span className="text-base font-semibold text-text-primary">CloudLab-AI</span>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface-raised p-6 shadow-xl">
          <AnimatePresence mode="wait" initial={false}>
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

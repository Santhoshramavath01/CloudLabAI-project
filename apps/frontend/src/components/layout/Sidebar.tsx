/**
 * PURPOSE: Primary app navigation. Fixed column on desktop, slide-in drawer
 * on mobile (open/close state owned by the parent DashboardLayout). Every
 * item routes somewhere real today — Dashboard renders the actual page,
 * the rest resolve to a "coming soon" placeholder until their phase lands.
 * DEPENDENCIES: react, react-router-dom, framer-motion, lucide-react,
 * ../../constants/routes, ../../utils/cn
 */

import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  Boxes,
  Container,
  TerminalSquare,
  FolderTree,
  GitBranch,
  Sparkles,
  Activity,
  Settings,
  X,
  type LucideIcon
} from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { cn } from '../../utils/cn';

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: ROUTES.dashboard, icon: LayoutDashboard },
  { label: 'Workspaces', to: ROUTES.workspaces, icon: Boxes },
  { label: 'Docker', to: ROUTES.docker, icon: Container },
  { label: 'Terminal', to: ROUTES.terminal, icon: TerminalSquare },
  { label: 'Files', to: ROUTES.files, icon: FolderTree },
  { label: 'Git', to: ROUTES.git, icon: GitBranch },
  { label: 'AI Assistant', to: ROUTES.ai, icon: Sparkles },
  { label: 'Monitoring', to: ROUTES.monitoring, icon: Activity }
];

const navLinkClasses = (isActive: boolean): string =>
  cn(
    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-micro',
    isActive
      ? 'bg-brand/10 text-brand'
      : 'text-text-secondary hover:bg-surface-overlay hover:text-text-primary'
  );

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-2 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
          C
        </div>
        <span className="text-sm font-semibold tracking-tight text-text-primary">CloudLab-AI</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === ROUTES.dashboard}
            onClick={onNavigate}
            className={({ isActive }) => navLinkClasses(isActive)}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border-subtle p-3">
        <NavLink to={ROUTES.settings} onClick={onNavigate} className={({ isActive }) => navLinkClasses(isActive)}>
          <Settings className="h-5 w-5 shrink-0" />
          Settings
        </NavLink>
      </div>
    </div>
  );
}

export interface SidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isMobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop: always-visible fixed column */}
      <aside className="hidden w-64 shrink-0 border-r border-border-subtle bg-surface-raised lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile: slide-in drawer with backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={onClose}
              aria-hidden="true"
            />
            <motion.aside
              key="sidebar-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border-subtle bg-surface-raised lg:hidden"
            >
              <div className="absolute right-3 top-3">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close navigation"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-overlay hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <SidebarContent onNavigate={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

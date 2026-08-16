/**
 * PURPOSE: Top application bar. Hosts the mobile menu toggle and the user
 * menu — now wired to real session data and logout (Phase 2.4) via the
 * shared Dropdown primitive rather than a one-off menu implementation.
 * DEPENDENCIES: react, react-router-dom, lucide-react, ../ui,
 * ../../store/authStore, ../../api/auth.api, ../../constants/routes
 */

import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, Settings as SettingsIcon, Menu, User } from 'lucide-react';
import { Dropdown } from '../ui';
import { toast } from '../../store/toastStore';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth.api';
import { ROUTES } from '../../constants/routes';

export interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // Logging out client-side regardless — the cookie may already be
      // gone/expired, which is exactly what we want anyway.
    } finally {
      clearSession();
      toast.info('Signed out');
      navigate(ROUTES.login, { replace: true });
    }
  }

  const initials = (user?.name || user?.email || '?').trim().charAt(0).toUpperCase();

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border-subtle bg-surface-raised px-4 lg:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-overlay hover:text-text-primary lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <span className="text-sm font-semibold text-text-primary lg:hidden">CloudLab-AI</span>

      <div className="flex-1" />

      <button
        type="button"
        aria-label="Notifications"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-overlay hover:text-text-primary"
      >
        <Bell className="h-5 w-5" />
      </button>

      <Dropdown
        trigger={
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
            {initials === '?' ? <User className="h-4 w-4" /> : initials}
          </span>
        }
        items={[
          { label: user?.email ?? 'Account', icon: <SettingsIcon className="h-4 w-4" />, onSelect: () => navigate(ROUTES.settings) },
          { label: 'Log out', icon: <LogOut className="h-4 w-4" />, onSelect: handleLogout, danger: true }
        ]}
      />
    </header>
  );
}

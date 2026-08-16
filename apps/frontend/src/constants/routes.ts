/**
 * PURPOSE: Single source of truth for frontend route paths so pages,
 * Sidebar links, and the router table never hardcode strings that can
 * drift out of sync.
 * DEPENDENCIES: none
 */

export const ROUTES = {
  dashboard: '/',
  workspaces: '/workspaces',
  docker: '/docker',
  terminal: '/terminal',
  files: '/files',
  git: '/git',
  ai: '/ai',
  monitoring: '/monitoring',
  settings: '/settings',
  login: '/login',
  register: '/register'
} as const;

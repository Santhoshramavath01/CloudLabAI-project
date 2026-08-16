/**
 * PURPOSE: Grid of shortcut tiles to the sidebar destinations a user most
 * commonly wants from the dashboard. Links to the same ComingSoonPage
 * routes as the sidebar until each module lands — no dead ends, nothing
 * faked.
 * DEPENDENCIES: react-router-dom, lucide-react, ../../../components/ui,
 * ../../../constants/routes
 */

import { Link } from 'react-router-dom';
import { Boxes, TerminalSquare, FolderGit2, Sparkles } from 'lucide-react';
import { Card } from '../../../components/ui';
import { ROUTES } from '../../../constants/routes';

const actions = [
  { label: 'New workspace', to: ROUTES.workspaces, icon: Boxes },
  { label: 'Open terminal', to: ROUTES.terminal, icon: TerminalSquare },
  { label: 'Browse files', to: ROUTES.files, icon: FolderGit2 },
  { label: 'Ask AI assistant', to: ROUTES.ai, icon: Sparkles }
];

export function QuickActions() {
  return (
    <Card header={<h2 className="text-sm font-semibold text-text-primary">Quick actions</h2>}>
      <div className="grid grid-cols-2 gap-3">
        {actions.map(({ label, to, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="flex flex-col items-start gap-2 rounded-lg border border-border-subtle p-3 text-sm text-text-secondary transition-colors duration-micro hover:border-border-strong hover:text-text-primary"
          >
            <Icon className="h-4 w-4 text-brand" />
            {label}
          </Link>
        ))}
      </div>
    </Card>
  );
}

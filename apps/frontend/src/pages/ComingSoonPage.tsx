/**
 * PURPOSE: Shared placeholder for sidebar destinations whose real module
 * hasn't landed yet (Workspaces/Docker/Terminal/Files/Git/AI/Monitoring/
 * Settings). Keeps navigation fully functional during Phase 2 instead of
 * 404ing, without faking any real feature's behavior.
 * DEPENDENCIES: react, lucide-react, ../components/ui
 */

import { Construction } from 'lucide-react';
import { EmptyState } from '../components/ui';

export interface ComingSoonPageProps {
  title: string;
}

export default function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <EmptyState
        icon={<Construction className="h-5 w-5" />}
        title={`${title} is coming soon`}
        description="This module is planned for a later phase of CloudLab-AI."
      />
    </div>
  );
}

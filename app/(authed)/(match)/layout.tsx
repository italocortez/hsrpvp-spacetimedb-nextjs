import React from 'react';

/**
 * Phase 28 reservation — will host match-only subscriptions (LobbyMember, Draft, ActionItem).
 * Passthrough today; downstream match pages mount under (match)/draft/[matchId].
 */
export default function MatchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

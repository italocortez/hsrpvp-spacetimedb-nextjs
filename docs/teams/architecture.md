# Teams

## Tables

```
Team
│  id (PK, autoInc), name (unique), ownerId → User.id
│  isAdHoc (true for tournament-only groups)
│  tournamentId? → Tournament.id (set for ad-hoc teams)
│
├── TeamMember (accepted members)
│     PK: [teamId, userId]
│     teamId → Team.id
│     userId → User.id
│     role   → TeamMemberRole (Owner/Player/Coach)
│
└── TeamInvite (pending/resolved invitations)
      id (PK, autoInc)
      teamId        → Team.id
      inviterUserId → User.id (who sent the invite)
      inviteeUserId → User.id (who received it)
      isPending     → true until accepted/declined
```

## Flow

1. User creates team → `Team` row + `TeamMember(role: Owner)` for creator
2. Owner calls `invite_to_team` → inserts `TeamInvite(isPending: true)`
3. Invitee sees pending invites (filtered by `ti_invitee_id` index)
4. Invitee calls `accept_team_invite` → sets `isPending: false` + inserts `TeamMember` row
5. Or calls `decline_team_invite` → sets `isPending: false` (or deletes the row)

## Key Decisions

- Persistent teams exist as orgs with rosters
- Ad-hoc groups (`isAdHoc: true`) allowed for tournament-only participation — linked to a specific `tournamentId`
- Coach role: can observe match (cursor tracking visible) but cannot call pick/ban reducers
- `inviterUserId` exists separately from `createdById` — an admin could create an invite on behalf of a captain

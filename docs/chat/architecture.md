# Chat

## Tables

```
Lobby
│
└── ChatMessage (ephemeral per-lobby chat)
      id (PK, autoInc)
      lobbyId        → Lobby.id
      senderUserId   → User.id  (real userId stored; view anonymizes)
      senderType     → ChatSenderType (Player / System)
      content        → raw text up to 500 chars
      metadata?      → JSON string: { type, replyToMessageId? }
      anonymousLabel? → computed label when lobby has anonymous mode
```

---

## Rolling Window (D-13)

The chat table is bounded to **50 messages per lobby**. When `send_chat_message` would push the count to 51, the oldest message (by `createdDate`) is deleted first, then the new message is inserted. This keeps per-lobby chat memory constant regardless of lobby duration, and reduces reconnect egress for clients that subscribe fresh.

- Maximum rows per lobby at any time: 50
- Enforcement: in `send_chat_message` reducer before insert
- System messages from `advance_stage` also apply this rolling window

---

## Metadata JSON Schema (D-14)

The `metadata` column stores a JSON string following this schema:

```json
{
  "type": "text" | "reply" | "emoji_only",
  "replyToMessageId": 123   // optional, only for type="reply"
}
```

The reducer validates that `metadata` parses as valid JSON with a valid `type` field. Invalid metadata rejects the message with a `SenderError`.

- `text`: plain text message (default)
- `reply`: message is a reply to another; `replyToMessageId` contains the target `ChatMessage.id`
- `emoji_only`: message consists entirely of emoji characters

Reply to a deleted message: backend stores the dangling `replyToMessageId`. Frontend renders "Reply to deleted message" gracefully (D-17).

---

## Emoji Storage (D-15)

- **Standard OS Unicode emojis:** Stored as-is in the `content` string. No special encoding.
- **Custom shortcodes:** Stored as `:shortcode:` syntax in `content`. Frontend resolves to images from `public/emojis/` in v1. Backend is unaware of custom emoji semantics.

---

## Anonymous Enforcement (D-18, D-92)

The **real** `senderUserId` is always stored on the `ChatMessage` row. Anonymous label computation happens server-side:

1. **On insert:** `send_chat_message` computes `computeAnonymousLabel()` when `lobby.isAnonymousPlayers || lobby.isAnonymousSpectators`. The result is stored in `anonymousLabel`.
2. **On read:** `view_my_lobby_chat` further enforces anonymization per-viewer. If the message's sender should be anonymous from the caller's perspective (based on lobby settings and team membership), the view returns `senderUserId=0` and the pre-stored `anonymousLabel`. System messages are never anonymized (`senderType=System`).

Pattern: real data stored, views anonymize. Same approach as cursor events (Phase 6).

---

## Moderation (D-26)

Host, referee, and admin/moderator can delete individual messages via `delete_chat_message(messageId)`.

**Permission check:**
- `lobby.hostUserId === user.id` (host)
- `LobbyMember.isReferee === true` for the caller in this lobby
- `isRoleAtLeast(user.role, 'Moderator')` (admin or moderator)

Deleted messages leave dangling `replyToMessageId` references. Frontend responsibility to handle gracefully.

---

## System Messages (D-11)

System messages use `senderType: System`, `senderUserId: 0`, no anonymousLabel. Inserted on:

- Player **joined** the lobby (`join_lobby`)
- Player **left** the lobby (`leave_lobby`)
- Player was **kicked** (`kick_member`)
- Player was **banned** (`ban_member`)
- Stage changed to **Equipping** (`advance_stage` Drafting→Equipping)
- Stage changed to **Scoring** (`advance_stage` Equipping→Scoring)
- **Draft started** (`start_draft`)

System messages are subject to the rolling window (50-message cap).

---

## Lifecycle & Cleanup (CHAT-03)

Chat messages are **ephemeral** — they do not persist after lobby close.

**Hard delete cascade (D-19):** When `close_lobby` or auto-close (empty Waiting lobby) fires, all `ChatMessage` rows for that lobby are deleted in the same transaction via `lobby_id` btree index. This happens before the Lobby row itself is deleted.

**No archival:** Chat messages are NOT written to any history table. They are not part of match replay or match history.

---

## ChatMessage Table Reference

| Column | Type | Description |
|--------|------|-------------|
| id | u32 autoInc PK | Primary key |
| lobbyId | u32 | FK to Lobby.id |
| senderUserId | u32 | Real user ID (0 = system) |
| senderType | ChatSenderType | Player or System |
| content | string | Message text (max 500 chars, server-enforced) |
| metadata | string? | JSON: `{ type, replyToMessageId? }` |
| anonymousLabel | string? | Pre-computed label (e.g. "Blue-1") when anonymous mode active |
| createdById | u32 | Audit |
| createdDate | timestamp | Audit |
| lastModifiedById | u32 | Audit |
| lastModifiedDate | timestamp | Audit |

**Indexes:** `lobby_id` btree

---

## Reducer Reference

| Reducer | Permission | Description |
|---------|-----------|-------------|
| `send_chat_message` | Any lobby member (D-10) | Inserts message; rolling window; metadata validation; anonymous label |
| `delete_chat_message` | Host, referee, admin, moderator (D-26) | Hard-deletes a single message by id |

---

## Key Decisions

- Ephemeral — messages are NOT persisted after lobby close (CHAT-03)
- 500 character limit per message, enforced server-side (D-12)
- Rolling window of 50 — oldest deleted on insert when limit reached (D-13)
- Real `senderUserId` stored; view layer anonymizes (D-18, D-92)
- Metadata JSON validates against `{ type, replyToMessageId? }` schema (D-14)
- System messages share same table with `senderType=System` flag (D-11)
- All 4 audit columns present for redundancy/security despite ephemeral nature

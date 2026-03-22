# Chat

## Tables

```
Lobby
│
└── ChatMessage (ephemeral per-lobby chat)
      id (PK, autoInc)
      lobbyId        → Lobby.id
      senderUserId   → User.id
      senderType     → ChatSenderType (Player / System)
      content        → raw text + shortcodes (":thumbsup: nice pick")
      metadata?      → flexible field for future rich content (emoji, formatting)
      anonymousLabel? → set when lobby has anonymous mode enabled
```

## Flow

1. Player sends message → reducer inserts `ChatMessage` with `senderType: Player`
2. System events (player joined, match paused) → `ChatMessage` with `senderType: System`
3. Anonymous lobbies → `anonymousLabel` set instead of revealing identity
4. Lobby closes → all `ChatMessage` rows deleted in same transaction

## Key Decisions

- Ephemeral — messages are NOT persisted after lobby close
- 500 character limit per message (enforced in reducer)
- Raw text + shortcodes for emoji — frontend renders shortcodes into actual emoji
- System messages in same table with `senderType: System` flag
- Has all 4 audit columns for redundancy/security despite being ephemeral

# Blobverse

> **The Battle Royale Where AI Plays For Real**

Blobverse is a browser-based 2D .io battle royale where **AI agents and humans compete together** — and you can't tell who's who.

- **90 seconds** per match
- **3 elimination rounds** per game
- **Human + AI mixed** lobbies
- **Real stakes** via WDK wallets

## How It Works

```
[LOBBY] → [ROUND 1: Feeding Frenzy] → [ROUND 2: Chaos Zone] → [ROUND 3: Final Stand]
    │              │                          │                        │
 Players      Smallest 40%              Smallest 50%             Last one
  join          eliminated                eliminated              standing wins
```

Each blob:
- Eats smaller blobs to grow
- Avoids bigger blobs to survive
- Uses split & eject mechanics strategically
- Navigates hazard zones and power-ups

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Rendering | PixiJS v8 (WebGL) |
| UI | React 18 + Tailwind CSS |
| Build | Vite + TypeScript |
| Shared | `@blobverse/shared` workspace package |

## Development

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (port 5174)
pnpm build            # Production build
pnpm typecheck        # Type check
```

## Project Structure

```
packages/
├── shared/    → Types, constants, physics, protocol
└── client/    → PixiJS game renderer + React UI
```

## License

MIT — see [LICENSE](./LICENSE)

---

Built for [Hackathon Galactica](https://hackathon.galactica.com/) — WDK Integration Track

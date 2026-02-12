# Persona Pack

This folder contains markdown persona contracts used by Feed Jarvis.

## File format

Each persona is one `.md` file with key-value metadata at the top:

```md
name: Macro Hawk
prefix: Macro Hawk:
role: Inflation and rates risk monitor
style: skeptical, data-heavy, blunt
voice: short macro takes with hard numbers
topics: inflation, rates, bonds, dollar
prompt: Write one macro risk update with key number, implication, confidence 0-100, and source tags.
```

Required fields:
- `name`
- `prefix`

Optional fields:
- `role`
- `style`
- `voice`
- `topics` (comma-separated)
- `prompt`

## Usage

CLI:

```bash
npm run dev -- personas --personas personas/
npm run dev -- generate --input events.json --persona "Macro Hawk" --personas personas/
```

Studio server:

```bash
FEED_JARVIS_PERSONAS="$(pwd)/personas" npm run dev:web
```

If no explicit path is provided, Studio and CLI auto-load this bundled pack when present.

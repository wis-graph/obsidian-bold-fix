# Bold Fix - Obsidian Plugin

Fix bold (`**bold**`) and italic (`*italic*`) rendering when followed by text without space.

## Problem

Obsidian's CodeMirror 6 parser follows CommonMark spec strictly. When `**bold**` or `*italic*` is immediately followed by text without space, the closing marker is not recognized, causing incorrect rendering.

```
**bold**text  →  "boldtext" all rendered as bold (incorrect)
```

This plugin fixes that behavior.

## Before & After

| Before | After |
|--------|-------|
| ![Before](bold_fix_before.png) | ![After](bold_fix_after.png) |

## Features

- Fixes `**bold**` rendering in Live Preview and Reading View
- Fixes `*italic*` rendering in Live Preview and Reading View
- Preserves Obsidian's native behavior for showing `**`/`*` markers when cursor/selection overlaps

## Installation

### Manual

1. Download `main.js` and `manifest.json` from [Releases](https://github.com/wis-graph/obsidian-bold-fix/releases)
2. Create folder `bold-fix` in your vault's `.obsidian/plugins/` directory
3. Copy downloaded files into the folder
4. Enable "Bold Fix" in Obsidian settings → Community plugins

### From Source

```bash
git clone https://github.com/wis-graph/obsidian-bold-fix.git
cd obsidian-bold-fix
npm install
npm run build
```

Copy `main.js` and `manifest.json` to `.obsidian/plugins/bold-fix/` in your vault.

## Development

```bash
npm run dev    # Watch mode
npm run build  # Production build
```

## License

MIT

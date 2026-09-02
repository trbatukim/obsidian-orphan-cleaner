# Orphan Cleaner

An [Obsidian](https://obsidian.md) plugin that finds and deletes orphan files — files that have no incoming or outgoing links anywhere in your vault — so you can keep your vault free of stray notes and attachments.

## Features

- Scans your vault for files with no incoming links (nothing references them) and no outgoing links (they don't link out to anything else).
- Shows a confirmation dialog listing every orphan file found before anything is deleted, and warns you how deletion will behave based on your vault's trash setting (system trash, vault `.trash`, or permanent deletion).
- Deletes files through Obsidian's file manager, respecting your vault's trash settings.
- Configurable file extensions to scan (defaults to `md png jpeg pdf`).
- Configurable excluded paths — folders or specific files that should never be treated as orphans.
- Optional setting to skip any file that has at least one tag, even if it's otherwise unlinked.

## Usage

1. Click the trash-can ribbon icon, or run **Clean orphan nodes** from the command palette.
2. Review the list of orphan files in the confirmation dialog.
3. Confirm to delete them (moved to trash per your vault's trash setting), or cancel to back out.

## Settings

Open **Settings → Orphan Cleaner** to configure:

- **File extensions** — space- or comma-separated list of extensions to check (without dots), e.g. `md png jpeg pdf`.
- **Excluded paths** — one folder or file path per line, relative to the vault root. Files inside these folders, or matching these exact paths, are never treated as orphans.
- **Exclude files with tags** — when enabled, any file that has at least one tag is never treated as an orphan, even if nothing links to it.

## Installing

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/trbatukim/obsidian-orphan-cleaner/releases).
2. Copy them into `<VaultFolder>/.obsidian/plugins/orphan-cleaner/`.
3. Reload Obsidian and enable **Orphan Cleaner** in **Settings → Community plugins**.

## Development

```bash
npm install       # install dependencies
npm run dev        # compile in watch mode
npm run build       # type-check and produce a production build
npm run lint        # run eslint
```

Copy or symlink the repo into `<VaultFolder>/.obsidian/plugins/orphan-cleaner/` for local testing, then reload Obsidian after each build.

## License

See [LICENSE](LICENSE).

# AGENTS.md

## Project Overview

Personal portfolio website for Drew Romanyk, hosted at **romanyk.dev**. Built with Astro as a fully static site and deployed to GitHub Pages.

## Tech Stack

- **Framework**: Astro 5 (static site generator)
- **Language**: TypeScript (strict mode via `tsconfig.json`)
- **Styling**: CSS custom properties for light/dark theming
- **Package manager**: npm
- **Node version**: 20

## Commands

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | Start local dev server         |
| `npm run build`   | Production build to `dist/`    |
| `npm run preview` | Preview the production build   |

## Directory Structure

```
src/
  pages/          # Astro pages (file-based routing)
    index.astro         # Home — hero section + project cards
    links.astro         # /links — quick-access service links
    minesweeperWeb.astro # /minesweeperWeb — playable game
  components/     # Reusable .astro components
    Header.astro        # Nav bar with theme toggle
    Footer.astro        # Copyright footer
    ProjectCard.astro   # Project display card
    LinkCard.astro      # External link card
  layouts/        # Page layouts
    BaseLayout.astro    # Standard layout (header + footer)
    LinksLayout.astro   # Centered layout, no header/footer
  styles/
    global.css          # CSS reset, variables, base typography
public/           # Static assets served as-is
  favicons/       # Favicon and webmanifest files
  resume/         # Resume in md, html, and pdf formats
  minesweeper/    # Game legal docs
```

## Resume

The resume exists in three formats in `public/resume/`:
- `resume.md` — markdown source of record
- `resume.html` — styled HTML template (green accent theme, matches original PDF design)
- `resume.pdf` — generated from the HTML

To regenerate the PDF after editing the content:
1. Update `resume.md` and `resume.html` with the changes (keep them in sync)
2. Run: `weasyprint public/resume/resume.html public/resume/resume.pdf`

Requires `weasyprint` (`brew install weasyprint`).

## Deployment

Pushes to `master` trigger the GitHub Actions workflow at `.github/workflows/deploy.yml`:
1. `npm ci` → `npm run build`
2. Uploads `dist/` to GitHub Pages

Domain is configured via the `CNAME` file (romanyk.dev).

## Architecture & Conventions

- **Single-file components**: Each `.astro` file contains frontmatter (TypeScript), template (HTML), and scoped `<style>`.
- **Component props**: Defined with TypeScript `interface Props` in frontmatter.
- **Theming**: CSS custom properties defined in `src/styles/global.css`. Dark mode uses `[data-theme="dark"]` on `<html>`, persisted in `localStorage`.
- **Page data**: Projects and service links are defined as JavaScript arrays directly in page frontmatter — no external data files or CMS.
- **Layouts**: `BaseLayout` for standard pages (accepts `title` and optional `description` props). `LinksLayout` for the minimal links page.
- **Static assets**: Resume files, favicons, and game assets live in `public/` and are served at the site root.
- **Max content width**: 750px (`--max-width` variable).
- **Fonts**: System font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", …`).

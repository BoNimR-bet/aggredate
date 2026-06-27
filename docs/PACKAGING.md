# Packaging And Installers

Aggredate Studio uses Electron Builder.

## Scripts

| Command | Output |
| --- | --- |
| `npm run app:dev` | Run the desktop app locally. |
| `npm run dist:win` | Windows NSIS installer and portable app. |
| `npm run dist:linux` | Linux AppImage and `.deb`. |
| `npm run dist:mac` | macOS DMG and zip. |
| `npm run dist:all` | Attempt all configured platforms. |

## Output

Build artifacts are written to `dist/`.

## Windows

Run on Windows:

```bash
npm run dist:win
```

The NSIS installer supports choosing an install directory and creates desktop/start-menu shortcuts.

## Linux

Run on Linux for best results:

```bash
npm run dist:linux
```

This creates AppImage and Debian package artifacts.

## macOS

Run on macOS:

```bash
npm run dist:mac
```

Signing and notarization are not configured. For distribution outside local testing, add Apple Developer signing credentials and notarization settings.

## Cross-Building

Electron Builder can cross-package some targets, but macOS DMG/signing should be done on macOS and Linux package tooling is most reliable on Linux or CI.

This repo includes `.github/workflows/build-installers.yml`, which builds Windows, Linux, and macOS artifacts on native GitHub Actions runners when you push a `v*` tag or run it manually.

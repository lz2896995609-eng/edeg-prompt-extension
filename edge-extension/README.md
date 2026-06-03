# edeg Prompt Floating Library

This folder contains the browser extension source files.

Load this folder as an unpacked extension in Microsoft Edge, Google Chrome, or another Chromium-based browser.

## Files

- `manifest.json` - Manifest V3 extension configuration
- `content.js` - floating prompt library behavior
- `content.css` - floating prompt library styles
- `使用说明.txt` - Chinese usage guide for Windows Notepad users

## Install

1. Open `edge://extensions/` or `chrome://extensions/`.
2. Enable Developer mode.
3. Click **Load unpacked**.
4. Select this `edge-extension` folder.

## Data

Saved prompts are stored in the browser extension local storage. Updating the extension files normally does not remove existing prompt data.

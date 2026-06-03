# edeg Prompt Floating Library

edeg Prompt Floating Library is a lightweight browser extension for Microsoft Edge, Google Chrome, and other Chromium-based browsers. It helps ChatGPT and AI workflow users save, search, categorize, edit, and insert reusable prompts directly into web input boxes.

The extension runs locally in the browser and stores prompt data in extension local storage.

## Features

- Floating `T` button near the active web input box
- Expandable prompt library panel
- One-click prompt insertion into the current input box
- Prompt creation, editing, and deletion
- Category management
- Search by prompt title, content, or category
- Horizontal mouse-wheel scrolling for category tabs
- Responsive panel positioning around the active input box
- Local-first storage with no backend dependency
- Works on most text inputs, textareas, and editable web text areas

## Screenshots

### Floating Button

![Floating prompt button](screenshots/floating-button.png)

### Prompt Panel

![Expanded prompt panel](screenshots/prompt-panel.png)

### Add Prompt

![Add prompt form](screenshots/add-prompt.png)

### Category Management

![Category management](screenshots/category-management.png)

## Browser Support

- Microsoft Edge
- Google Chrome
- Other Chromium-based browsers that support Manifest V3 extensions

Firefox is not supported by this package yet.

## Installation

### Edge

1. Download or unzip `edeg-prompt-extension.zip`.
2. Open `edge://extensions/`.
3. Enable Developer mode.
4. Click **Load unpacked**.
5. Select the `edge-extension` folder.
6. Open ChatGPT or another web page with an input box and test the floating `T` button.

### Chrome

1. Download or unzip `edeg-prompt-extension.zip`.
2. Open `chrome://extensions/`.
3. Enable Developer mode.
4. Click **Load unpacked**.
5. Select the `edge-extension` folder.

## Usage

1. Focus a web input box.
2. Click the floating `T` button.
3. Search or switch categories if needed.
4. Click a prompt card to insert its content into the active input box.
5. Use the edit and delete buttons on each card to manage saved prompts.

## Project Structure

```text
edeg-prompt-extension/
  edge-extension/
    manifest.json
    content.js
    content.css
    README.md
    使用说明.txt
  screenshots/
    README.md
  CHANGELOG.md
  LICENSE
  README.md
```

## Data Storage

Prompt data is stored in the browser extension's local storage under the existing extension data area.

Reloading or updating the unpacked extension normally does not remove existing prompts. Uninstalling the extension or clearing extension data may remove saved prompts.

Planned improvements include import/export, backup, browser sync, and optional account-based sync.

## Roadmap

- Import and export prompt data
- Optional browser-account sync
- Better cross-site input detection
- More compact responsive layouts
- Optional cloud account system
- Public prompt pack sharing

## Maintainer Role

This repository is maintained as the primary source for the edeg prompt floating extension. Maintenance includes browser compatibility fixes, UI positioning improvements, prompt management features, documentation, release notes, and user feedback triage.

## License

MIT License. See [LICENSE](LICENSE).

# Contributing

Thanks for considering a contribution to edeg Prompt Floating Library.

This project is a local-first browser extension for prompt management in Edge, Chrome, and other Chromium-based browsers.

## Good First Contributions

- Report reproducible browser compatibility issues.
- Improve installation instructions.
- Add screenshots that explain real workflows.
- Improve responsive layout behavior.
- Suggest safer data backup and migration workflows.
- Test the extension on non-standard web editors.

## Local Setup

1. Clone the repository.
2. Open `edge://extensions/` or `chrome://extensions/`.
3. Enable Developer mode.
4. Click **Load unpacked**.
5. Select the `edge-extension` folder.
6. Test the extension on a page with an input box.

## Testing Checklist

Before opening an issue or pull request, check:

- The floating button appears near the active input box.
- The prompt panel opens and closes correctly.
- Prompt insertion works in the active input field.
- Search works by title, content, and category.
- Category tabs can scroll horizontally with the mouse wheel.
- Existing saved prompts are not removed after reloading the extension.
- The panel does not cover the browser top bar or bottom taskbar area in common window sizes.

## Pull Request Guidelines

- Keep changes focused.
- Do not change the prompt storage key unless migration logic is included.
- Avoid deleting or resetting existing user prompt data.
- Include screenshots for visible UI changes.
- Update README, CHANGELOG, or release notes when behavior changes.

## Data Safety

Do not include private prompt content, account data, cookies, API keys, or access tokens in issues, screenshots, commits, or pull requests.

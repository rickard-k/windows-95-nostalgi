# Windows 95 Nostalgia

A small Windows 95–style desktop in the browser, built with React, TypeScript and Vite. Double-click an icon on the desktop to open it in a window you can drag by its title bar.

## What's on the desktop

- **Minesweeper.exe**: a 9×9 board with 10 mines. Left-click reveals a cell and right-click places a flag. Your first click is never a mine. Click the smiley to start a new game.
- **Snake.exe**: a 15×15 board. Steer with the arrow keys or WASD, eat the red squares to grow, and avoid the walls and your own tail. Click the smiley or press Space after a game ends to play again. The best score resets when the page reloads.

## Getting started

Requires Node.js.

```sh
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Tech notes

- React 19 with the [React Compiler](https://react.dev/learn/react-compiler) enabled through Babel, so components don't need manual memoisation.
- Vite 8 and TypeScript 6.

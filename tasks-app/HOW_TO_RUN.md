# How to Run — Tasks App

## Prerequisites
- Node.js (v18 or higher)
- npm

## First time setup
Only needed once — dependencies are already installed if the `node_modules` folder exists.

```powershell
cd "c:\Cursor apps\ניסיון\tasks-app"
npm install
```

## Start the dev server

```powershell
cd "c:\Cursor apps\ניסיון\tasks-app"
npm run dev
```

Then open **http://localhost:5173** in the browser.

## Build for production

```powershell
cd "c:\Cursor apps\ניסיון\tasks-app"
npm run build
```

Output goes to the `dist/` folder.

## Preview the production build

```powershell
cd "c:\Cursor apps\ניסיון\tasks-app"
npm run preview
```

---

## Tech stack
- React 18 + TypeScript
- Vite
- Tailwind CSS v3
- date-fns (date math)
- react-router-dom (routing)
- canvas-confetti (confetti on task completion)
- localStorage (all data is stored locally in the browser)

## Pages
| URL | Description |
|-----|-------------|
| `/` | Weekly task view — navigate weeks, add/edit/complete tasks |
| `/plant` | Plant growth page — streak tracker |

## Project folder
```
c:\Cursor apps\ניסיון\tasks-app\
```

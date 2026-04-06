# Planning — Ideas & Future Features

Write your ideas here. When ready to implement, move them to the "Ready" section.

---

## 💡 Ideas (raw, not yet evaluated)

> Add your ideas here freely — no need to be detailed yet.

---

## ✅ Ready to Implement

> Ideas that are clear enough to build. Will be turned into tasks.

---

## 🚧 In Progress

> Currently being worked on.

---

## ✔️ Done

> Implemented ideas (with date).

- **06/04/2026 07:31** — Added 3 new backgrounds: Mountain 🏔️, City 🌆, Gradient 🎨.
  Mountain and City use downloaded images from Unsplash. Gradient is a pure CSS animated gradient (no image).
  See [`TODO-BACKGROUNDS.md`](./TODO-BACKGROUNDS.md) for full list.

- **06/04/2026 07:24** — Bug fix: Edit task modal appeared behind the background overlay.
  Solved by wrapping `TaskModal` with `createPortal` so it renders directly on `document.body`, above all layers.
  See [`BUG-modal-behind-background.md`](./BUG-modal-behind-background.md) for full details.

---

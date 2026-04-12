# Mobile UX improvement plan

This document plans how to make **tasks-app** comfortable and reliable on phones (small viewports, touch, notches, on-screen keyboard). Implementation should follow this order unless a dependency dictates otherwise.

---

## 1. Goals

- **Readable and tappable** on narrow screens (about 320px width and up).
- **No accidental taps**; primary actions meet common minimum touch sizes (~44×44 CSS px where practical).
- **Safe areas** respected (notch, status bar, home indicator) without overlapping fixed UI.
- **Forms and modals** remain usable when the virtual keyboard opens (scroll, no clipped actions).
- **Consistent RTL/LTR** on mobile (Hebrew default, English switch) without broken toggles or layout.

**Success criteria:** Manual pass on at least one iOS Safari device, one Android Chrome device, and narrow desktop emulation (e.g. 375×667); no horizontal page scroll on main flows; settings, home week view, add/edit task, plant page, and login all usable one-handed where reasonable.

---

## 2. Current state (audit summary)

| Area | What works | Gaps |
|------|------------|------|
| **HTML** | `viewport` with `viewport-fit=cover`, PWA-ish meta | `theme-color` is fixed white; may not match dark backgrounds. |
| **Global CSS** | RTL on `body`, `box-sizing`, tap highlight off, `.safe-top` / `.safe-bottom` utilities | Utilities exist but are **not applied consistently** to shell layout. |
| **Home header** | Sticky bar, `max-w-lg` | **No reserved space** for the fixed settings gear; title/streak can feel cramped or overlap visually on small notched devices. |
| **WeekView** | Week nav buttons have reasonable padding; FAB uses `safe-area-inset-bottom` | Per-day “add” icon is **small** (`p-1`, 16px icon). Long week range text may crowd the center on very narrow screens. |
| **TaskCard** | Edit visible on mobile | Checkbox comment mentions 44px but control is **24×24**; edit control is small. |
| **TaskModal** | Bottom sheet on small screens, `max-h-[90dvh]`, bottom padding with safe area | Time/date inputs use **fixed widths** (`w-36`, `w-44`) — risk on small widths / zoom. **Recurrence toggle** uses horizontal translation that may not match RTL. Bottom action row (save / cancel / delete) may **squeeze** on narrow screens. |
| **SettingsPanel** | Gear uses `safe-area-inset-top`; drawer width `85vw` / `max-w-sm` | Tabs are dense; ensure tap targets and scroll behavior feel good. |
| **PlantPage / Plant** | Card layout | Plant SVG uses **fixed pixel sizes**; large stage may dominate or clip on very small heights unless container constrains. |
| **Login** | Centered card | Vertical centering with `min-h-screen` can interact badly with keyboard — verify **scroll-into-view** for inputs. |

---

## 3. Strategy (phased)

### Phase A — Shell and safe areas (foundation)

1. **Apply safe-area padding to the main app chrome**  
   - Home and Plant **headers**: add `padding-top` (and optionally horizontal inset) using `env(safe-area-inset-top)` so content clears the status bar when scroll position is 0.  
   - **Main content**: add bottom padding that accounts for the **floating add button** *and* `safe-area-inset-bottom` (today `pb-28` is fixed; tune so it scales with safe area).

2. **Reserve space for the settings control**  
   - In RTL: gear is fixed **top-right**; ensure the header row has **end-padding** (~40–48px) or mirrors the gear position so the title and streak link do not sit under the button.  
   - In LTR: mirror (gear top-left → **start-padding** on header).

3. **Viewport height**  
   - Prefer **`min-h-[100dvh]`** (or equivalent) for full-screen sections where `100vh` causes mobile browser UI jumps; align with existing `90dvh` usage in `TaskModal`.

4. **Optional polish**  
   - `theme-color` / `apple-mobile-web-app-status-bar-style`: consider matching dynamic background or a neutral that works on light and dark hero areas (low priority).

### Phase B — Touch targets and density

1. **TaskCard**  
   - Wrap checkbox in a **minimum ~44×44px** hit area (visual circle can stay smaller if desired).  
   - Increase edit button tap area (`min-w`/`min-h` or padding) without breaking alignment.

2. **WeekView**  
   - Enlarge per-day “add task” control to a similar minimum.  
   - Week range label: allow **truncation / two-line stack** or slightly smaller type on `xs` if needed to avoid horizontal pressure between chevrons.

3. **SettingsPanel**  
   - Verify tab buttons meet comfortable tap height; increase vertical padding on small screens if tabs feel tight.

4. **TaskModal**  
   - Recurrence **switch**: ensure thumb movement is **RTL-correct** (logical “on” side, not only physical `-translate-x-*`).  
   - Primary actions: on very narrow widths, stack **Save / Cancel** full-width; keep **Delete** accessible (full-width destructive below, or icon + text with adequate height).

### Phase C — Forms, keyboard, and scroll

1. **Full-width inputs on small screens**  
   - Time and date fields: `w-full max-w-*` or `w-full sm:w-44` so they don’t overflow or look misaligned when zoomed.

2. **Modal scroll**  
   - Keep one scroll container (`overflow-y-auto` on sheet) with enough **bottom padding** when the keyboard opens; test iOS Safari and Android.  
   - Consider `overscroll-behavior: contain` on the modal body to reduce background scroll bleed (global utility or class).

3. **Login page**  
   - Ensure the card can scroll when the keyboard reduces visible height (`min-h-[100dvh]` + `overflow-y-auto` on outer wrapper or padding-bottom), so the submit button stays reachable.

### Phase D — Plant and secondary pages

1. **Plant SVG**  
   - Constrain max size with `max-w-[min(100%,…)]` / responsive `clamp()` or container `aspect` so the illustration scales down on short viewports.

2. **PlantPage header**  
   - Same safe-area and back-link tap target improvements as Home.

### Phase E — Verification

1. **Device checklist**  
   - iPhone (notch + home indicator), Android with gesture nav, small width (e.g. 320px).  
   - Rotate to landscape briefly: modals and drawer still usable.

2. **Regression**  
   - RTL and LTR both; streak link; settings open/close; add task FAB not hidden by system UI.

---

## 4. Files likely to change (for implementation)

| File | Typical changes |
|------|-----------------|
| `src/index.css` | Optional global utilities (`min-h-dvh`, overscroll); safe-area helpers if not inlined. |
| `src/pages/Home.tsx` | Header/main padding; spacing for settings button. |
| `src/pages/PlantPage.tsx` | Safe-area header; optional main padding. |
| `src/components/WeekView.tsx` | Tap targets; week label responsiveness; FAB spacing if needed. |
| `src/components/TaskCard.tsx` | Checkbox/edit hit areas. |
| `src/components/TaskModal.tsx` | Input widths; action layout; RTL toggle; scroll/overscroll. |
| `src/components/SettingsPanel.tsx` | Tab tap targets; optional safe-area on drawer edges. |
| `src/components/Plant.tsx` | Responsive SVG sizing. |
| `src/pages/LoginPage.tsx` | Keyboard-safe layout. |
| `index.html` | Optional meta tweaks (`theme-color`). |

---

## 5. Out of scope (unless requested later)

- Native app shell (Capacitor/Tauri) or push notifications.  
- Horizontal “swipe between weeks” carousel (could be a future enhancement).  
- Redesign of information architecture or new features.

---

## 6. Next step

Execute **Phase A → E** in order, keeping changes minimal and matching existing Tailwind/React patterns. After each phase, quick manual test on a real phone or responsive devtools before moving on.

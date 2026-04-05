# Background Planning

This file tracks planned and existing backgrounds for the tasks app.
To add a new background: add the image to `public/`, register it in the code (see steps below), and document it here.

---

## How to Add a New Background

### 1. Add the image file
Place the image in `public/` — e.g. `public/bg-night.jpg`.  
Recommended size: **1920×1080px** or larger. Formats: `jpg`, `png`, `webp`.

### 2. Register the type
In `src/context/SettingsContext.tsx`, add the new ID to the `Background` union:

```ts
export type Background = "default" | "jungle" | "night"; // add here
```

### 3. Add the translation label
In `src/i18n/translations.ts`, add a label for each language:

```ts
// inside `he`:
bgNight: "לילה",

// inside `en`:
bgNight: "Night",
```

Also add the key to the `Translations` type at the bottom of that file:

```ts
bgNight: string;
```

### 4. Register in the settings panel
In `src/components/SettingsPanel.tsx`, add an entry to `BG_OPTIONS`:

```ts
{
  id: "night",
  label: (l) => t(l, "bgNight"),
  preview: "url('/bg-night.jpg') center/cover",
},
```

### 5. Apply in AppBackground
In `src/components/AppBackground.tsx`, add a condition for the new background:

```tsx
background === "night"
  ? {
      backgroundImage: "url('/bg-night.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
    }
  : ...
```

Or refactor `AppBackground` to a lookup map once there are many backgrounds (see note at bottom).

---

## Existing Backgrounds

| ID        | File               | Label (HE) | Label (EN) | Status |
|-----------|--------------------|------------|------------|--------|
| `default` | *(CSS color)*      | ברירת מחדל | Default    | ✅ Live |
| `jungle`  | `public/bg-jungle.png` | ג'ונגל | Jungle     | ✅ Live |

---

## Planned Backgrounds

| ID         | Description                        | Label (HE)  | Label (EN)  | Status  |
|------------|------------------------------------|-------------|-------------|---------|
| `night`    | Dark night sky with stars          | לילה        | Night       | 💡 Idea |
| `ocean`    | Calm blue ocean / beach            | אוקיינוס    | Ocean       | 💡 Idea |
| `mountain` | Snowy mountain landscape           | הרים        | Mountain    | 💡 Idea |
| `city`     | City skyline at sunset             | עיר         | City        | 💡 Idea |
| `gradient` | Animated CSS gradient (no image)   | גרדיאנט     | Gradient    | 💡 Idea |
| `minimal`  | Pure white, very clean             | מינימלי     | Minimal     | 💡 Idea |

---

## Notes

- **Overlay opacity:** currently `rgba(0,0,0,0.35)` for image backgrounds. Adjust per background in `AppBackground.tsx` if some images are darker/lighter.
- **Performance tip:** use `webp` format for smaller file sizes on mobile.
- **Refactor idea:** once there are 4+ image backgrounds, replace the `if/else` chain in `AppBackground.tsx` with a lookup object:

```ts
const BG_STYLES: Record<Background, React.CSSProperties> = {
  default: { backgroundColor: "#f8fafc" },
  jungle:  { backgroundImage: "url('/bg-jungle.png')", backgroundSize: "cover", ... },
  night:   { backgroundImage: "url('/bg-night.jpg')",  backgroundSize: "cover", ... },
};
```

---
title: Use and settings
description: Runtime controls, author settings, defaults, and source layout.
order: 3
---

# Use and settings

## Runtime controls

- **Measure:** starts a line. Each click adds a vertex; double-click finishes it.
- **Delete:** removes the selected measurement.
- **Delete key:** performs the same delete action when focus is not inside a form field.
- **Vertex editing:** drag an existing vertex to update the distance.

Distances are calculated geodetically. Meters are displayed by default; app authors can also choose kilometres, feet, or miles.

## Settings at a glance

- **Map:** connects Small Measure to the Map widget it should use.
- **Multiple lines:** keeps earlier measurements. It is off by default.
- **Show label:** displays the distance on the map. It is on by default.
- **Unit:** chooses meters, kilometres, feet, or miles. Meters are the default.
- **Number format:** chooses European, French, Swiss, or application-locale separators. European is the default.
- **Line color and width:** style the measured line. The defaults are `#0079c1` and `3` pixels; widths from 2 to 6 are available.
- **Font and size:** style the map label. The defaults are `Arial` and `12` points; four fonts and sizes from 10 to 20 are available.

## Number separator rules

- European: thousands are not separated; a comma separates decimals (`1234567,8 m`).
- French: a non-breaking space separates each group of three digits; a comma separates decimals (`1 234 567,8 m`).
- Swiss: an apostrophe separates each group of three digits; a dot separates decimals (`1'234'567.8 m`).
- Application locale: Experience Builder chooses the separators from its active locale.

## Source layout

```text
manifest.json
widgets/
  small-measure/
    config.json
    icon.svg
    manifest.json
    src/
      config.ts
      runtime/
      setting/
```

`src/runtime/widget.tsx` contains the map interaction. `src/setting/setting.tsx` contains the builder settings panel. Translation files live beside both entry points.

## Project checks

From the repository root, use Node.js 22 and run:

```sh
npm run verify
```

This checks the one-widget structure, ready-to-host release files, manifest values, locales, defaults, and documentation build.

---
title: Overview
description: What Small Measure does and what the repository contains.
order: 1
---

# Small Measure

Small Measure is a compact custom widget for ArcGIS Experience Builder. It lets a map user draw a line, read its distance in a chosen unit, adjust its vertices, and delete it.

## What users see

The widget has two buttons:

- **Measure** starts a new line.
- **Delete** removes the selected line.

The distance can also appear as a label on the map. Status updates are announced to assistive technology without adding extra visible text to the compact toolbar.

## What app authors can change

The settings panel lets an app author:

- connect the widget to a Map widget;
- allow one measurement or several;
- show or hide map labels;
- choose meters, kilometres, feet, or miles;
- choose European, French, Swiss, or application-locale number formatting;
- choose the line color and width;
- choose the label font and size.

## Compatibility

This version targets:

- ArcGIS Enterprise 11.5;
- ArcGIS Maps SDK for JavaScript 4.32;
- React 18.

The repository contains the widget source, a ready-to-host compiled release, public documentation, and small validation scripts.

The project uses the MIT License. ArcGIS and ArcGIS Experience Builder are Esri products and remain subject to Esri's terms.

## Languages

English is the default. French, German, Spanish, Italian, Brazilian Portuguese, Dutch, Polish, Czech, Danish, Swedish, Norwegian Bokmål, and Finnish are also included. Interface text follows the active Experience Builder locale; number formatting follows the widget setting.

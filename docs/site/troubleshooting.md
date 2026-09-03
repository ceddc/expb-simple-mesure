---
title: Troubleshooting
description: Quick checks for missing widgets, disabled controls, and labels.
order: 4
---

# Troubleshooting

## The widget does not appear in Enterprise Experience Builder

- Confirm the portal item was created as an **Experience Builder widget**.
- Confirm the item is registered in the same organization as the experience.
- Confirm the app author can access the item through its group or organization sharing.
- Look for Small Measure in the **Custom** widget group.
- Confirm the hosted files came from the complete `release/small-measure` folder.

## The hosted manifest does not register

- Open the hosted `manifest.json` URL in a private browser window. It must load without a sign-in prompt.
- Confirm the URL uses HTTPS and a valid certificate issued by a certificate authority.
- Confirm the web server allows CORS requests from the customer portal domain.
- Confirm `.json` files use the `application/json` MIME type.
- Confirm the complete `release/small-measure` folder was deployed, not `widgets/small-measure`, which contains source code.

## An update does not appear

- Confirm the new production build replaced the complete hosted compiled folder.
- Clear the browser cache while testing.
- Configure appropriate cache-control headers or use a versioned hosted path when releases must update immediately.
- Keep the portal item pointed at the correct hosted `manifest.json`; the portal widget item itself is not updated with source files.

## The measure button is disabled

- Add a Map widget to the experience.
- Open the Small Measure settings.
- Select that Map widget.
- Test in preview or published mode; drawing is disabled while the builder is in design mode.

## The distance label is missing

- Open the widget settings and enable map labels.
- Finish a line with at least two vertices.
- Check that the configured text color can be read over the map. The default label uses dark text with a white halo.

## Delete does not work

- Select or finish a measurement first.
- Use the trash button if keyboard focus is inside an input, text area, selector, or editable field.
- When multiple measurements are enabled, Delete removes the active line and selects the latest remaining line.

## The interface language is unexpected

The widget follows the active Experience Builder locale. English is the default in the widget manifest. If the active locale is not included, Experience Builder falls back to English.

## A project check fails

Run this from the repository root:

```sh
npm run validate
```

The command reports the first missing or unexpected project file or manifest value.

---
title: Deploy to ArcGIS Enterprise 11.5
description: Register Small Measure as a customer custom widget and use it in an experience.
order: 2
---

# Deploy to ArcGIS Enterprise 11.5

Small Measure is used as a custom widget in the Experience Builder included with the customer's ArcGIS Enterprise portal. This repository already contains the compiled widget. The customer hosts and registers it once, and app authors can then add it to their experiences.

## Requirements

You need:

- ArcGIS Enterprise 11.5;
- an HTTPS web server that the customer portal and users can reach;
- an ArcGIS Enterprise portal administrator to register the widget.

## Ready-to-host folder

Use this folder from the repository:

```text
release/small-measure
```

It already contains `manifest.json`, `dist/runtime/widget.js`, `dist/setting/setting.js`, translations, configuration, the icon, and the license. Deploy the complete folder unchanged.

## 1. Host the release folder

Copy the complete `release/small-measure` folder to the customer's web server. For example, the manifest could be available at:

```text
https://widgets.customer.example/small-measure/manifest.json
```

The hosted folder must meet Esri's requirements:

- anonymous access, with no sign-in prompt;
- HTTPS with a valid certificate issued by a certificate authority;
- CORS access allowed from the ArcGIS Enterprise portal domain;
- `.json` files served as `application/json`.

Open the manifest URL in a private browser window to check that it loads without authentication before registering it.

## 2. Register it in the customer portal

Only a portal administrator can register a custom widget.

1. Sign in to the ArcGIS Enterprise portal as an administrator.
2. Open **My Content** and select **Add Item**.
3. Choose **An application**.
4. Choose **Experience Builder widget** as the application type.
5. Enter the hosted `manifest.json` URL.
6. Add tags and create the item. The title is read from the manifest.

The source repository and source ZIP are not uploaded to Portal. Portal stores a widget item that points to the hosted, compiled manifest.

## 3. Share the widget item

Keep the item private while testing. When it is ready, share it with the customer group or organization that should use it. Share publicly only when an anonymously accessible experience requires it.

The widget must be registered in the same organization as the experience and available to the people who open that experience.

## 4. Add it to a customer experience

1. Open the built-in Experience Builder in ArcGIS Enterprise 11.5.
2. Create or edit an experience.
3. Add a Map widget.
4. In the widget panel, open the **Custom** group and add **Small Measure**.
5. Open Small Measure settings and select the Map widget.
6. Choose the measurement unit. Meters are the default; kilometres, feet, and miles are also available.
7. Preview the experience and verify drawing, vertex editing, deletion, units, and number formatting.
8. Save and publish the experience.

App authors use the registered widget in the customer portal's normal Experience Builder.

## Update an installed widget

Replace the hosted `small-measure` folder with the folder from a newer project release. Existing apps use the files from the same registered manifest URL. Esri notes that the portal widget item itself cannot be updated; cache-control settings or URL versioning may be needed so users receive the new files.

This workflow follows Esri's official [Add custom widgets in ArcGIS Enterprise 11.5](https://doc.arcgis.com/en/experience-builder/11.5/configure-widgets/add-custom-widgets.htm) instructions.

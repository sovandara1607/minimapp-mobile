# Milestone 1 — Field view

A quiet instrument for seeing the road ahead. The signature is the low-positioned white arrow, surrounded by simplified, pitched sage geometry. The map gets almost all of the screen; the shell provides just enough orientation.

Palette: land #CCD3C9, road #F0F2EF, water #97B6C1, park #B3C7AD, charcoal #253A38, accent #407D72. Native system type for interface and display, tabular numbers for speed, monospace only for diagnostics. A compact wordmark and generous rounded map frame carry the identity; no borrowed game assets or branding.

Layout: safe area → compact wordmark → flexible map frame → quiet status footer. On-map status at top left, north/perspective at top right, speed low left, player at 68% of the map height, recenter at bottom center only during explore. Apple/Google's required map attribution remains visible at the bottom edge.

The custom palette above is fully reproduced on Android (Google Maps supports JSON styling). Apple Maps has no such API, so iOS shows standard Apple Maps colors under the same HUD and camera behavior — see the README for why this trade-off was chosen over requiring a Mapbox account.

No attached screenshot was available in the supplied attachment folder; the written brief defines the visual direction. No destination, route, ETA, or product features are implied in this milestone.

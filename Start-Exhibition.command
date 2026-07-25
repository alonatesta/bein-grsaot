#!/bin/bash
# בין גרסאות — one-click exhibition kiosk (PUBLIC / Vercel version).
# Double-click this file: your live site opens fullscreen, and pressing הדפסה
# prints INSTANTLY to the default printer (no dialog). Quit with Cmd+Q.
#
# >>> After you deploy, put your real Vercel URL here: <<<
URL="https://bein-grsaot.vercel.app"

# Launch a dedicated Chrome instance so --kiosk-printing takes effect even if
# a normal Chrome window is already open. Silent printing goes to the system
# DEFAULT printer, so set your A5 printer as default first.
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --user-data-dir="$HOME/.mosaic-kiosk" \
  --kiosk --kiosk-printing \
  --no-first-run --no-default-browser-check \
  "$URL"

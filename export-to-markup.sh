#!/bin/bash
# export-to-markup.sh — Automates Notion HTML export and loads into Markup
#
# Usage: Run while a Notion page is open in the desktop app.
# Notion will be snapped to the right half of the screen automatically.
#
# Requirements:
# - macOS Accessibility permissions for your terminal app
# - Notion desktop app open to a page

set -e

MARKUP_DIR="$(cd "$(dirname "$0")" && pwd)"
EXPORT_FILE="$MARKUP_DIR/autoload.zip"

# Remove old export if present
rm -f "$EXPORT_FILE"

echo "Exporting from Notion... (don't touch anything until done)"

# All UI automation in ONE osascript — no focus switching
# Uses fixed coordinates (Notion snapped to right half of 1728pt-wide display)
# Coordinates found via accessibility inspection:
#   Actions button: (1690, 78)
#   Search field: (1550, 138)
#   Format dropdown: center (1400, 452)
#   Export button: center (1402, 658)
osascript <<'APPLESCRIPT'
on run
    tell application "Notion" to activate
    delay 0.5

    tell application "System Events"
        tell process "Notion"
            set frontmost to true
            delay 0.2

            -- Snap to right half
            keystroke (ASCII character 29) using {command down, shift down}
            delay 0.5

            -- Click Actions button (⋯)
            click at {1690, 78}
            delay 0.8

            -- Click search field and type Export
            click at {1550, 138}
            delay 0.3
            keystroke "Export"
            delay 0.5
            keystroke return
            delay 1.5

            -- Export dialog is now open, HTML should already be selected
            -- Click the Export button directly
            click at {1402, 658}
            delay 0.3

            -- Wait for save dialog sheet to appear
            set maxWait to 15
            set waited to 0
            repeat while waited < maxWait
                try
                    set s to sheet 1 of front window
                    exit repeat
                end try
                delay 0.5
                set waited to waited + 1
            end repeat

            if waited is maxWait then
                error "Save dialog did not appear."
            end if

            set s to sheet 1 of front window

            -- Set filename to "autoload"
            set saveField to first text field of splitter group 1 of s
            click saveField
            delay 0.1
            set value of saveField to "autoload"
            delay 0.2

            -- Navigate to Markup dir if not already there
            set wherePopup to pop up button "Where:" of splitter group 1 of s
            set currentDir to value of wherePopup
            if currentDir is not "Markup" then
                keystroke "g" using {command down, shift down}
                delay 0.8
                keystroke "/Users/kyleseagraves/Documents/Markup"
                delay 0.3
                keystroke return
                delay 0.8
            end if

            -- Click Save
            set allElements to entire contents of s
            repeat with elem in allElements
                try
                    if (class of elem as text) is "button" and name of elem is "Save" then
                        click elem
                        exit repeat
                    end if
                end try
            end repeat
        end tell
    end tell
end run
APPLESCRIPT

# Wait for file
echo "Waiting for export..."
TIMEOUT=30
ELAPSED=0
while [ ! -f "$EXPORT_FILE" ] && [ $ELAPSED -lt $TIMEOUT ]; do
    sleep 1
    ELAPSED=$((ELAPSED + 1))
done

if [ ! -f "$EXPORT_FILE" ]; then
    echo "Error: Export timed out after ${TIMEOUT}s."
    exit 1
fi

echo "Done! Opening Markup..."
open "https://winthehouseyoulove.com"
sleep 1
osascript -e '
tell application "Safari"
    activate
    tell front window
        set newTab to make new tab with properties {URL:"http://localhost:8000/index.html?load=autoload.zip"}
        set current tab to newTab
    end tell
end tell
'

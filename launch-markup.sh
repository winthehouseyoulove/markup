#!/bin/bash

# Launch Markup application
MARKUP_DIR="$(cd "$(dirname "$0")" && pwd)"

# Check if server is already running
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "Server already running on port 8000"
else
    # Start the Python server in the background from the Markup directory
    python3 -m http.server 8000 --directory "$MARKUP_DIR" &
    echo "Server started on port 8000"
    # Wait for server to start
    sleep 3
fi

# Open the browser with multiple tabs
open "https://winthehouseyoulove.com"
sleep 1
open "http://localhost:8000/index.html"

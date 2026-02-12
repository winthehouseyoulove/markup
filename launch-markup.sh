#!/bin/bash

# Launch Markup application
MARKUP_DIR="$(cd "$(dirname "$0")" && pwd)"

# Kill any existing server on port 8000 (prevents stale processes)
EXISTING_PID=$(lsof -Pi :8000 -sTCP:LISTEN -t 2>/dev/null)
if [ -n "$EXISTING_PID" ]; then
    echo "Killing stale server (PID $EXISTING_PID)"
    kill "$EXISTING_PID" 2>/dev/null
    sleep 1
fi

# Start the Python server bound to IPv4 localhost
python3 -m http.server 8000 --bind 127.0.0.1 --directory "$MARKUP_DIR" &
echo "Server started on port 8000"

# Wait for server to actually respond before opening browser
for i in 1 2 3 4 5; do
    if curl -s -o /dev/null http://localhost:8000/index.html 2>/dev/null; then
        break
    fi
    sleep 1
done

# Open the browser with multiple tabs
open "https://winthehouseyoulove.com"
sleep 1
open "http://localhost:8000/index.html"

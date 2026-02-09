#!/bin/bash

# Launch Markup application
cd "/Users/kyleseagraves/Documents/Markup"

# Check if server is already running
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "Server already running on port 8000"
else
    # Start the Python server in the background
    cd "/Users/kyleseagraves/Documents/Markup"
    python3 -m http.server 8000 &
    echo "Server started on port 8000"
    # Wait for server to start
    sleep 3
fi

# Open the browser with multiple tabs
open "https://winthehouseyoulove.com"
sleep 1
open "http://localhost:8000/index.html"

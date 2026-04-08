#!/bin/sh
# Start Express server in production mode.
# Serves both the API (/api/*) and the React frontend (static files) on PORT 8080.
NODE_ENV=production node proxy.js

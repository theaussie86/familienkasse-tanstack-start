#!/bin/sh
set -e

echo "Running database migrations..."
npm run db:migrate

echo "Starting application..."
exec node .output/server/index.mjs

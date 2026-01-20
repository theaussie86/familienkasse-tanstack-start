#!/bin/sh
set -e

# Build DATABASE_URL from components if not already set
if [ -z "$DATABASE_URL" ] && [ -n "$POSTGRES_USER" ] && [ -n "$POSTGRES_PASSWORD" ] && [ -n "$POSTGRES_DB" ]; then
    # URL-encode the password (handles special characters)
    ENCODED_PASSWORD=$(printf '%s' "$POSTGRES_PASSWORD" | sed 's/%/%25/g; s/ /%20/g; s/!/%21/g; s/"/%22/g; s/#/%23/g; s/\$/%24/g; s/&/%26/g; s/'\''/%27/g; s/(/%28/g; s/)/%29/g; s/*/%2A/g; s/+/%2B/g; s/,/%2C/g; s/:/%3A/g; s/;/%3B/g; s/</%3C/g; s/=/%3D/g; s/>/%3E/g; s/?/%3F/g; s/@/%40/g; s/\[/%5B/g; s/\\/%5C/g; s/\]/%5D/g; s/\^/%5E/g; s/{/%7B/g; s/|/%7C/g; s/}/%7D/g')
    export DATABASE_URL="postgresql://${POSTGRES_USER}:${ENCODED_PASSWORD}@${POSTGRES_HOST:-postgres}:${POSTGRES_PORT:-5432}/${POSTGRES_DB}"
    echo "DATABASE_URL constructed from environment variables"
fi

echo "Running database migrations..."
npm run db:migrate

echo "Starting application..."
exec node .output/server/index.mjs

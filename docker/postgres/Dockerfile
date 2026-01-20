FROM postgres:17-bookworm

# Install pg_cron extension
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-17-cron \
    && rm -rf /var/lib/apt/lists/*

# Copy initialization script
COPY init-extensions.sql /docker-entrypoint-initdb.d/

# Start PostgreSQL with pg_cron configuration
# shared_preload_libraries must be set at server start
CMD ["postgres", "-c", "shared_preload_libraries=pg_cron", "-c", "cron.database_name=familienkasse"]

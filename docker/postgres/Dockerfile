FROM postgres:17-bookworm

# Install pg_cron extension
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-17-cron \
    && rm -rf /var/lib/apt/lists/*

# Configure PostgreSQL to load pg_cron
RUN echo "shared_preload_libraries = 'pg_cron'" >> /usr/share/postgresql/postgresql.conf.sample

# Copy initialization script
COPY init-extensions.sql /docker-entrypoint-initdb.d/

# Configure pg_cron to use the specified database
# Note: cron.database_name must be set after shared_preload_libraries
RUN echo "cron.database_name = 'familienkasse'" >> /usr/share/postgresql/postgresql.conf.sample

-- Enable pg_cron extension
-- This must run after PostgreSQL starts with pg_cron loaded via shared_preload_libraries
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage to the database user (allows scheduling jobs)
GRANT USAGE ON SCHEMA cron TO familienkasse;

-- Schedule weekly allowance job
-- Runs every Saturday at 10:00 AM server time
-- Inserts allowance transactions for accounts with recurring allowance enabled
-- Description format: [ACCOUNT_NAME] KW[WEEK], [YEAR]
SELECT cron.schedule(
    'weekly_allowance',
    '0 10 * * 6',
    $SQL$
    INSERT INTO familienkasse_transaction (id, account_id, description, amount, is_paid, created_at)
    SELECT
        gen_random_uuid()::text,
        fa.id,
        fa.name || ' KW' || EXTRACT(WEEK FROM NOW())::integer || ', ' || EXTRACT(YEAR FROM NOW())::integer,
        fa.recurring_allowance_amount,
        false,
        NOW()
    FROM familienkasse_account fa
    WHERE fa.recurring_allowance_enabled = true
      AND fa.recurring_allowance_amount > 0
    $SQL$
);

-- Schedule history cleanup job
-- Runs daily at 1:00 AM to purge job history older than 7 days
-- Prevents unbounded growth of cron.job_run_details table
SELECT cron.schedule(
    'purge_cron_history',
    '0 1 * * *',
    $$DELETE FROM cron.job_run_details WHERE end_time < NOW() - INTERVAL '7 days'$$
);

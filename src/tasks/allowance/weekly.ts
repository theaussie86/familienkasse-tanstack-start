import { getAccountsWithAllowanceEnabled } from "@/db/queries/accounts";
import {
  hasWeeklyAllowanceThisWeek,
  createAllowanceTransaction,
} from "@/db/queries/transactions";

export interface WeeklyAllowanceResult {
  success: boolean;
  accountsProcessed: number;
  accountsSkipped: number;
  errors: string[];
}

/**
 * Process weekly allowances for all configured accounts.
 * Can be triggered via:
 * - API endpoint: POST /api/cron/weekly-allowance
 * - Script: npx tsx src/scripts/test-weekly-allowance.ts
 * - Netlify scheduled function
 * - Neon pg_cron
 */
export async function processWeeklyAllowances(
  dryRun = false
): Promise<WeeklyAllowanceResult> {
  const errors: string[] = [];
  let accountsProcessed = 0;
  let accountsSkipped = 0;

  console.log(
    `[weekly-allowance] Starting weekly allowance processing${dryRun ? " (DRY RUN)" : ""}...`
  );

  try {
    // Get all accounts with allowance enabled
    const accounts = await getAccountsWithAllowanceEnabled();
    console.log(`[weekly-allowance] Found ${accounts.length} accounts with allowance enabled`);

    for (const account of accounts) {
      try {
        // Check for duplicate
        const hasAllowance = await hasWeeklyAllowanceThisWeek(account.id);

        if (hasAllowance) {
          console.log(
            `[weekly-allowance] Skipping account "${account.name}" - already has allowance this week`
          );
          accountsSkipped++;
          continue;
        }

        if (dryRun) {
          console.log(
            `[weekly-allowance] [DRY RUN] Would create allowance for "${account.name}": ${account.recurringAllowanceAmount / 100} EUR`
          );
          accountsProcessed++;
        } else {
          // Create allowance transaction
          await createAllowanceTransaction(
            account.id,
            account.recurringAllowanceAmount
          );
          console.log(
            `[weekly-allowance] Created allowance for "${account.name}": ${account.recurringAllowanceAmount / 100} EUR`
          );
          accountsProcessed++;
        }
      } catch (error) {
        const errorMessage = `Account ${account.id}: ${error instanceof Error ? error.message : String(error)}`;
        console.error(`[weekly-allowance] Error processing account: ${errorMessage}`);
        errors.push(errorMessage);
      }
    }

    console.log(
      `[weekly-allowance] Completed: ${accountsProcessed} processed, ${accountsSkipped} skipped, ${errors.length} errors`
    );

    return {
      success: errors.length === 0,
      accountsProcessed,
      accountsSkipped,
      errors,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[weekly-allowance] Fatal error: ${errorMessage}`);
    errors.push(errorMessage);

    return {
      success: false,
      accountsProcessed,
      accountsSkipped,
      errors,
    };
  }
}

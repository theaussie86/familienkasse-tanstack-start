/**
 * ID generation utility using crypto.randomUUID().
 * Provides consistent UUID generation across the application.
 */
/**
 * Generate a new UUID for database entities.
 * Uses the Web Crypto API which is available in all modern environments.
 * @returns A new UUID string
 */
export function generateId() {
    return crypto.randomUUID();
}

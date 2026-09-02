// A canonical account handle names one login account inside one company. Two
// downstream sinks each guard the raw account identifier with a different
// validator: a directory-segment denylist, and the secret-key allowlist
// (`packages/shared/src/validators/secret.ts`). `toAccountHandle` accepts a
// value only when it satisfies both, so one handle can safely name both a
// directory and a secret.

/** The longest accepted account handle. The secret key limit is 120
 *  characters, and the longest name prefix a caller adds is `CODEX_HOME_` at
 *  11 characters, so 100 leaves headroom. */
export const ACCOUNT_HANDLE_MAX_LENGTH = 100;

// The same character class the secret key schema uses.
const ACCOUNT_HANDLE_PATTERN = /^[a-zA-Z0-9_.-]+$/;

/**
 * Converts a raw account identifier into a safe account handle. Returns
 * `null` when the value cannot become one instead of throwing, so a caller
 * decides how to fail the operation.
 *
 * An input becomes a handle only when every rule below is true for its
 * trimmed value:
 *
 * - It matches `/^[a-zA-Z0-9_.-]+$/`.
 * - It is {@link ACCOUNT_HANDLE_MAX_LENGTH} characters or shorter.
 * - It is neither `.` nor `..`.
 * - It does not start with `-` (a leading `-` reads as a command-line option).
 */
export function toAccountHandle(rawAccountId: string): string | null {
  const trimmed = typeof rawAccountId === "string" ? rawAccountId.trim() : "";
  if (!ACCOUNT_HANDLE_PATTERN.test(trimmed)) return null;
  if (trimmed.length > ACCOUNT_HANDLE_MAX_LENGTH) return null;
  if (trimmed === "." || trimmed === "..") return null;
  if (trimmed.startsWith("-")) return null;
  return trimmed;
}

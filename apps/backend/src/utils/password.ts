/**
 * PURPOSE: Thin wrapper around the existing argon2 dependency so the rest
 * of the codebase hashes/verifies passwords through one place (and always
 * with the argon2id variant called out in docs/security.md) rather than
 * importing argon2 directly in services.
 * DEPENDENCIES: argon2
 */

import argon2 from 'argon2';

export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return argon2.verify(hash, plain);
}

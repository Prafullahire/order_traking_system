import { UserRole } from '../users/enums/user-role.enum';

/**
 * Generates a dynamic test user object with unique values.
 * Using the current timestamp ensures each run gets distinct credentials
 * without relying on external libraries.
 */
export function generateTestUser() {
  const timestamp = Date.now();
  return {
    name: `Test Customer ${timestamp}`,
    email: `test${timestamp}@example.com`,
    password: `Password${timestamp}`,
    role: UserRole.CUSTOMER as const,
  };
}


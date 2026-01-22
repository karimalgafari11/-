/**
 * User Defaults - القيم الافتراضية للمستخدمين
 */

import { UserSettings } from '../../../types/settings-extended';

export const getDefaultUserSettings = (): UserSettings => ({
    roles: [],
    defaultRole: 'viewer',
    requireTwoFactor: false,
    sessionTimeout: 60,
    maxSessions: 3,
    passwordPolicy: {
        minLength: 8,
        requireUppercase: false,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
        expiryDays: 0,
        preventReuse: 0
    },
    loginAttempts: {
        maxAttempts: 5,
        lockoutDuration: 15
    }
});

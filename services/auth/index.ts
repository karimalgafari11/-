/**
 * Auth Index - تصدير خدمات المصادقة
 */

// Helper functions
export { mapAuthError, mapUserToAuthUser } from './authHelpers';

// Session management
export { sessionService, getCurrentUser, getSession, onAuthStateChange } from './sessionService';

// Profile management
export { authProfileService, ensureProfileExists, updateProfile } from './authProfileService';

// Permissions
export {
    authPermissionsService,
    hasPermission,
    hasAnyPermission,
    getUserRole,
    isAdmin,
    isManagerOrAbove
} from './authPermissionsService';


import { useUser as useUserContext } from '../context/app/UserContext';
import { useOrganization } from '../context/OrganizationContext';

/**
 * Hook موحد للوصول لبيانات المستخدم والشركة
 * يسهل الحصول على companyId
 */
export const useAuthUser = () => {
    const { user, isAuthenticated, isLoading, logout, userRole } = useUserContext();
    const { company } = useOrganization();

    // Fallback: use user.companyId if available (from our modified auth service), 
    // otherwise try context company, otherwise undefined
    const companyId = user?.companyId || company?.id;

    return {
        user,
        userId: user?.id,
        companyId,
        isAuthenticated,
        isLoading,
        logout,
        role: userRole,
        // Helper to check if ready
        isReady: isAuthenticated && !!companyId
    };
};

/**
 * RoleSwitcher - مكون تبديل الدور
 * للتجربة والاختبار - يسمح بتغيير دور المستخدم
 */

import React from 'react';
import { useUser } from '../../context/app/UserContext';
import { useApp } from '../../context/AppContext';
import { Shield, User, Calculator, UserCircle } from 'lucide-react';
import { UserRole } from '../../types/organization';

const RoleSwitcher: React.FC = () => {
    const { userRole, setUserRole, roleName, availableRoles } = useUser();
    const { theme } = useApp();

    const isDark = theme === 'dark';

    const getRoleIcon = (role: UserRole) => {
        switch (role) {
            case 'manager': return <Shield size={16} />;
            case 'accountant': return <Calculator size={16} />;
            case 'employee': return <User size={16} />;
            default: return <UserCircle size={16} />;
        }
    };

    const getRoleColor = (role: UserRole) => {
        switch (role) {
            case 'manager': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
            case 'accountant': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
            case 'employee': return 'text-slate-500 bg-slate-500/10 border-slate-500/30';
            default: return 'text-slate-400';
        }
    };

    return (
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                    <Shield className="text-purple-500" size={20} />
                </div>
                <div>
                    <h3 className={`font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        الدور الحالي
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        اختر الدور لتجربة الصلاحيات المختلفة
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {availableRoles.map((role) => (
                    <button
                        key={role.id}
                        onClick={() => setUserRole(role.id)}
                        className={`
                            p-4 rounded-xl border-2 transition-all duration-200
                            flex flex-col items-center gap-2
                            ${userRole === role.id
                                ? getRoleColor(role.id)
                                : isDark
                                    ? 'border-slate-700 hover:border-slate-600 text-slate-400'
                                    : 'border-slate-200 hover:border-slate-300 text-slate-500'
                            }
                        `}
                    >
                        <div className={`p-2 rounded-lg ${userRole === role.id ? 'bg-white/20' : isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            {getRoleIcon(role.id)}
                        </div>
                        <span className="font-bold text-sm">{role.name}</span>
                        {userRole === role.id && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20">
                                ✓ نشط
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                <p className={`text-xs ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                    <strong>ملاحظة:</strong> تغيير الدور سيؤثر على الصلاحيات المتاحة لك في التطبيق.
                    بعض الأزرار والصفحات قد تختفي أو تظهر حسب الدور.
                </p>
            </div>
        </div>
    );
};

export default RoleSwitcher;

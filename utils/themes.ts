/**
 * Premium Themes - ثيمات راقية للتطبيق
 * مجموعة ثيمات احترافية للوضع الليلي
 */

export interface ThemeColors {
    // الألوان الأساسية
    primary: string;
    primaryLight: string;
    primaryDark: string;

    // خلفيات
    bgPrimary: string;
    bgSecondary: string;
    bgTertiary: string;
    bgCard: string;
    bgHover: string;

    // نصوص
    textPrimary: string;
    textSecondary: string;
    textMuted: string;

    // حدود
    border: string;
    borderLight: string;
    borderFocus: string;

    // حالات
    success: string;
    warning: string;
    error: string;
    info: string;

    // تأثيرات
    glow: string;
    shadow: string;
    gradient: string;

    // أكسنت
    accent: string;
    accentLight: string;
}

export interface PremiumTheme {
    id: string;
    name: string;
    nameAr: string;
    description: string;
    mode: 'dark' | 'light';
    colors: ThemeColors;
    preview: {
        primary: string;
        secondary: string;
        accent: string;
    };
}

// ===== الثيمات المُعرفة =====

export const premiumThemes: PremiumTheme[] = [
    // 1. Midnight Ocean - محيط منتصف الليل
    {
        id: 'midnight-ocean',
        name: 'Midnight Ocean',
        nameAr: 'محيط منتصف الليل',
        description: 'أزرق عميق مع لمسات سماوية',
        mode: 'dark',
        colors: {
            primary: '#3b82f6',
            primaryLight: '#60a5fa',
            primaryDark: '#1d4ed8',
            bgPrimary: '#0a0f1a',
            bgSecondary: '#0f172a',
            bgTertiary: '#1e293b',
            bgCard: '#0f172a',
            bgHover: '#1e3a5f',
            textPrimary: '#f1f5f9',
            textSecondary: '#94a3b8',
            textMuted: '#64748b',
            border: '#1e3a5f',
            borderLight: '#334155',
            borderFocus: '#3b82f6',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#06b6d4',
            glow: 'rgba(59, 130, 246, 0.3)',
            shadow: 'rgba(0, 0, 0, 0.5)',
            gradient: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
            accent: '#06b6d4',
            accentLight: '#22d3ee'
        },
        preview: { primary: '#0f172a', secondary: '#3b82f6', accent: '#06b6d4' }
    },

    // 2. Royal Purple - أرجواني ملكي
    {
        id: 'royal-purple',
        name: 'Royal Purple',
        nameAr: 'أرجواني ملكي',
        description: 'بنفسجي فاخر مع لمعة ذهبية',
        mode: 'dark',
        colors: {
            primary: '#8b5cf6',
            primaryLight: '#a78bfa',
            primaryDark: '#7c3aed',
            bgPrimary: '#0d0a1a',
            bgSecondary: '#1a1625',
            bgTertiary: '#2d2640',
            bgCard: '#1a1625',
            bgHover: '#3d3360',
            textPrimary: '#f5f3ff',
            textSecondary: '#c4b5fd',
            textMuted: '#8b7fc7',
            border: '#3d3360',
            borderLight: '#4c4070',
            borderFocus: '#8b5cf6',
            success: '#10b981',
            warning: '#fbbf24',
            error: '#f43f5e',
            info: '#a855f7',
            glow: 'rgba(139, 92, 246, 0.3)',
            shadow: 'rgba(13, 10, 26, 0.6)',
            gradient: 'linear-gradient(135deg, #3d3360 0%, #1a1625 100%)',
            accent: '#f59e0b',
            accentLight: '#fbbf24'
        },
        preview: { primary: '#1a1625', secondary: '#8b5cf6', accent: '#f59e0b' }
    },

    // 3. Emerald Night - ليل الزمرد
    {
        id: 'emerald-night',
        name: 'Emerald Night',
        nameAr: 'ليل الزمرد',
        description: 'أخضر زمردي راقي',
        mode: 'dark',
        colors: {
            primary: '#10b981',
            primaryLight: '#34d399',
            primaryDark: '#059669',
            bgPrimary: '#0a1410',
            bgSecondary: '#0f1f18',
            bgTertiary: '#1a2f25',
            bgCard: '#0f1f18',
            bgHover: '#1a3f30',
            textPrimary: '#ecfdf5',
            textSecondary: '#6ee7b7',
            textMuted: '#4ade80',
            border: '#1a3f30',
            borderLight: '#2d5040',
            borderFocus: '#10b981',
            success: '#22c55e',
            warning: '#eab308',
            error: '#ef4444',
            info: '#14b8a6',
            glow: 'rgba(16, 185, 129, 0.3)',
            shadow: 'rgba(10, 20, 16, 0.6)',
            gradient: 'linear-gradient(135deg, #1a3f30 0%, #0f1f18 100%)',
            accent: '#22d3ee',
            accentLight: '#67e8f9'
        },
        preview: { primary: '#0f1f18', secondary: '#10b981', accent: '#22d3ee' }
    },

    // 4. Rose Gold - وردي ذهبي
    {
        id: 'rose-gold',
        name: 'Rose Gold',
        nameAr: 'وردي ذهبي',
        description: 'وردي دافئ مع لمسات ذهبية',
        mode: 'dark',
        colors: {
            primary: '#f43f5e',
            primaryLight: '#fb7185',
            primaryDark: '#e11d48',
            bgPrimary: '#1a0a10',
            bgSecondary: '#25101a',
            bgTertiary: '#3d1a2a',
            bgCard: '#25101a',
            bgHover: '#4d2535',
            textPrimary: '#fff1f2',
            textSecondary: '#fda4af',
            textMuted: '#fb7185',
            border: '#4d2535',
            borderLight: '#6d3545',
            borderFocus: '#f43f5e',
            success: '#22c55e',
            warning: '#fbbf24',
            error: '#ef4444',
            info: '#ec4899',
            glow: 'rgba(244, 63, 94, 0.3)',
            shadow: 'rgba(26, 10, 16, 0.6)',
            gradient: 'linear-gradient(135deg, #4d2535 0%, #25101a 100%)',
            accent: '#f59e0b',
            accentLight: '#fbbf24'
        },
        preview: { primary: '#25101a', secondary: '#f43f5e', accent: '#f59e0b' }
    },

    // 5. Carbon Steel - فولاذ كربوني
    {
        id: 'carbon-steel',
        name: 'Carbon Steel',
        nameAr: 'فولاذ كربوني',
        description: 'رمادي معدني احترافي',
        mode: 'dark',
        colors: {
            primary: '#6366f1',
            primaryLight: '#818cf8',
            primaryDark: '#4f46e5',
            bgPrimary: '#09090b',
            bgSecondary: '#18181b',
            bgTertiary: '#27272a',
            bgCard: '#18181b',
            bgHover: '#3f3f46',
            textPrimary: '#fafafa',
            textSecondary: '#a1a1aa',
            textMuted: '#71717a',
            border: '#3f3f46',
            borderLight: '#52525b',
            borderFocus: '#6366f1',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#0ea5e9',
            glow: 'rgba(99, 102, 241, 0.3)',
            shadow: 'rgba(0, 0, 0, 0.7)',
            gradient: 'linear-gradient(135deg, #27272a 0%, #09090b 100%)',
            accent: '#06b6d4',
            accentLight: '#22d3ee'
        },
        preview: { primary: '#18181b', secondary: '#6366f1', accent: '#06b6d4' }
    },

    // 6. Neon Cyber - سايبر نيون
    {
        id: 'neon-cyber',
        name: 'Neon Cyber',
        nameAr: 'سايبر نيون',
        description: 'مستقبلي مع إضاءة نيون',
        mode: 'dark',
        colors: {
            primary: '#00ffff',
            primaryLight: '#67ffff',
            primaryDark: '#00cccc',
            bgPrimary: '#050810',
            bgSecondary: '#0a1020',
            bgTertiary: '#101830',
            bgCard: '#0a1020',
            bgHover: '#152040',
            textPrimary: '#e0ffff',
            textSecondary: '#80ffff',
            textMuted: '#40cccc',
            border: '#00ffff30',
            borderLight: '#00ffff50',
            borderFocus: '#00ffff',
            success: '#00ff88',
            warning: '#ffcc00',
            error: '#ff0066',
            info: '#00ccff',
            glow: 'rgba(0, 255, 255, 0.4)',
            shadow: 'rgba(0, 0, 0, 0.8)',
            gradient: 'linear-gradient(135deg, #152040 0%, #0a1020 100%)',
            accent: '#ff00ff',
            accentLight: '#ff66ff'
        },
        preview: { primary: '#0a1020', secondary: '#00ffff', accent: '#ff00ff' }
    },

    // 7. Sunset Amber - غروب العنبر
    {
        id: 'sunset-amber',
        name: 'Sunset Amber',
        nameAr: 'غروب العنبر',
        description: 'برتقالي دافئ مريح للعين',
        mode: 'dark',
        colors: {
            primary: '#f59e0b',
            primaryLight: '#fbbf24',
            primaryDark: '#d97706',
            bgPrimary: '#1a1208',
            bgSecondary: '#251a0c',
            bgTertiary: '#3d2a14',
            bgCard: '#251a0c',
            bgHover: '#4d3820',
            textPrimary: '#fffbeb',
            textSecondary: '#fcd34d',
            textMuted: '#fbbf24',
            border: '#4d3820',
            borderLight: '#6d4830',
            borderFocus: '#f59e0b',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#fb923c',
            glow: 'rgba(245, 158, 11, 0.3)',
            shadow: 'rgba(26, 18, 8, 0.6)',
            gradient: 'linear-gradient(135deg, #4d3820 0%, #251a0c 100%)',
            accent: '#ef4444',
            accentLight: '#f87171'
        },
        preview: { primary: '#251a0c', secondary: '#f59e0b', accent: '#ef4444' }
    },

    // 8. Arctic Ice - جليد القطب
    {
        id: 'arctic-ice',
        name: 'Arctic Ice',
        nameAr: 'جليد القطب',
        description: 'أبيض مزرق بارد وأنيق',
        mode: 'dark',
        colors: {
            primary: '#38bdf8',
            primaryLight: '#7dd3fc',
            primaryDark: '#0ea5e9',
            bgPrimary: '#0c1520',
            bgSecondary: '#132030',
            bgTertiary: '#1c3045',
            bgCard: '#132030',
            bgHover: '#25405a',
            textPrimary: '#f0f9ff',
            textSecondary: '#bae6fd',
            textMuted: '#7dd3fc',
            border: '#25405a',
            borderLight: '#35506a',
            borderFocus: '#38bdf8',
            success: '#22d3ee',
            warning: '#fbbf24',
            error: '#f43f5e',
            info: '#38bdf8',
            glow: 'rgba(56, 189, 248, 0.3)',
            shadow: 'rgba(12, 21, 32, 0.6)',
            gradient: 'linear-gradient(135deg, #25405a 0%, #132030 100%)',
            accent: '#a5f3fc',
            accentLight: '#cffafe'
        },
        preview: { primary: '#132030', secondary: '#38bdf8', accent: '#a5f3fc' }
    }
];

// الثيم الافتراضي
export const defaultTheme = premiumThemes[0];

// الحصول على ثيم بالمعرف
export const getThemeById = (id: string): PremiumTheme => {
    return premiumThemes.find(t => t.id === id) || defaultTheme;
};

// تطبيق الثيم على CSS Variables
export const applyTheme = (theme: PremiumTheme): void => {
    const root = document.documentElement;
    const { colors } = theme;

    // تفعيل كلاس الثيم لتطبيق التجاوزات في CSS
    root.classList.add('theme-active');

    // الألوان الأساسية
    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-primary-light', colors.primaryLight);
    root.style.setProperty('--theme-primary-dark', colors.primaryDark);

    // الخلفيات
    root.style.setProperty('--theme-bg-primary', colors.bgPrimary);
    root.style.setProperty('--theme-bg-secondary', colors.bgSecondary);
    root.style.setProperty('--theme-bg-tertiary', colors.bgTertiary);
    root.style.setProperty('--theme-bg-card', colors.bgCard);
    root.style.setProperty('--theme-bg-hover', colors.bgHover);

    // النصوص
    root.style.setProperty('--theme-text-primary', colors.textPrimary);
    root.style.setProperty('--theme-text-secondary', colors.textSecondary);
    root.style.setProperty('--theme-text-muted', colors.textMuted);

    // الحدود
    root.style.setProperty('--theme-border', colors.border);
    root.style.setProperty('--theme-border-light', colors.borderLight);
    root.style.setProperty('--theme-border-focus', colors.borderFocus);

    // الحالات
    root.style.setProperty('--theme-success', colors.success);
    root.style.setProperty('--theme-warning', colors.warning);
    root.style.setProperty('--theme-error', colors.error);
    root.style.setProperty('--theme-info', colors.info);

    // التأثيرات
    root.style.setProperty('--theme-glow', colors.glow);
    root.style.setProperty('--theme-shadow', colors.shadow);
    root.style.setProperty('--theme-gradient', colors.gradient);

    // أكسنت
    root.style.setProperty('--theme-accent', colors.accent);
    root.style.setProperty('--theme-accent-light', colors.accentLight);
};

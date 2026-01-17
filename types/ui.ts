
export interface UIPreferences {
    primaryColor: string;
    fontFamily: 'Cairo' | 'Inter' | 'system-ui';
    baseFontSize: number;
    cardRounding: number;
    sidebarWidth: number;
    gridDensity: 'compact' | 'comfortable' | 'spacious';
    showDashboardStats: boolean;
    showDashboardCharts: boolean;
    showRecentTransactions: boolean;
    showExpenseAnalysis: boolean;
    showSidebarIcons: boolean;
}

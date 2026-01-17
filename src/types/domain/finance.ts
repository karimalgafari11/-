
export interface TaxRate {
    id: string;
    name: string;
    rate: number; // 0.15 for 15%
    isDefault: boolean;
}

export interface FinancialPeriod {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isClosed: boolean;
    closedAt?: string;
}

export interface BaseTransaction {
    id: string;
    date: string;
    amount: number;
    currency: string;
    description: string;
}

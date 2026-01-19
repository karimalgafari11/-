
export interface Customer {
    id: string;
    company_id?: string;  // إضافة للتوافق مع Supabase
    name: string;
    companyName?: string;
    category?: string;
    phone?: string;  // جعل اختياري للتوافق مع Supabase
    email?: string;
    taxNumber?: string;
    address?: string;
    balance?: number;
    notes?: string;
    isActive?: boolean;
    status?: 'active' | 'inactive' | 'late';
    createdAt?: string;
    updatedAt?: string;
    /** هل هذا الزبون العام (الافتراضي) */
    isGeneral?: boolean;
    /** هل يُمنع البيع الآجل لهذا العميل (نقدي فقط) */
    cashOnly?: boolean;
}

/** الزبون العام الافتراضي */
export const GENERAL_CUSTOMER: Customer = {
    id: 'general-customer',
    name: 'زبون عام',
    companyName: '',
    category: '',
    phone: '',
    status: 'active',
    isGeneral: true,
    cashOnly: true // الزبون العام نقدي فقط
};


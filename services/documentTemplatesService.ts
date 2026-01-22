/**
 * Document Templates Service - خدمة قوالب المستندات
 * CRUD operations for document_templates table
 */

import { supabase } from '../lib/supabaseClient';
import { companyService } from './companyService';
import type { DocumentTemplate, Insert, Update } from '../types/supabase-helpers';

export type TemplateType = 'invoice' | 'quotation' | 'receipt' | 'po';

export const documentTemplatesService = {
    /**
     * جلب جميع القوالب
     */
    async getAll(): Promise<DocumentTemplate[]> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) {
                console.warn('No company ID found');
                return [];
            }

            const { data, error } = await (supabase as any)
                .from('document_templates')
                .select('*')
                .eq('company_id', companyId)
                .order('name');

            if (error) {
                console.error('Error fetching document templates:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getAll document templates:', error);
            return [];
        }
    },

    /**
     * جلب القوالب حسب النوع
     */
    async getByType(type: TemplateType): Promise<DocumentTemplate[]> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return [];

            const { data, error } = await (supabase as any)
                .from('document_templates')
                .select('*')
                .eq('company_id', companyId)
                .eq('type', type)
                .order('is_default', { ascending: false });

            if (error) return [];
            return data || [];
        } catch {
            return [];
        }
    },

    /**
     * جلب القالب الافتراضي لنوع معين
     */
    async getDefault(type: TemplateType): Promise<DocumentTemplate | null> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return null;

            const { data, error } = await (supabase as any)
                .from('document_templates')
                .select('*')
                .eq('company_id', companyId)
                .eq('type', type)
                .eq('is_default', true)
                .single();

            if (error) return null;
            return data;
        } catch {
            return null;
        }
    },

    /**
     * جلب قالب واحد
     */
    async getById(id: string): Promise<DocumentTemplate | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('document_templates')
                .select('*')
                .eq('id', id)
                .single();

            if (error) return null;
            return data;
        } catch {
            return null;
        }
    },

    /**
     * إنشاء قالب جديد
     */
    async create(template: Omit<Insert<'document_templates'>, 'company_id'>): Promise<DocumentTemplate | null> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) {
                console.error('No company ID found');
                return null;
            }

            const { data, error } = await (supabase as any)
                .from('document_templates')
                .insert({
                    ...template,
                    company_id: companyId
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating document template:', error);
                return null;
            }

            console.log('✅ Document template created:', data.id);
            return data;
        } catch (error) {
            console.error('Error in create document template:', error);
            return null;
        }
    },

    /**
     * تحديث قالب
     */
    async update(id: string, updates: Update<'document_templates'>): Promise<DocumentTemplate | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('document_templates')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating document template:', error);
                return null;
            }

            return data;
        } catch {
            return null;
        }
    },

    /**
     * تعيين قالب كافتراضي
     */
    async setDefault(id: string, type: TemplateType): Promise<boolean> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return false;

            // Remove default from other templates of same type
            await (supabase as any)
                .from('document_templates')
                .update({ is_default: false })
                .eq('company_id', companyId)
                .eq('type', type);

            // Set this one as default
            const { error } = await (supabase as any)
                .from('document_templates')
                .update({ is_default: true })
                .eq('id', id);

            if (error) {
                console.error('Error setting default template:', error);
                return false;
            }

            return true;
        } catch {
            return false;
        }
    },

    /**
     * حذف قالب
     */
    async delete(id: string): Promise<boolean> {
        try {
            const { error } = await (supabase as any)
                .from('document_templates')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting document template:', error);
                return false;
            }

            return true;
        } catch {
            return false;
        }
    }
};

export default documentTemplatesService;

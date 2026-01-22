/**
 * Projects Service - خدمة المشاريع
 */

import { supabase, generateUUID, getCurrentTimestamp } from '../lib/supabaseClient';
import { companyService } from './companyService';

export type ProjectStatus = 'draft' | 'pending' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Project {
    id: string;
    company_id: string;
    code: string;
    name: string;
    description?: string;
    project_type?: string;
    category?: string;
    start_date?: string;
    end_date?: string;
    budget?: number;
    actual_cost?: number;
    status: ProjectStatus;
    progress_percent?: number;
    manager_id?: string;
    customer_id?: string;
    notes?: string;
    created_at: string;
}

export interface Task {
    id: string;
    company_id: string;
    project_id?: string;
    parent_id?: string;
    title: string;
    description?: string;
    priority: Priority;
    status: TaskStatus;
    due_date?: string;
    estimated_hours?: number;
    actual_hours?: number;
    assignee_id?: string;
    created_at: string;
}

export const projectsService = {
    /**
     * جلب جميع المشاريع
     */
    async getAll(status?: ProjectStatus): Promise<Project[]> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return [];

            let query = (supabase as any)
                .from('projects')
                .select('*')
                .eq('company_id', companyId)
                .order('created_at', { ascending: false });

            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query;
            if (error) return [];
            return data || [];
        } catch {
            return [];
        }
    },

    /**
     * إنشاء مشروع
     */
    async create(project: {
        code: string;
        name: string;
        description?: string;
        start_date?: string;
        end_date?: string;
        budget?: number;
        manager_id?: string;
        customer_id?: string;
    }): Promise<Project | null> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return null;

            const { data, error } = await (supabase as any)
                .from('projects')
                .insert({
                    id: generateUUID(),
                    company_id: companyId,
                    ...project,
                    status: 'draft',
                    progress_percent: 0,
                    created_at: getCurrentTimestamp()
                })
                .select()
                .single();

            if (error) return null;
            return data;
        } catch {
            return null;
        }
    },

    /**
     * تحديث حالة المشروع
     */
    async updateStatus(id: string, status: ProjectStatus): Promise<boolean> {
        try {
            const { error } = await (supabase as any)
                .from('projects')
                .update({ status, updated_at: getCurrentTimestamp() })
                .eq('id', id);
            return !error;
        } catch {
            return false;
        }
    },

    /**
     * جلب مهام مشروع
     */
    async getProjectTasks(projectId: string): Promise<Task[]> {
        try {
            const { data, error } = await (supabase as any)
                .from('tasks')
                .select('*')
                .eq('project_id', projectId)
                .order('created_at');

            if (error) return [];
            return data || [];
        } catch {
            return [];
        }
    },

    /**
     * إنشاء مهمة
     */
    async createTask(task: {
        project_id?: string;
        title: string;
        description?: string;
        priority?: Priority;
        due_date?: string;
        assignee_id?: string;
    }): Promise<Task | null> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return null;

            const { data, error } = await (supabase as any)
                .from('tasks')
                .insert({
                    id: generateUUID(),
                    company_id: companyId,
                    project_id: task.project_id,
                    title: task.title,
                    description: task.description,
                    priority: task.priority || 'medium',
                    status: 'todo',
                    due_date: task.due_date,
                    assignee_id: task.assignee_id,
                    created_at: getCurrentTimestamp()
                })
                .select()
                .single();

            if (error) return null;
            return data;
        } catch {
            return null;
        }
    },

    /**
     * تحديث حالة مهمة
     */
    async updateTaskStatus(taskId: string, status: TaskStatus): Promise<boolean> {
        try {
            const { error } = await (supabase as any)
                .from('tasks')
                .update({ status, updated_at: getCurrentTimestamp() })
                .eq('id', taskId);
            return !error;
        } catch {
            return false;
        }
    }
};

export default projectsService;

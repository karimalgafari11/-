/**
 * Product Service - خدمة المنتجات
 * التعامل مع جدول products في Supabase
 */

// Supabase disabled - working with local storage only
const isSupabaseConfigured = () => false;
const getSupabaseClient = (): any => null;
import { SafeStorage } from '../utils/storage';
import { ActivityLogger } from './activityLogger';
import { SyncService } from './syncService';
import type { Product, ProductStock, Category, InsertType, UpdateType } from '../types/database';

const PRODUCTS_KEY = 'alzhra_products';
const CATEGORIES_KEY = 'alzhra_categories';
const STOCK_KEY = 'alzhra_product_stock';

export const ProductService = {
    // ========================================
    // PRODUCTS
    // ========================================

    /**
     * جلب جميع المنتجات
     */
    async getProducts(organizationId: string): Promise<Product[]> {
        // جلب من Supabase أولاً
        if (isSupabaseConfigured() && navigator.onLine) {
            const client = getSupabaseClient();
            if (client) {
                try {
                    const { data, error } = await client
                        .from('products')
                        .select('*')
                        .eq('organization_id', organizationId)
                        .is('deleted_at', null)
                        .order('name');

                    if (!error && data) {
                        SafeStorage.set(PRODUCTS_KEY, data);
                        return data;
                    }
                } catch (err) {
                    console.error('Error fetching products:', err);
                }
            }
        }

        // Fallback للتخزين المحلي
        const local = SafeStorage.get<Product[]>(PRODUCTS_KEY, []);
        return local.filter(p => p.organization_id === organizationId && !p.deleted_at);
    },

    /**
     * جلب منتج واحد
     */
    async getProduct(id: string): Promise<Product | null> {
        if (isSupabaseConfigured() && navigator.onLine) {
            const client = getSupabaseClient();
            if (client) {
                const { data } = await client
                    .from('products')
                    .select('*')
                    .eq('id', id)
                    .single();
                return data;
            }
        }

        const local = SafeStorage.get<Product[]>(PRODUCTS_KEY, []);
        return local.find(p => p.id === id) || null;
    },

    /**
     * إنشاء منتج جديد
     */
    async createProduct(
        product: InsertType<Product>,
        context: { userId: string; branchId: string; userName?: string }
    ): Promise<Product> {
        const now = new Date().toISOString();
        const newProduct: Product = {
            ...product,
            id: product.id || `prod_${Date.now()}`,
            created_at: now,
            updated_at: now,
        } as Product;

        // حفظ محلياً
        const local = SafeStorage.get<Product[]>(PRODUCTS_KEY, []);
        local.push(newProduct);
        SafeStorage.set(PRODUCTS_KEY, local);

        // تسجيل النشاط
        ActivityLogger.log({
            action: 'create',
            entityType: 'product',
            entityId: newProduct.id,
            entityName: newProduct.name,
            userId: context.userId,
            userName: context.userName || 'مستخدم',
            organizationId: newProduct.organization_id,
            branchId: context.branchId,
            newData: newProduct as unknown as Record<string, unknown>
        });

        // المزامنة
        if (isSupabaseConfigured() && navigator.onLine) {
            const client = getSupabaseClient();
            if (client) {
                try {
                    await client.from('products').insert(newProduct);
                } catch (err) {
                    console.error('Error inserting product:', err);
                    SyncService.addToQueue({
                        operation: 'create',
                        entityType: 'products',
                        entityId: newProduct.id,
                        data: newProduct as unknown as Record<string, unknown>,
                        userId: context.userId,
                        branchId: context.branchId
                    });
                }
            }
        } else {
            SyncService.addToQueue({
                operation: 'create',
                entityType: 'products',
                entityId: newProduct.id,
                data: newProduct as unknown as Record<string, unknown>,
                userId: context.userId,
                branchId: context.branchId
            });
        }

        return newProduct;
    },

    /**
     * تحديث منتج
     */
    async updateProduct(
        id: string,
        updates: UpdateType<Product>,
        context: { userId: string; branchId: string; userName?: string }
    ): Promise<Product | null> {
        const local = SafeStorage.get<Product[]>(PRODUCTS_KEY, []);
        const index = local.findIndex(p => p.id === id);

        if (index === -1) return null;

        const oldData = { ...local[index] };
        const updatedProduct: Product = {
            ...local[index],
            ...updates,
            updated_at: new Date().toISOString()
        };

        local[index] = updatedProduct;
        SafeStorage.set(PRODUCTS_KEY, local);

        // تسجيل النشاط
        ActivityLogger.log({
            action: 'update',
            entityType: 'product',
            entityId: id,
            entityName: updatedProduct.name,
            userId: context.userId,
            userName: context.userName || 'مستخدم',
            organizationId: updatedProduct.organization_id,
            branchId: context.branchId,
            oldData: oldData as unknown as Record<string, unknown>,
            newData: updatedProduct as unknown as Record<string, unknown>
        });

        // المزامنة
        if (isSupabaseConfigured() && navigator.onLine) {
            const client = getSupabaseClient();
            if (client) {
                try {
                    await client.from('products').update(updates).eq('id', id);
                } catch (err) {
                    console.error('Error updating product:', err);
                    SyncService.addToQueue({
                        operation: 'update',
                        entityType: 'products',
                        entityId: id,
                        data: updates as unknown as Record<string, unknown>,
                        userId: context.userId,
                        branchId: context.branchId
                    });
                }
            }
        } else {
            SyncService.addToQueue({
                operation: 'update',
                entityType: 'products',
                entityId: id,
                data: updates as unknown as Record<string, unknown>,
                userId: context.userId,
                branchId: context.branchId
            });
        }

        return updatedProduct;
    },

    /**
     * حذف منتج (Soft Delete)
     */
    async deleteProduct(
        id: string,
        context: { userId: string; branchId: string; userName?: string }
    ): Promise<boolean> {
        return this.updateProduct(id, { deleted_at: new Date().toISOString() }, context) !== null;
    },

    // ========================================
    // STOCK
    // ========================================

    /**
     * جلب مخزون منتج في فرع
     */
    async getProductStock(productId: string, branchId: string): Promise<ProductStock | null> {
        if (isSupabaseConfigured() && navigator.onLine) {
            const client = getSupabaseClient();
            if (client) {
                const { data } = await client
                    .from('product_stock')
                    .select('*')
                    .eq('product_id', productId)
                    .eq('branch_id', branchId)
                    .single();
                return data;
            }
        }

        const local = SafeStorage.get<ProductStock[]>(STOCK_KEY, []);
        return local.find(s => s.product_id === productId && s.branch_id === branchId) || null;
    },

    /**
     * جلب مخزون فرع كامل
     */
    async getBranchStock(branchId: string): Promise<ProductStock[]> {
        if (isSupabaseConfigured() && navigator.onLine) {
            const client = getSupabaseClient();
            if (client) {
                const { data } = await client
                    .from('product_stock')
                    .select('*')
                    .eq('branch_id', branchId);
                if (data) return data;
            }
        }

        const local = SafeStorage.get<ProductStock[]>(STOCK_KEY, []);
        return local.filter(s => s.branch_id === branchId);
    },

    // ========================================
    // CATEGORIES
    // ========================================

    /**
     * جلب التصنيفات
     */
    async getCategories(organizationId: string): Promise<Category[]> {
        if (isSupabaseConfigured() && navigator.onLine) {
            const client = getSupabaseClient();
            if (client) {
                const { data } = await client
                    .from('categories')
                    .select('*')
                    .eq('organization_id', organizationId)
                    .is('deleted_at', null)
                    .order('sort_order');
                if (data) {
                    SafeStorage.set(CATEGORIES_KEY, data);
                    return data;
                }
            }
        }

        const local = SafeStorage.get<Category[]>(CATEGORIES_KEY, []);
        return local.filter(c => c.organization_id === organizationId && !c.deleted_at);
    },

    /**
     * إنشاء تصنيف
     */
    async createCategory(
        category: InsertType<Category>,
        context: { userId: string; branchId: string }
    ): Promise<Category> {
        const now = new Date().toISOString();
        const newCategory: Category = {
            ...category,
            id: category.id || `cat_${Date.now()}`,
            created_at: now,
            updated_at: now,
        } as Category;

        const local = SafeStorage.get<Category[]>(CATEGORIES_KEY, []);
        local.push(newCategory);
        SafeStorage.set(CATEGORIES_KEY, local);

        if (isSupabaseConfigured() && navigator.onLine) {
            const client = getSupabaseClient();
            if (client) {
                try {
                    await client.from('categories').insert(newCategory);
                } catch (err) {
                    console.error('Error inserting category:', err);
                }
            }
        }

        return newCategory;
    },

    /**
     * البحث في المنتجات
     */
    async searchProducts(
        organizationId: string,
        query: string
    ): Promise<Product[]> {
        const allProducts = await this.getProducts(organizationId);
        const lowerQuery = query.toLowerCase();

        return allProducts.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.sku.toLowerCase().includes(lowerQuery) ||
            (p.barcode && p.barcode.includes(query))
        );
    },

    /**
     * جلب المنتجات التي تحتاج إعادة طلب
     */
    async getLowStockProducts(branchId: string): Promise<Array<Product & { stock: ProductStock }>> {
        const stock = await this.getBranchStock(branchId);
        const products = SafeStorage.get<Product[]>(PRODUCTS_KEY, []);

        const lowStock: Array<Product & { stock: ProductStock }> = [];

        for (const s of stock) {
            const product = products.find(p => p.id === s.product_id);
            if (product && product.track_inventory && s.quantity <= product.reorder_point) {
                lowStock.push({ ...product, stock: s });
            }
        }

        return lowStock;
    }
};

/**
 * Local Storage Client - عميل التخزين المحلي
 * بديل لـ Supabase يستخدم localStorage و IndexedDB
 */

// توليد UUID محلي
export function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// الحصول على الوقت الحالي بصيغة ISO
export function getCurrentTimestamp(): string {
    return new Date().toISOString();
}

// واجهة نتيجة الاستعلام
interface QueryResult<T> {
    data: T | null;
    error: { message: string; code?: string } | null;
}

// واجهة خيارات الاستعلام
interface QueryOptions {
    column?: string;
    value?: unknown;
    ascending?: boolean;
    orderColumn?: string;
    limitCount?: number;
}

// مفتاح التخزين الأساسي
const STORAGE_PREFIX = 'alzhra_local_';

// الحصول على البيانات من localStorage
function getTableData<T>(table: string): T[] {
    try {
        const data = localStorage.getItem(STORAGE_PREFIX + table);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

// حفظ البيانات في localStorage
function setTableData<T>(table: string, data: T[]): void {
    localStorage.setItem(STORAGE_PREFIX + table, JSON.stringify(data));
}

// فئة بناء الاستعلامات
class QueryBuilder<T extends Record<string, unknown>> {
    private table: string;
    private filters: Array<{ column: string; operator: string; value: unknown }> = [];
    private orderByColumn: string | null = null;
    private orderAscending = true;
    private limitCount: number | null = null;
    private selectColumns: string[] | null = null;
    private isSingle = false;

    constructor(table: string) {
        this.table = table;
    }

    select(columns: string = '*'): this {
        if (columns !== '*') {
            this.selectColumns = columns.split(',').map(c => c.trim());
        }
        return this;
    }

    eq(column: string, value: unknown): this {
        this.filters.push({ column, operator: 'eq', value });
        return this;
    }

    neq(column: string, value: unknown): this {
        this.filters.push({ column, operator: 'neq', value });
        return this;
    }

    gt(column: string, value: unknown): this {
        this.filters.push({ column, operator: 'gt', value });
        return this;
    }

    gte(column: string, value: unknown): this {
        this.filters.push({ column, operator: 'gte', value });
        return this;
    }

    lt(column: string, value: unknown): this {
        this.filters.push({ column, operator: 'lt', value });
        return this;
    }

    lte(column: string, value: unknown): this {
        this.filters.push({ column, operator: 'lte', value });
        return this;
    }

    like(column: string, pattern: string): this {
        this.filters.push({ column, operator: 'like', value: pattern });
        return this;
    }

    ilike(column: string, pattern: string): this {
        this.filters.push({ column, operator: 'ilike', value: pattern });
        return this;
    }

    in(column: string, values: unknown[]): this {
        this.filters.push({ column, operator: 'in', value: values });
        return this;
    }

    is(column: string, value: null | boolean): this {
        this.filters.push({ column, operator: 'is', value });
        return this;
    }

    // دعم فلتر OR - مثال: .or('name.ilike.%test%,phone.ilike.%test%')
    or(filterString: string): this {
        this.filters.push({ column: '_or_', operator: 'or', value: filterString });
        return this;
    }

    order(column: string, options?: { ascending?: boolean }): this {
        this.orderByColumn = column;
        this.orderAscending = options?.ascending ?? true;
        return this;
    }

    limit(count: number): this {
        this.limitCount = count;
        return this;
    }

    single(): this {
        this.isSingle = true;
        this.limitCount = 1;
        return this;
    }

    maybeSingle(): this {
        this.isSingle = true;
        this.limitCount = 1;
        return this;
    }

    // للتوافق مع Supabase - لا يفعل شيء محلياً
    abortSignal(signal: AbortSignal): this {
        return this;
    }

    private applyFilter(item: T, filter: { column: string; operator: string; value: unknown }): boolean {
        const filterValue = filter.value;

        // معالجة فلتر OR
        if (filter.operator === 'or') {
            const orConditions = String(filterValue).split(',');
            return orConditions.some(condition => {
                const match = condition.match(/^(\w+)\.(\w+)\.(.+)$/);
                if (!match) return false;
                const [, col, op, val] = match;
                const itemValue = item[col];
                const cleanVal = val.replace(/%/g, '');
                if (op === 'ilike') {
                    return String(itemValue || '').toLowerCase().includes(cleanVal.toLowerCase());
                } else if (op === 'like') {
                    return String(itemValue || '').includes(cleanVal);
                } else if (op === 'eq') {
                    return String(itemValue) === cleanVal;
                }
                return false;
            });
        }

        const itemValue = item[filter.column];

        switch (filter.operator) {
            case 'eq':
                return itemValue === filterValue;
            case 'neq':
                return itemValue !== filterValue;
            case 'gt':
                return (itemValue as number) > (filterValue as number);
            case 'gte':
                return (itemValue as number) >= (filterValue as number);
            case 'lt':
                return (itemValue as number) < (filterValue as number);
            case 'lte':
                return (itemValue as number) <= (filterValue as number);
            case 'like':
                return String(itemValue).includes(String(filterValue).replace(/%/g, ''));
            case 'ilike':
                return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase().replace(/%/g, ''));
            case 'in':
                return (filterValue as unknown[]).includes(itemValue);
            case 'is':
                return itemValue === filterValue;
            default:
                return true;
        }
    }

    async then<TResult>(
        onfulfilled?: (value: QueryResult<T[] | T | null>) => TResult
    ): Promise<TResult> {
        let data = getTableData<T>(this.table);

        // تطبيق الفلاتر
        for (const filter of this.filters) {
            data = data.filter(item => this.applyFilter(item, filter));
        }

        // الترتيب
        if (this.orderByColumn) {
            const col = this.orderByColumn;
            const asc = this.orderAscending;
            data.sort((a, b) => {
                const aVal = String(a[col] ?? '');
                const bVal = String(b[col] ?? '');
                if (aVal < bVal) return asc ? -1 : 1;
                if (aVal > bVal) return asc ? 1 : -1;
                return 0;
            });
        }

        // التحديد
        if (this.limitCount !== null) {
            data = data.slice(0, this.limitCount);
        }

        // اختيار الأعمدة
        if (this.selectColumns) {
            const cols = this.selectColumns;
            data = data.map(item => {
                const newItem: Record<string, unknown> = {};
                for (const col of cols) {
                    newItem[col] = item[col];
                }
                return newItem as T;
            });
        }

        let result: QueryResult<T[] | T | null>;

        if (this.isSingle) {
            result = {
                data: data.length > 0 ? data[0] : null,
                error: null
            };
        } else {
            result = {
                data: data,
                error: null
            };
        }

        if (onfulfilled) {
            return onfulfilled(result);
        }
        return result as unknown as TResult;
    }
}

// فئة بناء الإدراج
class InsertBuilder<T extends Record<string, unknown>> {
    private table: string;
    private insertData: Partial<T> | Partial<T>[] | null = null;
    private shouldSelect = false;
    private isSingle = false;

    constructor(table: string) {
        this.table = table;
    }

    insert(data: Partial<T> | Partial<T>[]): this {
        this.insertData = data;
        return this;
    }

    select(): this {
        this.shouldSelect = true;
        return this;
    }

    single(): this {
        this.isSingle = true;
        return this;
    }

    async then<TResult>(
        onfulfilled?: (value: QueryResult<T | T[] | null>) => TResult
    ): Promise<TResult> {
        if (!this.insertData) {
            const result: QueryResult<null> = { data: null, error: { message: 'No data to insert' } };
            if (onfulfilled) return onfulfilled(result as QueryResult<T | T[] | null>);
            return result as unknown as TResult;
        }

        const tableData = getTableData<T>(this.table);
        const now = getCurrentTimestamp();
        const isArray = Array.isArray(this.insertData);
        const dataToInsert: Partial<T>[] = isArray ? (this.insertData as Partial<T>[]) : [this.insertData as Partial<T>];

        const insertedItems: T[] = [];

        for (const item of dataToInsert) {
            const newItem = {
                ...item,
                id: (item as Record<string, unknown>).id || generateUUID(),
                created_at: (item as Record<string, unknown>).created_at || now,
                updated_at: now
            } as unknown as T;
            tableData.push(newItem);
            insertedItems.push(newItem);
        }

        setTableData(this.table, tableData);

        let result: QueryResult<T | T[] | null>;
        if (this.isSingle) {
            result = { data: insertedItems[0] || null, error: null };
        } else if (isArray) {
            result = { data: insertedItems, error: null };
        } else {
            result = { data: insertedItems[0] || null, error: null };
        }

        if (onfulfilled) return onfulfilled(result);
        return result as unknown as TResult;
    }
}

// فئة بناء التحديث
class UpdateBuilder<T extends Record<string, unknown>> {
    private table: string;
    private updateData: Partial<T> | null = null;
    private filters: Array<{ column: string; value: unknown }> = [];
    private shouldSelect = false;
    private isSingle = false;

    constructor(table: string) {
        this.table = table;
    }

    update(data: Partial<T>): this {
        this.updateData = data;
        return this;
    }

    eq(column: string, value: unknown): this {
        this.filters.push({ column, value });
        return this;
    }

    select(): this {
        this.shouldSelect = true;
        return this;
    }

    single(): this {
        this.isSingle = true;
        return this;
    }

    async then<TResult>(
        onfulfilled?: (value: QueryResult<T | T[] | null>) => TResult
    ): Promise<TResult> {
        if (!this.updateData) {
            const result: QueryResult<null> = { data: null, error: { message: 'No data to update' } };
            if (onfulfilled) return onfulfilled(result as QueryResult<T | T[] | null>);
            return result as unknown as TResult;
        }

        const tableData = getTableData<T>(this.table);
        const now = getCurrentTimestamp();
        const updatedItems: T[] = [];

        for (let i = 0; i < tableData.length; i++) {
            let matches = true;
            for (const filter of this.filters) {
                if (tableData[i][filter.column] !== filter.value) {
                    matches = false;
                    break;
                }
            }
            if (matches) {
                tableData[i] = {
                    ...tableData[i],
                    ...this.updateData,
                    updated_at: now
                };
                updatedItems.push(tableData[i]);
            }
        }

        setTableData(this.table, tableData);

        let result: QueryResult<T | T[] | null>;
        if (this.isSingle) {
            result = { data: updatedItems[0] || null, error: null };
        } else {
            result = { data: updatedItems, error: null };
        }

        if (onfulfilled) return onfulfilled(result);
        return result as unknown as TResult;
    }
}

// فئة بناء الحذف
class DeleteBuilder<T extends Record<string, unknown>> {
    private table: string;
    private filters: Array<{ column: string; value: unknown }> = [];

    constructor(table: string) {
        this.table = table;
    }

    eq(column: string, value: unknown): this {
        this.filters.push({ column, value });
        return this;
    }

    in(column: string, values: unknown[]): this {
        this.filters.push({ column, value: values });
        return this;
    }

    async then<TResult>(
        onfulfilled?: (value: QueryResult<null>) => TResult
    ): Promise<TResult> {
        let tableData = getTableData<T>(this.table);

        tableData = tableData.filter(item => {
            for (const filter of this.filters) {
                if (Array.isArray(filter.value)) {
                    if ((filter.value as unknown[]).includes(item[filter.column])) {
                        return false;
                    }
                } else if (item[filter.column] === filter.value) {
                    return false;
                }
            }
            return true;
        });

        setTableData(this.table, tableData);

        const result: QueryResult<null> = { data: null, error: null };
        if (onfulfilled) return onfulfilled(result);
        return result as unknown as TResult;
    }
}

// فئة بناء Upsert
class UpsertBuilder<T extends Record<string, unknown>> {
    private table: string;
    private upsertData: Partial<T> | Partial<T>[] | null = null;
    private onConflictColumn: string = 'id';
    private shouldSelect = false;
    private isSingle = false;

    constructor(table: string) {
        this.table = table;
    }

    upsert(data: Partial<T> | Partial<T>[], options?: { onConflict?: string }): this {
        this.upsertData = data;
        if (options?.onConflict) {
            this.onConflictColumn = options.onConflict;
        }
        return this;
    }

    select(): this {
        this.shouldSelect = true;
        return this;
    }

    single(): this {
        this.isSingle = true;
        return this;
    }

    async then<TResult>(
        onfulfilled?: (value: QueryResult<T | T[] | null>) => TResult
    ): Promise<TResult> {
        if (!this.upsertData) {
            const result: QueryResult<null> = { data: null, error: { message: 'No data to upsert' } };
            if (onfulfilled) return onfulfilled(result as QueryResult<T | T[] | null>);
            return result as unknown as TResult;
        }

        const tableData = getTableData<T>(this.table);
        const now = getCurrentTimestamp();
        const isArray = Array.isArray(this.upsertData);
        const dataToUpsert: Partial<T>[] = isArray ? (this.upsertData as Partial<T>[]) : [this.upsertData as Partial<T>];
        const resultItems: T[] = [];

        for (const item of dataToUpsert) {
            const conflictValue = (item as Record<string, unknown>)[this.onConflictColumn];
            const existingIndex = tableData.findIndex(
                existing => existing[this.onConflictColumn] === conflictValue
            );

            if (existingIndex !== -1) {
                // Update existing
                tableData[existingIndex] = {
                    ...tableData[existingIndex],
                    ...item,
                    updated_at: now
                };
                resultItems.push(tableData[existingIndex]);
            } else {
                // Insert new
                const newItem = {
                    ...item,
                    id: (item as Record<string, unknown>).id || generateUUID(),
                    created_at: now,
                    updated_at: now
                } as unknown as T;
                tableData.push(newItem);
                resultItems.push(newItem);
            }
        }

        setTableData(this.table, tableData);

        let result: QueryResult<T | T[] | null>;
        if (this.isSingle) {
            result = { data: resultItems[0] || null, error: null };
        } else if (isArray) {
            result = { data: resultItems, error: null };
        } else {
            result = { data: resultItems[0] || null, error: null };
        }

        if (onfulfilled) return onfulfilled(result);
        return result as unknown as TResult;
    }
}

// واجهة الجدول
interface TableInterface<T extends Record<string, unknown>> {
    select(columns?: string): QueryBuilder<T>;
    insert(data: Partial<T> | Partial<T>[]): InsertBuilder<T>;
    update(data: Partial<T>): UpdateBuilder<T>;
    delete(): DeleteBuilder<T>;
    upsert(data: Partial<T> | Partial<T>[], options?: { onConflict?: string }): UpsertBuilder<T>;
}

// دالة الوصول للجدول
function from<T extends Record<string, unknown> = Record<string, unknown>>(table: string): TableInterface<T> {
    return {
        select(columns?: string) {
            const builder = new QueryBuilder<T>(table);
            return builder.select(columns || '*');
        },
        insert(data: Partial<T> | Partial<T>[]) {
            const builder = new InsertBuilder<T>(table);
            return builder.insert(data);
        },
        update(data: Partial<T>) {
            const builder = new UpdateBuilder<T>(table);
            return builder.update(data);
        },
        delete() {
            return new DeleteBuilder<T>(table);
        },
        upsert(data: Partial<T> | Partial<T>[], options?: { onConflict?: string }) {
            const builder = new UpsertBuilder<T>(table);
            return builder.upsert(data, options);
        }
    };
}

// استدعاء دالة RPC (للتوافق - يُرجع نتائج فارغة)
async function rpc<T = unknown>(
    functionName: string,
    params?: Record<string, unknown>
): Promise<QueryResult<T>> {
    console.log(`[LocalDB] RPC call to ${functionName} - not implemented locally`);
    return { data: null, error: null };
}

// عميل قاعدة البيانات المحلي
export const db = {
    from,
    rpc,
    auth: {
        // سيتم تنفيذه في localAuthClient
    }
};

// تصدير للتوافق مع الكود الموجود (سيتم إزالته لاحقاً)
export const supabase = db;
export const localDb = db;
export default db;


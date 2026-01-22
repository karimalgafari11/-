
import React, { useState, useEffect } from 'react';
import Modal from '../Common/Modal';
import Button from '../UI/Button';
import { InventoryItem } from '../../types';
import { Save, Package, Plus, Tag } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

interface ItemFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: InventoryItem) => void;
    initialData?: InventoryItem | null;
}

const ItemFormModal: React.FC<ItemFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const { categories, addCategory } = useInventory();
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const defaultForm = {
        name: '',
        itemNumber: '',
        sku: '',
        category: categories[0] || 'عام',
        quantity: 0,
        minQuantity: 5,
        costPrice: 0,
        salePrice: 0,
        unit: 'حبة',
        manufacturer: '',
        specifications: '',
        image_url: '',
        track_stock: true,
        allow_negative_stock: false,
        item_number: '',
        manufacturer_code: '',
        reorder_quantity: 0
    };

    const [formData, setFormData] = useState(defaultForm);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                itemNumber: initialData.itemNumber || '',
                sku: initialData.sku || '',
                category: initialData.category || 'عام',
                quantity: initialData.quantity || 0,
                minQuantity: initialData.minQuantity || 0,
                costPrice: initialData.costPrice || 0,
                salePrice: initialData.salePrice || 0,
                unit: initialData.unit || 'حبة',
                manufacturer: initialData.manufacturer || '',
                specifications: initialData.specifications || '',
                image_url: initialData.image_url || '',
                track_stock: initialData.track_stock ?? true,
                allow_negative_stock: initialData.allow_negative_stock ?? false,
                item_number: initialData.item_number || '',
                manufacturer_code: initialData.manufacturer_code || '',
                reorder_quantity: initialData.reorder_quantity || 0,
            });
        } else {
            setFormData(defaultForm);
        }
    }, [initialData, isOpen]);

    const handleSubmit = () => {
        // تحويل أسماء الحقول لتتطابق مع أعمدة Supabase
        const productData = {
            name: formData.name,
            sku: formData.itemNumber || formData.sku,
            category: formData.category,
            quantity: formData.quantity,
            min_quantity: formData.minQuantity,
            cost: formData.costPrice,  // عمود cost في Supabase
            price: formData.salePrice, // عمود price في Supabase
            unit: formData.unit,
            description: formData.specifications,
            image_url: formData.image_url,
            track_stock: formData.track_stock,
            allow_negative_stock: formData.allow_negative_stock,
            item_number: formData.item_number,
            manufacturer_code: formData.manufacturer_code,
            reorder_quantity: formData.reorder_quantity,
        };
        onSave(productData as any);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "تعديل بيانات الصنف" : "إضافة صنف جديد بالمخزون"} size="lg">
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">اسم الصنف</label>
                        <input
                            type="text"
                            className="w-full p-3 rounded-xl border border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white font-bold text-xs"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">رقم الصنف (SKU)</label>
                        <input
                            type="text"
                            className="w-full p-3 rounded-xl border border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white font-bold text-xs"
                            value={formData.itemNumber}
                            onChange={e => setFormData({ ...formData, itemNumber: e.target.value, sku: e.target.value })}
                        />
                    </div>

                    {/* New Fields: Item No and Mfr Code */}
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">رقم الصنف (Item No)</label>
                        <input
                            type="text"
                            className="w-full p-3 rounded-xl border border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white font-bold text-xs"
                            value={formData.item_number}
                            onChange={e => setFormData({ ...formData, item_number: e.target.value })}
                            placeholder="مثال: 100-200"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">كود المصنع (Mfr Code)</label>
                        <input
                            type="text"
                            className="w-full p-3 rounded-xl border border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white font-bold text-xs"
                            value={formData.manufacturer_code}
                            onChange={e => setFormData({ ...formData, manufacturer_code: e.target.value })}
                            placeholder="مثال: MC-999"
                        />
                    </div>
                    {/* End New Fields */}

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-[9px] font-black text-gray-400 uppercase">نوع الصنف</label>
                            <button
                                type="button"
                                onClick={() => setShowNewCategory(!showNewCategory)}
                                className="flex items-center gap-1 text-[9px] font-bold text-primary hover:text-primary/80 transition-colors"
                            >
                                <Plus size={12} />
                                إضافة نوع جديد
                            </button>
                        </div>

                        {showNewCategory ? (
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                    <input
                                        type="text"
                                        placeholder="اسم النوع الجديد (مثال: فحمات بريك، دينمو، زيوت...)"
                                        className="w-full p-3 pl-9 rounded-xl border border-primary/30 bg-primary/5 dark:bg-primary/10 dark:text-white font-bold text-xs focus:border-primary outline-none"
                                        value={newCategoryName}
                                        onChange={e => setNewCategoryName(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (newCategoryName.trim()) {
                                            addCategory(newCategoryName.trim());
                                            setFormData({ ...formData, category: newCategoryName.trim() });
                                            setNewCategoryName('');
                                            setShowNewCategory(false);
                                        }
                                    }}
                                    disabled={!newCategoryName.trim()}
                                    className="px-4 py-3 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    حفظ
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowNewCategory(false);
                                        setNewCategoryName('');
                                    }}
                                    className="px-3 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <select
                                className="w-full p-3 rounded-xl border border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white font-bold text-xs"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                {categories.length === 0 && <option value="">-- اختر أو أضف نوع جديد --</option>}
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">المصنع / الماركة</label>
                        <input
                            type="text"
                            className="w-full p-3 rounded-xl border border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white font-bold text-xs"
                            value={formData.manufacturer}
                            onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
                        />
                    </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase">الكمية الافتتاحية</label>
                        <input type="number" className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-black"
                            value={formData.quantity}
                            onChange={e => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase">سعر التكلفة</label>
                        <input type="number" className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-black text-rose-600"
                            value={formData.costPrice}
                            onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase">سعر البيع</label>
                        <input type="number" className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-black text-emerald-600"
                            value={formData.salePrice}
                            onChange={e => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase">حد الطلب الآمن</label>
                        <input type="number" className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-black"
                            value={formData.minQuantity}
                            onChange={e => setFormData({ ...formData, minQuantity: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
                </div>

                <Button fullWidth variant="primary" icon={<Save size={18} />} onClick={handleSubmit} disabled={!formData.name}>
                    حفظ بيانات الصنف
                </Button>
            </div>
        </Modal>
    );
};

export default ItemFormModal;

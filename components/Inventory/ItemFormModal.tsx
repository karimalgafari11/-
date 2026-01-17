
import React, { useState, useEffect } from 'react';
import Modal from '../Common/Modal';
import Button from '../UI/Button';
import { InventoryItem } from '../../types';
import { Save, Package } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

interface ItemFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: InventoryItem) => void;
    initialData?: InventoryItem | null;
}

const ItemFormModal: React.FC<ItemFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const { categories } = useInventory();

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
        specifications: ''
    };

    const [formData, setFormData] = useState(defaultForm);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                itemNumber: initialData.itemNumber,
                sku: initialData.sku,
                category: initialData.category,
                quantity: initialData.quantity,
                minQuantity: initialData.minQuantity,
                costPrice: initialData.costPrice,
                salePrice: initialData.salePrice,
                unit: initialData.unit,
                manufacturer: initialData.manufacturer,
                specifications: initialData.specifications || ''
            });
        } else {
            setFormData(defaultForm);
        }
    }, [initialData, isOpen]);

    const handleSubmit = () => {
        const item: InventoryItem = {
            id: initialData?.id || `ITEM-${Date.now()}`,
            ...formData
        };
        onSave(item);
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
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">التصنيف</label>
                        <select
                            className="w-full p-3 rounded-xl border border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white font-bold text-xs"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
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

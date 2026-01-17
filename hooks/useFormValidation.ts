import { useState, useCallback } from 'react';
import { validateForm } from '../utils/validators';

export const useFormValidation = <T extends Record<string, any>>(
    initialValues: T,
    validationRules: Record<keyof T, Array<(value: any) => string | null>>
) => {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

    const handleChange = useCallback((field: keyof T, value: any) => {
        setValues(prev => ({ ...prev, [field]: value }));

        // Validate on change if field was touched
        if (touched[field]) {
            const fieldErrors = validateForm({ [field]: value }, { [field]: validationRules[field] });
            setErrors(prev => ({ ...prev, [field]: fieldErrors[field as string] }));
        }
    }, [touched, validationRules]);

    const handleBlur = useCallback((field: keyof T) => {
        setTouched(prev => ({ ...prev, [field]: true }));

        // Validate on blur
        const fieldErrors = validateForm({ [field]: values[field] }, { [field]: validationRules[field] });
        setErrors(prev => ({ ...prev, [field]: fieldErrors[field as string] }));
    }, [values, validationRules]);

    const validate = useCallback((): boolean => {
        const newErrors = validateForm(values, validationRules);
        setErrors(newErrors as Partial<Record<keyof T, string>>);
        setTouched(
            Object.keys(validationRules).reduce((acc, key) => ({ ...acc, [key]: true }), {})
        );
        return Object.keys(newErrors).length === 0;
    }, [values, validationRules]);

    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    }, [initialValues]);

    return {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        validate,
        reset,
        setValues
    };
};

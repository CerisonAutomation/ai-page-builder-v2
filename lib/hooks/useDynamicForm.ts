/**
 * useDynamicForm Hook
 * 
 * Schema-driven form generation matching Sanity studio pattern.
 * Dynamically creates form fields based on block schema.
 * Handles validation, state management, and change tracking.
 */

import { useState, useCallback, useMemo } from 'react';
import { z } from 'zod';

// ============================================
// Types
// ============================================

export enum FieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  DATE = 'date',
  COLOR = 'color',
  IMAGE = 'image',
  RICH_TEXT = 'richText',
  OBJECT = 'object',
  ARRAY = 'array',
  REFERENCE = 'reference',
}

export interface FieldSchema {
  name: string;
  title: string;
  description?: string;
  type: FieldType;
  required?: boolean;
  defaultValue?: any;
  validation?: z.ZodSchema;
  options?: {
    list?: Array<{ value: any; label: string }>;
    layout?: 'grid' | 'dropdown';
    hotspot?: boolean; // For images
    focus?: boolean; // For images
  };
  fields?: FieldSchema[]; // For nested object/array types
  of?: FieldSchema[]; // For array items
}

export interface FormSchema {
  fields: FieldSchema[];
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isDirty: boolean;
  isValid: boolean;
}

export interface FormHelpers {
  getValue: (name: string) => any;
  setValue: (name: string, value: any) => void;
  setTouched: (name: string, touched: boolean) => void;
  setError: (name: string, error: string) => void;
  resetForm: () => void;
  getFieldProps: (name: string) => {
    value: any;
    onChange: (value: any) => void;
    onBlur: () => void;
    error?: string;
    touched: boolean;
  };
}

// ============================================
// useDynamicForm Hook
// ============================================

export function useDynamicForm(
  schema: FormSchema,
  initialValues?: Record<string, any>,
  onSubmit?: (values: Record<string, any>) => Promise<void>
): [FormState, FormHelpers] {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const defaults: Record<string, any> = {};

    schema.fields.forEach((field) => {
      defaults[field.name] =
        initialValues?.[field.name] ?? field.defaultValue ?? '';
    });

    return defaults;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Validate schema
  const validationSchema = useMemo(() => {
    const shape: Record<string, z.ZodSchema> = {};

    schema.fields.forEach((field) => {
      let validator: z.ZodSchema = z.any();

      switch (field.type) {
        case FieldType.TEXT:
          validator = z.string();
          break;
        case FieldType.TEXTAREA:
          validator = z.string();
          break;
        case FieldType.NUMBER:
          validator = z.number();
          break;
        case FieldType.BOOLEAN:
          validator = z.boolean();
          break;
        case FieldType.DATE:
          validator = z.date();
          break;
        case FieldType.COLOR:
          validator = z.string().regex(/^#[0-9A-F]{6}$/i);
          break;
        case FieldType.SELECT:
          validator = z.string();
          break;
        case FieldType.MULTISELECT:
          validator = z.array(z.string());
          break;
        default:
          validator = z.any();
      }

      if (field.validation) {
        validator = field.validation;
      }

      if (field.required) {
        validator = validator.refine((val) => val !== undefined && val !== null, {
          message: `${field.title} is required`,
        });
      } else {
        validator = validator.optional();
      }

      shape[field.name] = validator;
    });

    return z.object(shape);
  }, [schema]);

  // Validate field
  const validateField = useCallback(
    (name: string, value: any): string | undefined => {
      try {
        const fieldSchema = schema.fields.find((f) => f.name === name);
        if (!fieldSchema) return undefined;

        if (fieldSchema.validation) {
          fieldSchema.validation.parse(value);
        } else {
          validationSchema.pick({ [name]: true }).parse({ [name]: value });
        }

        return undefined;
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.errors[0]?.message || 'Invalid value';
        }
        return 'Invalid value';
      }
    },
    [schema, validationSchema]
  );

  // Handle value change
  const handleValueChange = useCallback(
    (name: string, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      setIsDirty(true);

      // Clear error if field is being fixed
      if (errors[name]) {
        const newError = validateField(name, value);
        if (!newError) {
          setErrors((prev) => {
            const next = { ...prev };
            delete next[name];
            return next;
          });
        }
      }
    },
    [errors, validateField]
  );

  // Handle blur
  const handleBlur = useCallback(
    (name: string) => {
      setTouched((prev) => ({ ...prev, [name]: true }));

      const error = validateField(name, values[name]);
      if (error) {
        setErrors((prev) => ({ ...prev, [name]: error }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }
    },
    [values, validateField]
  );

  // Get field props
  const getFieldProps = useCallback(
    (name: string) => ({
      value: values[name],
      onChange: (value: any) => handleValueChange(name, value),
      onBlur: () => handleBlur(name),
      error: errors[name],
      touched: touched[name],
    }),
    [values, errors, touched, handleValueChange, handleBlur]
  );

  // Reset form
  const resetForm = useCallback(() => {
    const defaults: Record<string, any> = {};
    schema.fields.forEach((field) => {
      defaults[field.name] = initialValues?.[field.name] ?? field.defaultValue ?? '';
    });
    setValues(defaults);
    setErrors({});
    setTouched({});
    setIsDirty(false);
  }, [schema, initialValues]);

  // Validate all
  const isValid = useMemo(() => {
    try {
      validationSchema.parse(values);
      return true;
    } catch {
      return false;
    }
  }, [values, validationSchema]);

  return [
    {
      values,
      errors,
      touched,
      isDirty,
      isValid,
    },
    {
      getValue: (name) => values[name],
      setValue: handleValueChange,
      setTouched: (name, t) => setTouched((prev) => ({ ...prev, [name]: t })),
      setError: (name, error) => setErrors((prev) => ({ ...prev, [name]: error })),
      resetForm,
      getFieldProps,
    },
  ];
}

// ============================================
// Field Component Factory
// ============================================

export interface FieldComponentProps {
  field: FieldSchema;
  value: any;
  onChange: (value: any) => void;
  onBlur: () => void;
  error?: string;
  touched: boolean;
}

/**
 * Render field component based on schema
 */
export function renderField(props: FieldComponentProps) {
  const { field, value, onChange, onBlur, error, touched } = props;

  const baseInputClasses =
    'w-full px-3 py-2 border rounded-md text-sm font-medium transition-colors ' +
    (error && touched
      ? 'border-red-500 bg-red-50'
      : 'border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500');

  switch (field.type) {
    case FieldType.TEXT:
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={field.title}
          className={baseInputClasses}
        />
      );

    case FieldType.TEXTAREA:
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={field.title}
          rows={4}
          className={baseInputClasses}
        />
      );

    case FieldType.NUMBER:
      return (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          onBlur={onBlur}
          className={baseInputClasses}
        />
      );

    case FieldType.BOOLEAN:
      return (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            onBlur={onBlur}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">{field.title}</span>
        </label>
      );

    case FieldType.SELECT:
      return (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={baseInputClasses}
        >
          <option value="">-- Select {field.title} --</option>
          {field.options?.list?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );

    case FieldType.COLOR:
      return (
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className="w-12 h-10 border border-slate-300 rounded-md cursor-pointer"
        />
      );

    case FieldType.DATE:
      return (
        <input
          type="date"
          value={value ? new Date(value).toISOString().split('T')[0] : ''}
          onChange={(e) => onChange(new Date(e.target.value))}
          onBlur={onBlur}
          className={baseInputClasses}
        />
      );

    default:
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={baseInputClasses}
        />
      );
  }
}

// ============================================
// Form Field Component
// ============================================

export function FormField({ field, ...props }: FieldComponentProps) {
  return (
    <div className="mb-4">
      {field.type !== FieldType.BOOLEAN && (
        <label className="block text-sm font-semibold mb-1.5">
          {field.title}
          {field.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {field.description && (
        <p className="text-xs text-slate-500 mb-2">{field.description}</p>
      )}

      {renderField({ field, ...props })}

      {props.error && props.touched && (
        <p className="text-xs text-red-600 mt-1">{props.error}</p>
      )}
    </div>
  );
}
